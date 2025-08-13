"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

// Types for UI events and payloads mirrored from backend `UIAction` model
type FormPayload = {
  form_id?: string;
  page_url?: string;
  instructions_url?: string;
};

type VideoPayload = {
  video_id?: string;
  url?: string;
  title?: string;
};

type NewsItem = {
  title?: string;
  url: string;
  source?: string;
};

type UIAction =
  | { type: "open_form"; payload: FormPayload }
  | { type: "embed_video"; payload: VideoPayload }
  | { type: "show_news"; payload: NewsItem | NewsItem[] };

type UIEvent = {
  ts: string;
  session_id: string;
  action: UIAction;
  tool_token?: string;
};

type DisplayForm = FormPayload & { ts: string };
type DisplayVideo = VideoPayload & { ts: string };
type DisplayNews = NewsItem & { ts: string };

// Legacy ElevenLabs voice env removed; this page now points users to text chat.

export default function ImmigrationPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sessionId] = useState<string>(() => (globalThis.crypto?.randomUUID?.() || `sess_${Math.random().toString(36).slice(2)}`));
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [polling, setPolling] = useState<boolean>(true);

  // Helper: fetch UI feed once
  const refreshFeed = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/uiFeed?session_id=${encodeURIComponent(sessionId)}`, {
        headers: { "Cache-Control": "no-store" },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { events?: UIEvent[] };
      setEvents(data?.events || []);
    } catch {
      // swallow for now
    }
  }, [sessionId]);

  // Helper: call a Netlify tool function with session header
  const callTool = useCallback(async (fnPath: string, body: Record<string, unknown>) => {
    const resp = await fetch(fnPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass session to Netlify tools proxy; it will inject as body.session_id
        "x-ui-session-id": sessionId,
      },
      body: JSON.stringify(body || {}),
    });
    // Regardless of success/failure, try refreshing feed once to pick up any UI events
    await refreshFeed();
    return resp;
  }, [sessionId, refreshFeed]);

  const callImmigrationNews = useCallback(async (query: string) => {
    return callTool("/.netlify/functions/toolsImmigrationNews", { query, days_back: 14, max_results: 10 });
  }, [callTool]);

  const callFormsFinder = useCallback(async (formId: string) => {
    return callTool("/.netlify/functions/toolsFormsFinder", { form_id: formId });
  }, [callTool]);

  // Poll UI feed (every 2s) for dynamic UI events pushed by the agent via toolsUiEvent
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let mounted = true;
    const poll = async () => {
      try {
        const res = await fetch(`/.netlify/functions/uiFeed?session_id=${encodeURIComponent(sessionId)}`, {
          headers: { "Cache-Control": "no-store" },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { events?: UIEvent[] };
        if (!mounted) return;
        setEvents(data?.events || []);
      } catch {
        // swallow for now
      }
    };
    // kick off
    poll();
    if (polling) {
      timer = setInterval(poll, 2000);
    }
    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [sessionId, polling]);

  // Ensure ElevenLabs widget is inside our chat container and not floating
  useEffect(() => {
    let raf: number | undefined;
    const placeWidget = () => {
      const container = document.getElementById("my-chat-container");
      if (!container) {
        raf = requestAnimationFrame(placeWidget);
        return;
      }
      // Prefer inline element inside the container
      const inline = container.querySelector("elevenlabs-convai, elevenlabs-conversational-ai") as HTMLElement | null;
      if (inline) {
        inline.style.position = "relative";
        inline.style.bottom = "";
        inline.style.right = "";
        inline.style.margin = "0";
        inline.style.width = "100%";
        inline.style.height = "100%";
        return; // Already in place
      }
      // Fallback: grab any existing floating instance and move it into the container
      const floating = document.querySelector("elevenlabs-convai, elevenlabs-conversational-ai") as HTMLElement | null;
      if (floating && !container.contains(floating)) {
        floating.style.position = "relative";
        floating.style.bottom = "";
        floating.style.right = "";
        floating.style.margin = "0";
        floating.style.width = "100%";
        floating.style.height = "100%";
        container.appendChild(floating);
        return;
      }
      raf = requestAnimationFrame(placeWidget);
    };
    raf = requestAnimationFrame(placeWidget);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [agentId]);

  const parsed = useMemo(() => {
    // Normalize events by type for rendering
    const forms: DisplayForm[] = [];
    const videos: DisplayVideo[] = [];
    const news: DisplayNews[] = [];
    for (const e of events) {
      const a = e?.action;
      if (!a) continue;
      if (a.type === "open_form") forms.push({ ...(a.payload as FormPayload), ts: e.ts });
      if (a.type === "embed_video") videos.push({ ...(a.payload as VideoPayload), ts: e.ts });
      if (a.type === "show_news") {
        const payload = a.payload as NewsItem | NewsItem[];
        const items = Array.isArray(payload) ? payload : [payload];
        for (const it of items) news.push({ ...it, ts: e.ts });
      }
    }
    return { forms, videos, news };
  }, [events]);

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/5 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/5 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Navbar (scoped to Immigration demo) */}
      <nav className="relative z-10 container py-6 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-2xl">
          Hackathon<span className="text-cyan-400">AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <Link href="/immigration-qa" className="hover:text-cyan-400 transition-colors">USCIS Q&A</Link>
          <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
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
            <Link href="/immigration-qa" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">USCIS Q&A</Link>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">About</a>
            <a href="mailto:kevpower@mit.edu" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">Contact</a>
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="relative z-10 container pt-12 pb-8 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
          Immigration Voice demo deprecated
        </h1>
        <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
          Please use the new USCIS Q&A text chat backed by Modal GPT‑OSS‑120B.
        </p>
        <div className="mt-6">
          <Link href="/immigration-qa" className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold">Open USCIS Q&amp;A</Link>
        </div>
      </header>

      {/* Main grid: content + context sidebar */}
      <section className="relative z-10 container py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: About and Widget */}
        <div className="lg:col-span-2 space-y-6">
          <section id="about" className="card p-6">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">How it works</h3>
            <ul className="text-gray-300 list-disc list-inside space-y-1">
              <li>Text chat via Modal GPT‑OSS‑120B</li>
              <li>Built-in RAG on USCIS Policy Manual + Forms Instructions</li>
              <li>On-demand NewsAPI when you ask for recent updates</li>
              <li>Section-level citations and links</li>
            </ul>
          </section>
          {/* Removed quick demo and tips boxes for a cleaner layout */}
          {/* ElevenLabs chat widget */}
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-500/20">
              <h3 className="text-lg font-semibold text-cyan-300">Chat</h3>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Tips</h3>
              <ul className="text-gray-300 list-disc list-inside space-y-1">
                <li>Use the USCIS Q&A text chat to ask for news or specific forms</li>
                <li>Click Refresh in the Context panel to update on demand</li>
                <li>Enable polling if you prefer automatic updates</li>
              </ul>
            </div>
          </section>
          <section className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Good queries</h3>
              <ul className="text-gray-300 list-disc list-inside space-y-1">
                <li>“Am I eligible for STEM OPT and what evidence is needed?”</li>
                <li>“Can I travel while my I-485 is pending?”</li>
                <li>“Recent updates on OPT in the last 2 weeks?”</li>
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Transparency</h3>
              <ul className="text-gray-300 list-disc list-inside space-y-1">
                <li>Policy answers include citations and URLs</li>
                <li>News answers include headlines and links</li>
                <li>Always confirm details on official USCIS pages</li>
              </ul>
            </div>
          </section>
          {/* Deprecated: Voice widget removed */}
          <div className="card p-6 text-center">
            <p className="text-gray-300 mb-3">This legacy voice page has been removed.</p>
            <Link href="/immigration-qa" className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold">Go to USCIS Q&amp;A</Link>
          </div>
        </div>
        {/* Right: Context sidebar reacting to UI events */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-cyan-300">Context</h3>
              <div className="flex items-center gap-3">
                <button className="text-xs text-gray-400 hover:text-cyan-300" onClick={refreshFeed}>
                  Refresh
                </button>
                <button className="text-xs text-gray-400 hover:text-cyan-300" onClick={() => setPolling(p => !p)}>
                  {polling ? "Pause" : "Auto"}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">The assistant can add items here during the conversation.</p>
          </div>

          {/* Forms */}
          {parsed.forms.length > 0 && (
            <div className="card p-6">
              <h4 className="text-md font-semibold text-cyan-300 mb-3">Forms</h4>
              <ul className="space-y-3">
                {parsed.forms.map((f, idx) => (
                  <li key={idx} className="text-gray-200">
                    <div className="font-semibold">{f.form_id || "USCIS Form"}</div>
                    <div className="text-sm break-words">
                      {f.page_url && (
                        <a className="text-cyan-300 hover:underline" href={f.page_url} target="_blank" rel="noreferrer">Form page</a>
                      )}
                      {f.instructions_url && (
                        <span className="mx-2 text-gray-500">•</span>
                      )}
                      {f.instructions_url && (
                        <a className="text-cyan-300 hover:underline" href={f.instructions_url} target="_blank" rel="noreferrer">Instructions (PDF)</a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Videos */}
          {parsed.videos.length > 0 && (
            <div className="card p-6">
              <h4 className="text-md font-semibold text-cyan-300 mb-3">Videos</h4>
              <div className="space-y-4">
                {parsed.videos.map((v, idx) => (
                  <div key={idx}>
                    {v.video_id ? (
                      <iframe
                        className="w-full aspect-video rounded"
                        src={`https://www.youtube.com/embed/${v.video_id}`}
                        title={v.title || "Video"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <a className="text-cyan-300 hover:underline" href={v.url} target="_blank" rel="noreferrer">{v.title || v.url}</a>
                    )}
                    {v.title && <div className="mt-2 text-sm text-gray-300">{v.title}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* News */}
          {parsed.news.length > 0 && (
            <div className="card p-6">
              <h4 className="text-md font-semibold text-cyan-300 mb-3">News</h4>
              <ul className="space-y-3">
                {parsed.news.map((n, idx) => (
                  <li key={idx}>
                    <a className="text-cyan-300 hover:underline" href={n.url} target="_blank" rel="noreferrer">{n.title || n.url}</a>
                    {n.source && <div className="text-xs text-gray-400">{n.source}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-blue-500/20">
        <div className="container py-8 text-sm text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p> {new Date().getFullYear()} Kevin Power • All Rights Reserved</p>
          <div className="flex gap-4">
            <a className="hover:text-cyan-300" href="/immigration-qa">USCIS Q&amp;A</a>
            <a className="hover:text-cyan-300" href="mailto:kevpower@mit.edu">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
