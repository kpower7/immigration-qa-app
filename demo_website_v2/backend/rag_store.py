from __future__ import annotations

import os
import pickle
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .config import settings


@dataclass
class DocChunk:
    text: str
    source: str
    title: str | None = None
    url: str | None = None
    section: str | None = None


class RagStore:
    def __init__(self, vectorizer: TfidfVectorizer, matrix, meta: List[DocChunk]):
        self.vectorizer = vectorizer
        self.matrix = matrix
        self.meta = meta

    def save(self, path: str | os.PathLike[str]) -> None:
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with p.open("wb") as f:
            pickle.dump({
                "vectorizer": self.vectorizer,
                "matrix": self.matrix,
                "meta": self.meta,
            }, f)

    @staticmethod
    def load(path: str | os.PathLike[str]) -> "RagStore":
        with open(path, "rb") as f:
            obj = pickle.load(f)
        return RagStore(obj["vectorizer"], obj["matrix"], obj["meta"])  # type: ignore[no-any-return]

    @staticmethod
    def build_from_corpus(corpus_dir: str | os.PathLike[str]) -> "RagStore":
        corpus_path = Path(corpus_dir)
        texts: List[str] = []
        meta: List[DocChunk] = []
        for p in corpus_path.rglob("*.txt"):
            try:
                txt = p.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue
            if not txt.strip():
                continue
            texts.append(txt)
            meta.append(DocChunk(text=txt[:5000], source=str(p), title=p.stem))
        if not texts:
            # Build a tiny default corpus so the system works out of the box
            default_text = (
                "USCIS Policy Manual provides policy and procedural guidance for all immigration benefits. "
                "Always verify details on official USCIS pages."
            )
            texts = [default_text]
            meta = [DocChunk(text=default_text, source="default")] 
        vec = TfidfVectorizer(stop_words="english", max_features=200000)
        mat = vec.fit_transform(texts)
        return RagStore(vec, mat, meta)

    def search(self, query: str, top_k: int) -> List[Tuple[DocChunk, float]]:
        qv = self.vectorizer.transform([query])
        sims = cosine_similarity(qv, self.matrix)[0]
        idxs = sims.argsort()[::-1][:top_k]
        return [(self.meta[i], float(sims[i])) for i in idxs]


_STORE_SINGLETON: RagStore | None = None


def get_store() -> RagStore:
    global _STORE_SINGLETON
    if _STORE_SINGLETON is not None:
        return _STORE_SINGLETON

    index_path = settings.RAG_INDEX_PATH
    try:
        if os.path.exists(index_path):
            _STORE_SINGLETON = RagStore.load(index_path)
            return _STORE_SINGLETON
    except Exception:
        # fall back to building from corpus
        pass

    corpus_dir = Path("backend/rag/corpus")
    store = RagStore.build_from_corpus(str(corpus_dir))
    try:
        store.save(index_path)
    except Exception:
        # best-effort save
        pass
    _STORE_SINGLETON = store
    return store


def retrieve_context(question: str, top_k: int | None = None) -> List[Dict[str, Any]]:
    store = get_store()
    k = int(top_k or settings.RAG_TOP_K)
    hits = store.search(question, k)
    out: List[Dict[str, Any]] = []
    for meta, score in hits:
        out.append({
            "snippet": meta.text[:1200],
            "source": meta.source,
            "title": meta.title,
            "url": meta.url,
            "section": meta.section,
            "score": score,
        })
    return out
