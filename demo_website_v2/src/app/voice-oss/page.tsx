"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export default function VoiceOssPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", content: "You are a helpful assistant." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const visibleMessages = useMemo(() => messages.filter(m => m.role !== "system"), [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setError(null);
    const next = [...messages, { role: "user", content: text } as ChatMessage];
    setMessages(next);
    setLoading(true);
    try {
      const resp = await fetch("/.netlify/functions/ossChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Request failed");
      const assistantText: string = data?.text ?? "";
      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
      listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [input, messages]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
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
          OSS Chat (Modal + GPT‑OSS‑120B)
        </h1>
        <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
          Text chat backed by Modal-hosted GPT-OSS with optional RAG.
        </p>
      </header>

      {/* Chat */}
      <section className="relative z-10 container py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-0 lg:col-span-2 flex flex-col max-h-[70vh]">
          <div className="px-6 py-4 border-b border-blue-500/20 text-cyan-300 font-semibold">Conversation</div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {visibleMessages.length === 0 && (
              <div className="text-gray-400 text-sm">Say hello to start chatting.</div>
            )}
            {visibleMessages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div className={
                  "inline-block px-4 py-2 rounded-lg max-w-[90%] whitespace-pre-wrap " +
                  (m.role === "user" ? "bg-cyan-600 text-white" : "bg-slate-800 text-gray-100")
                }>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={listEndRef} />
          </div>
          <div className="p-4 border-t border-blue-500/20">
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={2}
                placeholder="Type your message..."
                className="flex-1 resize-none rounded bg-slate-900/70 text-gray-100 p-3 outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={send}
                disabled={loading}
                className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
            {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
          </div>
        </div>
        <aside className="card p-6 space-y-3">
          <h3 className="text-lg font-semibold text-cyan-300">About</h3>
          <p className="text-sm text-gray-300">
            This page uses a Netlify Function proxy to call the FastAPI backend at <code>/ai/chat</code>,
            which in turn calls a Modal-hosted GPT-OSS endpoint.
          </p>
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
