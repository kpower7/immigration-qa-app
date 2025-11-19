# chat.thetradelab.ai

Multi-country customs AI assistants powered by ElevenLabs Conversational AI.

## 🎯 Overview

This platform provides voice-enabled AI assistants for customs regulations, tariff classification, and trade compliance across multiple countries. Each country has its own specialized ElevenLabs Agent trained on that country's customs policies.

**Live URL:** https://chat.thetradelab.ai

## 🏗️ Architecture

- **Frontend:** Next.js 15 + React + TypeScript + Tailwind CSS
- **Hosting:** Netlify (frontend + serverless functions)
- **Backend:** Optional Render backend (existing learn.thetradelab.ai backend)
- **Voice AI:** ElevenLabs Conversational AI with RAG
- **UI Pattern:** Reuses immigration-qa-app ElevenLabs integration pattern

## 📁 Project Structure

```
chat_tradelab/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Country directory/landing page
│   │   ├── us/page.tsx           # US customs assistant
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── VoiceChat.tsx         # ElevenLabs voice component
│   │   └── ContextSidebar.tsx    # Live context updates
│   ├── config/
│   │   └── bots.ts               # Multi-country bot config
│   └── types/
│       └── ui-events.ts          # TypeScript types
├── netlify/
│   └── functions/
│       ├── elevenSignedUrl.ts    # ElevenLabs WebSocket proxy
│       ├── uiFeed.ts             # UI event feed
│       └── toolsUiEvent.ts       # Post UI events
├── package.json
├── netlify.toml
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- ElevenLabs API key & Agent IDs
- Netlify account

### Setup

1. **Install dependencies:**
```powershell
cd chat_tradelab
npm install
```

2. **Configure environment variables:**
```powershell
# Copy example file
copy .env.example .env

# Edit .env and add your keys:
# ELEVEN_API_KEY=your_key_here
# NEXT_PUBLIC_ELEVEN_AGENT_ID_US=your_agent_id_here
```

3. **Run locally:**
```powershell
# Start Next.js dev server
npm run dev

# Visit http://localhost:3000
```

4. **Test with Netlify Functions:**
```powershell
# Install Netlify CLI globally
npm install -g netlify-cli

# Run with functions
netlify dev

# Visit http://localhost:8888
```

## 🤖 ElevenLabs Agent Setup

### Creating an Agent

1. Go to [ElevenLabs Conversational AI](https://elevenlabs.io/app/conversational-ai)
2. Click "Create Agent"
3. Configure for customs domain:
   - **Name:** US Customs AI Assistant
   - **Voice:** Choose professional voice
   - **Knowledge Base:** Upload customs regulations, HTS schedules, etc.
   - **Language:** Enable English + Spanish
   - **System Prompt:** Use customs-focused prompt

### System Prompt Example (US)

```
You are a US Customs AI Assistant powered by The Trade Lab. Your role is to provide accurate, educational information about US customs regulations, HTS classification, valuation, and trade compliance.

Key Guidelines:
- Provide precise answers based on official US Customs and Border Protection (CBP) regulations
- Always include relevant HTS codes, CFR citations, or regulatory references
- When discussing recent changes, mention the effective date
- Support both English and Spanish conversations seamlessly
- Always emphasize that this is educational information, not legal advice
- Suggest consulting a licensed customs broker for binding determinations

Topics you cover:
- HTS tariff classification
- Customs valuation methods
- Entry documentation requirements
- Partner Government Agency (PGA) regulations (FDA, EPA, USDA, etc.)
- Free trade agreements (USMCA, FTAs, GSP)
- Section 301 tariffs and trade policy
- Forced labor compliance (UFLPA)
- Drawback programs
- Foreign trade zones

