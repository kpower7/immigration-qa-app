"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";

type Citation = {
  id: number;
  source: string;
  title?: string | null;
  url?: string | null;
  score?: number | null;
  snippet?: string | null;
};

export default function ImmigrationQA() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [topK, setTopK] = useState(4);

  const ask = useCallback(async () => {
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setCitations([]);
    try {
      const resp = await fetch("/.netlify/functions/immigrationQa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, top_k: topK }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Request failed");
      setAnswer(data?.answer || "");
      setCitations(Array.isArray(data?.citations) ? data.citations : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [question, topK]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void ask();
    }
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/5 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/5 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 container py-6 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-2xl">
          Hackathon<span className="text-cyan-400">AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <Link href="/mlb" className="hover:text-cyan-400 transition-colors">MLB</Link>
          <Link href="/voice-oss" className="hover:text-cyan-400 transition-colors">OSS Chat</Link>
          <Link href="/immigration-qa" className="hover:text-cyan-400 transition-colors">USCIS Q&A</Link>
          <a href="mailto:kevpower@mit.edu" className="hover:text-cyan-400 transition-colors">Contact</a>
        </div>
        <button
          aria-label="Toggle mobile menu"
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(v => !v)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden relative z-10 border-t border-blue-500/20 bg-slate-900/95">
          <div className="container py-4 flex flex-col gap-4">
            <Link href="/mlb" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">MLB</Link>
            <Link href="/voice-oss" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">OSS Chat</Link>
            <Link href="/immigration-qa" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">USCIS Q&A</Link>
            <a href="mailto:kevpower@mit.edu" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">Contact</a>
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="relative z-10 container pt-12 pb-4 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
          USCIS Policy Navigator (Q&A)
        </h1>
        <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
          Ask questions about the USCIS Policy Manual and Forms Instructions. Answers include citations.
        </p>
        <p className="mt-3 text-cyan-300 font-semibold text-sm">Educational information only; not legal advice.</p>
      </header>

      <section className="relative z-10 container py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKey}
              rows={3}
              placeholder="e.g., Am I eligible for STEM OPT and what evidence is needed?"
              className="flex-1 resize-none rounded bg-slate-900/70 text-gray-100 p-3 outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <div className="w-28">
              <label className="block text-xs text-gray-400 mb-1">Top K</label>
              <input
                type="number"
                min={1}
                max={10}
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-full rounded bg-slate-900/70 text-gray-100 p-2 outline-none"
              />
            </div>
          </div>
          <div>
            <button
              onClick={ask}
              disabled={loading}
              className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50"
            >
              {loading ? "Asking..." : "Ask"}
            </button>
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          {answer && (
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Answer</h3>
              <div className="whitespace-pre-wrap text-gray-100">{answer}</div>
            </div>
          )}
        </div>
        <aside className="card p-6 space-y-3">
          <h3 className="text-lg font-semibold text-cyan-300">Citations</h3>
          {citations.length === 0 && (
            <div className="text-sm text-gray-400">No citations yet.</div>
          )}
          <ul className="space-y-3">
            {citations.map((c) => (
              <li key={c.id} className="text-sm text-gray-200">
                <div className="font-semibold">[{c.id}] {c.title || c.source}</div>
                {c.snippet && <div className="mt-1 text-gray-400 whitespace-pre-wrap">{c.snippet}</div>}
                <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                  {typeof c.score === "number" && <span>score: {c.score.toFixed(3)}</span>}
                  {c.url && (
                    <a className="text-cyan-300 hover:underline" href={c.url} target="_blank" rel="noreferrer">open</a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-blue-500/20">
        <div className="container py-8 text-sm text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Kevin Power • All Rights Reserved</p>
          <div className="flex gap-4">
            <a className="hover:text-cyan-300" href="/voice-oss">OSS Chat</a>
            <a className="hover:text-cyan-300" href="/immigration-qa">USCIS Q&A</a>
            <a className="hover:text-cyan-300" href="mailto:kevpower@mit.edu">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
