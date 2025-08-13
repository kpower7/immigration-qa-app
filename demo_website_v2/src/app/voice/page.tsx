"use client";

import Link from "next/link";
import React from "react";

export default function VoicePage() {
  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      <nav className="relative z-10 container py-6 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-2xl">
          Hackathon<span className="text-cyan-400">AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <Link href="/voice-oss" className="hover:text-cyan-400 transition-colors">OSS Chat</Link>
          <Link href="/immigration-qa" className="hover:text-cyan-400 transition-colors">USCIS Q&A</Link>
        </div>
      </nav>
      <main className="relative z-10 container py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Voice demo deprecated</h1>
        <p className="text-gray-300 mb-6">The ElevenLabs voice experience has been removed. Please use the new OSS text chat.</p>
        <Link href="/voice-oss" className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold">Go to OSS Chat</Link>
      </main>
    </div>
  );
}