When you need to show documents, news, or resources, use the UI Event tools to push them to the context sidebar.
```

### Get Agent ID

After creating the agent:
1. Open the agent details
2. Copy the Agent ID from the URL or settings
3. Add to `.env` as `NEXT_PUBLIC_ELEVEN_AGENT_ID_US`

## 🌍 Adding New Countries

1. **Create ElevenLabs Agent** for the new country
2. **Add to `src/config/bots.ts`:**
```typescript
{
  id: "ca",
  countryCode: "CA",
  path: "/ca",
  displayName: "Canada Customs AI Assistant",
  shortTagline: "Ask about Canadian customs regulations and tariff classification.",
  elevenLabsAgentId: process.env.NEXT_PUBLIC_ELEVEN_AGENT_ID_CA || "",
  primaryLanguages: ["English", "French"],
  flagEmoji: "🇨🇦",
  seo: {
    title: "Canada Customs Regulations AI Assistant | The Trade Lab",
    metaDescription: "Get answers about Canadian customs regulations, tariff classification, and import procedures. Bilingual support (English, French)."
  }
}
```

3. **Create page:** `src/app/ca/page.tsx` (copy from `/us/page.tsx` and update)
4. **Add Agent ID to .env:** `NEXT_PUBLIC_ELEVEN_AGENT_ID_CA=...`
5. **Deploy** - new country will appear automatically on homepage

## 🎨 Theming

The site uses The Trade Lab color scheme:
- **Primary:** Blue (`#2563eb`) - Trust, professionalism
- **Secondary:** Green (`#16a34a`) - Success, growth
- **Accent:** Orange (`#ea580c`) - Calls-to-action

Modify in `tailwind.config.ts` if needed.

## 📡 API Endpoints

### Netlify Functions

- **`GET /.netlify/functions/elevenSignedUrl`**
  - Returns signed WebSocket URL for ElevenLabs
  - Query params: `agent_id`, `country`
  
- **`GET /.netlify/functions/uiFeed`**
  - Returns UI events for a session
  - Query params: `session_id`, `country`
  
- **`POST /.netlify/functions/toolsUiEvent`**
  - Posts new UI event to session
  - Headers: `x-ui-session-id`
  - Body: `{ action: {...}, session_id: "..." }`

## 🚀 Deployment

### Netlify

1. **Connect repo to Netlify:**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select repo
   - Base directory: `chat_tradelab`

2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `chat_tradelab/.next`
   - Functions directory: `chat_tradelab/netlify/functions`

3. **Set environment variables:**
   - Go to Site settings → Environment variables
   - Add all variables from `.env.example`
   - Mark `ELEVEN_API_KEY` as secret

4. **Deploy:**
   - Push to main branch = automatic deploy
   - Or click "Trigger deploy" in Netlify dashboard

5. **Custom domain:**
   - Site settings → Domain management
   - Add custom domain: `chat.thetradelab.ai`
   - Configure DNS with your provider

### Environment Variables (Production)

Set in Netlify dashboard:
```
ELEVEN_API_KEY=sk_...
NEXT_PUBLIC_ELEVEN_AGENT_ID_US=agent_...
NEXT_PUBLIC_ELEVEN_AGENT_ID_CA=agent_...
NEXT_PUBLIC_ELEVEN_AGENT_ID_MX=agent_...
```

## 🧪 Testing

```powershell
# Test locally
npm run dev

# Test with Netlify Functions
netlify dev

# Build test
npm run build

# Type check
npx tsc --noEmit
```

## 📝 Notes

- **UI Events:** Currently stored in-memory (resets on deploy). For production, use backend database or Redis.
- **Backend Integration:** Optional. Can connect to existing `learn.thetradelab.ai` Render backend for persistent storage.
- **Voice Quality:** Depends on ElevenLabs Agent training and knowledge base quality.
- **Multi-lingual:** Each agent handles language switching within the same conversation.

## 🔗 Related

- **Learn Platform:** https://learn.thetradelab.ai (Vimeo-based courses)
- **Marketing Site:** https://thetradelab.ai
- **Reference Implementation:** immigration-qa-app (USCIS chatbot)

## 📄 License

Proprietary - The Trade Lab

---

**Built by Kevin Power | The Trade Lab**
