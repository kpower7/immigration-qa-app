'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <a href="#demos" className="hover:text-cyan-400 transition-colors">Demos</a>
          <Link href="/voice" className="hover:text-cyan-400 transition-colors">Voice</Link>
          <Link href="/immigration" className="hover:text-cyan-400 transition-colors">Immigration</Link>
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
            <a href="#demos" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">Demos</a>
            <Link href="/voice" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">Voice</Link>
            <Link href="/immigration" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">Immigration</Link>
            <a href="mailto:kevpower@mit.edu" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">Contact</a>
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="relative z-10 container pt-12 pb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">Immigration Voice Assistant</h1>
        <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
          USCIS Policy Navigator with voice. Answers cite the USCIS Policy Manual and Forms Instructions, and can fetch recent news.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/immigration" className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all">Open Immigration Demo</Link>
        </div>
      </header>

      {/* Immigration Highlight Section */}
      <section className="relative z-10 container py-14">
        <h2 className="text-3xl font-bold text-white text-center mb-10">USCIS Policy Navigator</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">What it does</h3>
            <ul className="text-gray-300 list-disc list-inside space-y-1">
              <li>Two-way voice via ElevenLabs</li>
              <li>RAG over USCIS Policy Manual + Forms Instructions</li>
              <li>News lookups for recent updates</li>
              <li>Context panel with citations and links</li>
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">Voice Betting Analyst</h3>
            <p className="text-gray-300">Real-time ElevenLabs voice agent with tool calling.</p>
            <div className="mt-4">
              <Link href="/voice" className="px-6 py-3 rounded-lg border-2 border-cyan-400 text-cyan-400 font-semibold hover:bg-cyan-400 hover:text-white transition-all">Open Voice Demo</Link>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">USCIS Policy Navigator</h3>
            <p className="text-gray-300">Conversational agent for USCIS Policy Manual + Forms Instructions with citations.</p>
            <div className="mt-4">
              <Link href="/immigration" className="px-6 py-3 rounded-lg border-2 border-cyan-400 text-cyan-400 font-semibold hover:bg-cyan-400 hover:text-white transition-all">Open Immigration Demo</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="relative z-10 container py-14">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Architecture</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">Stack</h3>
            <ul className="text-gray-300 list-disc list-inside space-y-1">
              <li>Next.js + Tailwind UI at <code>/voice</code></li>
              <li>ElevenLabs Agent (GPT‑5) real‑time voice</li>
              <li>Netlify Functions: tool proxy + WS broker</li>
              <li>FastAPI backend: schedule, stats, news, YouTube</li>
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">Data & Tools</h3>
            <ul className="text-gray-300 list-disc list-inside space-y-1">
              <li>USCIS Policy Manual + Forms Instructions</li>
              <li>NewsAPI for immigration policy updates</li>
              <li>Forms Finder tool with official links</li>
              <li>Event-driven UI feed for citations/context</li>
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">Security</h3>
            <ul className="text-gray-300 list-disc list-inside space-y-1">
              <li>Token‑secured calls via Netlify Functions</li>
              <li>Secrets in env: TOOL_TOKEN, MODAL_WEB_URL, NEWS_API_KEY</li>
              <li>Backend URL hidden behind the proxy</li>
              <li>Session-aware UI events; no client secrets</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-blue-500/20">
        <div className="container py-8 text-sm text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Kevin Power • All Rights Reserved</p>
          <div className="flex gap-4">
            <a className="hover:text-cyan-300" href="/voice">Voice</a>
            <a className="hover:text-cyan-300" href="/immigration">Immigration</a>
            <a className="hover:text-cyan-300" href="mailto:kevpower@mit.edu">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
