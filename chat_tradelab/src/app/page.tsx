import Link from "next/link";
import { getAllBots } from "@/config/bots";
import { Globe, MessageCircle } from "lucide-react";

export default function HomePage() {
  const bots = getAllBots();

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
      </nav>

      {/* Hero */}
      <header className="relative z-10 container pt-16 pb-12 text-center">
        <div className="flex justify-center mb-6">
          <Globe className="h-16 w-16 text-secondary-400" />
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
          Customs AI Assistants
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Multi-country voice assistants for customs regulations, tariff classification, and trade compliance.
          Powered by ElevenLabs AI.
        </p>
      </header>

      {/* Country Bots Grid */}
      <section className="relative z-10 container py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Select Your Country
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <Link
                key={bot.id}
                href={bot.path}
                className="card p-6 hover:scale-105 transition-all duration-300 hover:border-secondary-400/50 group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="text-6xl">{bot.flagEmoji}</div>
                  <h3 className="text-xl font-bold text-white group-hover:text-secondary-400 transition-colors">
                    {bot.displayName}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {bot.shortTagline}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MessageCircle className="h-4 w-4" />
                    <span>{bot.primaryLanguages.join(", ")}</span>
                  </div>
                  <div className="mt-4 px-4 py-2 rounded-lg bg-secondary-600/20 text-secondary-400 text-sm font-medium group-hover:bg-secondary-600/30 transition-colors">
                    Start Chat →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {bots.length === 1 && (
            <div className="mt-8 text-center card p-6">
              <p className="text-gray-300 mb-2">
                🚧 More countries coming soon!
              </p>
              <p className="text-sm text-gray-400">
                We're expanding to Canada, Mexico, EU, and more.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 container py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">🎙️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Voice Chat</h3>
              <p className="text-sm text-gray-300">
                Speak naturally with our AI assistant. Ask questions in any supported language.
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-white mb-2">Expert Knowledge</h3>
              <p className="text-sm text-gray-300">
                Trained on official customs regulations, tariff schedules, and trade policies.
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold text-white mb-2">Live Context</h3>
              <p className="text-sm text-gray-300">
                Get relevant documents, news, and resources automatically as you chat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="relative z-10 container py-12">
        <div className="max-w-3xl mx-auto card p-6 bg-accent-900/20 border-accent-500/30">
          <h3 className="text-lg font-semibold text-accent-400 mb-2">⚠️ Important Notice</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            These AI assistants provide <strong>educational information only</strong> based on publicly available 
            customs regulations. This is <strong>not legal advice</strong> and should not be treated as official 
            customs guidance or rulings. For binding determinations or legal advice, consult a licensed customs 
            broker or attorney. Always verify critical information with official government resources.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 mt-12">
        <div className="container py-8 text-sm text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} The Trade Lab • All Rights Reserved</p>
          <div className="flex gap-4">
            <a href="https://learn.thetradelab.ai" className="hover:text-secondary-400">Learn</a>
            <a href="https://thetradelab.ai" className="hover:text-secondary-400">About</a>
            <a href="https://thetradelab.ai/contact" className="hover:text-secondary-400">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
