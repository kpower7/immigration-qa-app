'use client';

import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen gradient-hero">
      <div className="container py-6 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-2xl">Hackathon<span className="text-cyan-400">AI</span></Link>
        <div className="text-gray-300 flex gap-6">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <Link href="/voice-oss" className="hover:text-cyan-400 transition-colors">OSS Chat</Link>
        </div>
      </div>

      <main className="container pb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Demo moved to OSS Chat</h1>
        <p className="text-gray-300 mb-6">This demo has moved. Try the new OSS text chat backed by Modal GPT‑OSS‑120B.</p>
        <Link
          href="/voice-oss"
          className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold"
        >
          Go to OSS Chat
        </Link>
      </main>
    </div>
  );
}
