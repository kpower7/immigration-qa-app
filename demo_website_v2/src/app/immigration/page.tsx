"use client";

import React, { useState } from "react";
import Link from "next/link";
import Script from "next/script";

// Optional public agent ID for the ElevenLabs widget/SDK. Configure a dedicated
// Immigration agent in ElevenLabs with USCIS Policy Manual + Forms Instructions
// as knowledge sources, and the NewsAPI tool enabled (via your Netlify Function
// proxy to the backend /tools/news you already have).
const PUBLIC_AGENT_ID = process.env.NEXT_PUBLIC_ELEVEN_AGENT_ID;

export default function ImmigrationPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const agentId = PUBLIC_AGENT_ID || "agent_5401k27xr572e2bavxz9nm9vztd1"; // replace via env in production

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/5 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/5 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Navbar (scoped to Immigration demo) */}
      <nav className="relative z-10 container py-6 flex items-center justify-between">
        <Link href="/immigration" className="text-white font-bold text-2xl">
          Hackathon<span className="text-cyan-400">AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <Link href="/immigration" className="hover:text-cyan-400 transition-colors">Home</Link>
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
            <Link href="/immigration" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">Home</Link>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">About</a>
            <a href="mailto:kevpower@mit.edu" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">Contact</a>
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="relative z-10 container pt-12 pb-8 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
          USCIS Policy Navigator (Voice)
        </h1>
        <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
          Ask questions about the USCIS Policy Manual and Forms Instructions. Answers cite sections and provide links. For recent updates (e.g., OPT/STEM OPT), the assistant can search trusted news sources.
        </p>
        <p className="mt-3 text-cyan-300 font-semibold">This is educational information, not legal advice.</p>
      </header>

      {/* About */}
      <section id="about" className="relative z-10 container py-10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">How it works</h3>
            <ul className="text-gray-300 list-disc list-inside space-y-1">
              <li>Two-way voice via ElevenLabs</li>
              <li>Built-in RAG on USCIS Policy Manual + Forms Instructions</li>
              <li>On-demand NewsAPI when you ask for recent updates</li>
              <li>Section-level citations and links</li>
            </ul>
          </div>
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
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-blue-500/20">
        <div className="container py-8 text-sm text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Kevin Power • All Rights Reserved</p>
          <div className="flex gap-4">
            <a className="hover:text-cyan-300" href="/immigration">Immigration</a>
            <a className="hover:text-cyan-300" href="mailto:kevpower@mit.edu">Contact</a>
          </div>
        </div>
      </footer>

      {/* ElevenLabs widget (agent must be configured in console with RAG + news tool) */}
      <Script src="https://unpkg.com/@elevenlabs/convai-widget-embed" strategy="afterInteractive" />
      {/* @ts-expect-error - custom element from external script */}
      <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
    </div>
  );
}
