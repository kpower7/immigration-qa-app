/**
 * Multi-country customs chatbot configuration
 * Each bot represents a country-specific ElevenLabs Agent
 */

export interface BotConfig {
  id: string;
  countryCode: string;
  path: string;
  displayName: string;
  shortTagline: string;
  elevenLabsAgentId: string;
  primaryLanguages: string[];
  flagEmoji: string;
  seo: {
    title: string;
    metaDescription: string;
  };
}

export const BOTS: BotConfig[] = [
  {
    id: "us",
    countryCode: "US",
    path: "/us",
    displayName: "US Customs AI Assistant",
    shortTagline: "Ask about US customs regulations, HTS classification, and valuation.",
    elevenLabsAgentId: process.env.NEXT_PUBLIC_ELEVEN_AGENT_ID_US || "AGENT_ID_US_PLACEHOLDER",
    primaryLanguages: ["English", "Spanish"],
    flagEmoji: "🇺🇸",
    seo: {
      title: "US Customs Regulations AI Assistant | The Trade Lab",
      metaDescription: "Get instant answers about US customs regulations, HTS classification, valuation, and entry documentation. Multi-lingual support (English, Spanish). Educational information only, not legal advice."
    }
  },
  // Ready to add more countries:
  // {
  //   id: "ca",
  //   countryCode: "CA",
  //   path: "/ca",
  //   displayName: "Canada Customs AI Assistant",
  //   shortTagline: "Ask about Canadian customs regulations and tariff classification.",
  //   elevenLabsAgentId: process.env.NEXT_PUBLIC_ELEVEN_AGENT_ID_CA || "",
  //   primaryLanguages: ["English", "French"],
  //   flagEmoji: "🇨🇦",
  //   seo: {
  //     title: "Canada Customs Regulations AI Assistant | The Trade Lab",
  //     metaDescription: "Get answers about Canadian customs regulations, tariff classification, and import procedures. Bilingual support (English, French)."
  //   }
  // },
];

/**
 * Get bot configuration by path
 */
export function getBotByPath(path: string): BotConfig | undefined {
  return BOTS.find(bot => bot.path === path);
}

/**
 * Get bot configuration by ID
 */
export function getBotById(id: string): BotConfig | undefined {
  return BOTS.find(bot => bot.id === id);
}

/**
 * Get all bot configurations
 */
export function getAllBots(): BotConfig[] {
  return BOTS;
}
