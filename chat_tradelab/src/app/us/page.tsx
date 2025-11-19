"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import VoiceChat from "@/components/VoiceChat";
import ContextSidebar from "@/components/ContextSidebar";
import { getBotById } from "@/config/bots";
import type { UIEvent, ParsedEvents } from "@/types/ui-events";

export default function USCustomsPage() {
  // Bot configuration
  const botConfig = getBotById("us");
  if (!botConfig) throw new Error("US bot configuration not found");

  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sessionId] = useState<string>(() => 
    globalThis.crypto?.randomUUID?.() || `sess_${Math.random().toString(36).slice(2)}`
  );
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [polling, setPolling] = useState<boolean>(true);

  // Fetch UI feed once
  const refreshFeed = useCallback(async () => {
    try {
      const res = await fetch(
        `/.netlify/functions/uiFeed?session_id=${encodeURIComponent(sessionId)}&country=${botConfig.countryCode}`,
        { headers: { "Cache-Control": "no-store" } }
      );
      if (!res.ok) return;
      const data = (await res.json()) as { events?: UIEvent[] };
      setEvents(data?.events || []);
    } catch (err) {
      console.error("Failed to fetch UI feed:", err);
    }
  }, [sessionId, botConfig.countryCode]);

  // Poll UI feed every 2s for dynamic updates
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let mounted = true;

    const poll = async () => {
      try {
        const res = await fetch(
          `/.netlify/functions/uiFeed?session_id=${encodeURIComponent(sessionId)}&country=${botConfig.countryCode}`,
          { headers: { "Cache-Control": "no-store" } }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { events?: UIEvent[] };
        if (!mounted) return;
        setEvents(data?.events || []);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll(); // Initial fetch
    if (polling) {
      timer = setInterval(poll, 2000);
    }

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [sessionId, polling, botConfig.countryCode]);

  // Parse events by type
  const parsedEvents: ParsedEvents = useMemo(() => {
    const documents = [];
    const videos = [];
    const news = [];

    for (const e of events) {
      const a = e?.action;
      if (!a) continue;

      if (a.type === "show_document") {
        documents.push({ ...a.payload, ts: e.ts });
      } else if (a.type === "embed_video") {
        videos.push({ ...a.payload, ts: e.ts });
      } else if (a.type === "show_news") {
        const items = Array.isArray(a.payload) ? a.payload : [a.payload];
        for (const item of items) news.push({ ...item, ts: e.ts });
      }
    }

    return { documents, videos, news };
  }, [events]);

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/5 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/5 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "700ms" }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 container py-6 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-2xl">
          The Trade <span className="text-secondary-400">Lab</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <a href="https://learn.thetradelab.ai" className="hover:text-secondary-400 transition-colors">Learn</a>
          <a href="https://thetradelab.ai" className="hover:text-secondary-400 transition-colors">About</a>
          <a href="https://thetradelab.ai/contact" className="hover:text-secondary-400 transition-colors">Contact</a>
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
        <div className="md:hidden relative z-10 border-t border-white/20 bg-slate-900/95">
          <div className="container py-4 flex flex-col gap-4">
            <a href="https://learn.thetradelab.ai" className="text-gray-300 hover:text-secondary-400">Learn</a>
            <a href="https://thetradelab.ai" className="text-gray-300 hover:text-secondary-400">About</a>
            <a href="https://thetradelab.ai/contact" className="text-gray-300 hover:text-secondary-400">Contact</a>
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="relative z-10 container pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-5xl">{botConfig.flagEmoji}</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
          {botConfig.displayName}
        </h1>
        <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
          {botConfig.shortTagline}
        </p>
        <p className="mt-2 text-sm text-secondary-400">
          Multi-lingual support: {botConfig.primaryLanguages.join(", ")}
        </p>
      </header>

      {/* Main grid: content + context sidebar */}
      <section className="relative z-10 container py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: About and Voice Chat */}
        <div className="lg:col-span-2 space-y-6">
          {/* How it works */}
          <section id="about" className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-400 mb-3">How it works</h3>
            <ul className="text-gray-300 list-disc list-inside space-y-2">
              <li>Real-time voice chat powered by ElevenLabs AI</li>
              <li>Ask questions in English or Spanish</li>
              <li>Get instant answers with document references</li>
              <li>Automatic context updates with relevant regulations</li>
            </ul>
          </section>

          {/* Voice Chat */}
          <VoiceChat
            agentId={botConfig.elevenLabsAgentId}
            sessionId={sessionId}
            countryCode={botConfig.countryCode}
          />

          {/* Topics Covered */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-400 mb-3">Topics Covered</h3>
              <ul className="text-gray-300 list-disc list-inside space-y-1 text-sm">
                <li>HTS classification guidance</li>
                <li>Customs valuation methods</li>
                <li>Entry documentation requirements</li>
                <li>Duty rates and preferential programs</li>
                <li>PGA regulations (FDA, EPA, etc.)</li>
                <li>Recent regulatory updates</li>
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-400 mb-3">Example Questions</h3>
              <ul className="text-gray-300 list-disc list-inside space-y-1 text-sm">
                <li>"What's the HTS code for steel pipes?"</li>
                <li>"How is transaction value calculated?"</li>
                <li>"What documents are needed for textiles?"</li>
                <li>"Recent updates on Section 301 tariffs?"</li>
                <li>"FDA requirements for medical devices?"</li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="card p-6 bg-accent-900/20 border-accent-500/30">
            <h3 className="text-lg font-semibold text-accent-400 mb-2">⚠️ Important Disclaimer</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              This AI assistant provides <strong>educational information only</strong> based on publicly available 
              US customs regulations. It is <strong>not legal advice</strong> and should not be treated as official 
              customs guidance or rulings. For official determinations, binding rulings, or legal advice, consult 
              a licensed customs broker or attorney. Always verify critical information with official CBP resources.
            </p>
          </div>

          {/* SEO Content Section */}
          <div className="card p-8 prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-white mb-4">US Customs Regulations AI Assistant</h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              Navigate the complex world of United States customs regulations with our AI-powered assistant. 
              Whether you're an importer, customs broker, freight forwarder, or trade compliance professional, 
              get instant answers to your questions about US customs procedures, tariff classification, and 
              regulatory requirements.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Harmonized Tariff Schedule (HTS) Classification</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Accurate HTS classification is critical for determining duty rates, identifying applicable regulations, 
              and ensuring trade compliance. Our AI assistant helps you understand classification principles, 
              navigate the HTS structure, and identify the correct codes for your imported goods. Ask about 
              General Rules of Interpretation (GRI), Section and Chapter notes, or specific product classifications.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Customs Valuation & Transaction Value</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Proper customs valuation determines the dutiable value of imported merchandise. Learn about transaction 
              value methodology, permissible additions and deductions, related-party transactions, assists, royalties, 
              and alternative valuation methods. Get guidance on 19 CFR Part 152 and valuation documentation requirements.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Entry Documentation & Compliance</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Understanding entry requirements is essential for smooth customs clearance. Ask about entry types 
              (consumption, warehouse, TIB), required documentation (commercial invoice, packing list, bill of lading), 
              CBP forms (CBP Form 3461, 7501), bonds, and entry summary filing deadlines. Learn about ACE filing 
              requirements and electronic data transmission.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Partner Government Agencies (PGA)</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Many imports require compliance with regulations from agencies beyond CBP, including FDA (food, drugs, 
              cosmetics, medical devices), EPA (pesticides, toxic substances), USDA (plants, animals, agricultural 
              products), CPSC (consumer products), DOT (vehicles, transportation), and others. Get guidance on PGA 
              requirements, import permits, and coordination between agencies.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Trade Programs & Duty Relief</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Explore preferential trade programs and duty relief opportunities, including USMCA (formerly NAFTA), 
              Free Trade Agreements (FTAs), Generalized System of Preferences (GSP), drawback programs, foreign 
              trade zones (FTZ), temporary importation under bond (TIB), and other duty mitigation strategies.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Recent Regulatory Updates & News</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Stay informed about recent changes to US customs regulations, CBP announcements, Federal Register 
              notices, CSMS messages, tariff modifications (including Section 301, 232 steel/aluminum tariffs), 
              forced labor enforcement (UFLPA), and other trade policy developments affecting importers.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Multi-Lingual Support</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              This assistant supports conversations in both English and Spanish. You can ask questions and receive 
              responses in your preferred language, making US customs information accessible to a broader audience 
              of trade professionals and businesses engaged in cross-border commerce.
            </p>
          </div>

          {/* FAQ */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-400 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-1">How do I determine the correct HTS classification for my product?</h4>
                <p className="text-gray-300 text-sm">
                  HTS classification requires analyzing the product's material, function, and characteristics against 
                  the Harmonized Tariff Schedule. Start by reviewing the General Rules of Interpretation, then examine 
                  Section and Chapter notes. Our AI can guide you through this process and suggest relevant tariff headings.
                </p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">What documents are required for customs entry?</h4>
                <p className="text-gray-300 text-sm">
                  Standard documents include a commercial invoice, packing list, bill of lading or airway bill, 
                  CBP entry forms (3461/7501), and any certificates or licenses required by Partner Government Agencies. 
                  Specific requirements vary by product type and country of origin.
                </p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">How is customs value determined for imported goods?</h4>
                <p className="text-gray-300 text-sm">
                  Customs value is typically based on transaction value—the price actually paid or payable for the merchandise. 
                  This may include certain additions (assists, royalties, packing costs) and exclude certain items 
                  (international freight, insurance in some cases). Related-party transactions require additional scrutiny.
                </p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Can I get duty-free treatment under a free trade agreement?</h4>
                <p className="text-gray-300 text-sm">
                  Goods may qualify for preferential duty treatment under agreements like USMCA, FTAs with various countries, 
                  or GSP if they meet origin requirements. You must have proper certification (e.g., USMCA certificate) 
                  and the goods must comply with product-specific rules of origin.
                </p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">What FDA requirements apply to my food/drug/device import?</h4>
                <p className="text-gray-300 text-sm">
                  FDA regulates food, drugs, cosmetics, medical devices, and biologics. Requirements may include facility 
                  registration, prior notice of imported food, product listing, premarket approval or clearance for medical 
                  devices, and compliance with labeling, safety, and quality standards. Requirements vary significantly by product type.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Context sidebar */}
        <ContextSidebar
          events={parsedEvents}
          isPolling={polling}
          onRefresh={refreshFeed}
          onTogglePolling={() => setPolling(p => !p)}
        />
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20">
        <div className="container py-8 text-sm text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} The Trade Lab • All Rights Reserved</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-secondary-400">Home</Link>
            <a href="https://learn.thetradelab.ai" className="hover:text-secondary-400">Learn</a>
            <a href="https://thetradelab.ai/contact" className="hover:text-secondary-400">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
