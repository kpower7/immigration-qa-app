from __future__ import annotations

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Settings:
    """Lightweight settings loader.
    Reads from environment variables. python-dotenv will load a .env if called by the app.
    """

    NEWS_API_KEY: str | None = os.getenv("NEWS_API_KEY")
    YOUTUBE_API_KEY: str | None = os.getenv("YOUTUBE_API_KEY")
    TOOL_TOKEN: str | None = os.getenv("TOOL_TOKEN")
    # Modal OSS LLM endpoint and defaults
    MODAL_WEB_URL: str | None = os.getenv("MODAL_WEB_URL")
    DEFAULT_OSS_MODEL: str = os.getenv("DEFAULT_OSS_MODEL") or "gpt-oss-120b"
    # RAG configuration
    RAG_INDEX_PATH: str = os.getenv("RAG_INDEX_PATH") or "backend/rag/index.pkl"
    RAG_TOP_K: int = int(os.getenv("RAG_TOP_K") or "4")

    # Provide both UPPER and lower-case convenience attributes
    @property
    def news_api_key(self) -> str | None:
        return self.NEWS_API_KEY

    @property
    def youtube_api_key(self) -> str | None:
        return self.YOUTUBE_API_KEY


settings = Settings()
