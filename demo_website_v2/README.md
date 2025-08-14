# USCIS Policy Navigator — Real‑Time Voice Assistant

A production-ready immigration voice assistant that provides accurate USCIS policy guidance through conversational AI. Users speak to the agent and receive precise policy citations, form links, and recent immigration news with proper disclaimers.

## 🎯 Project Overview

**Live Demo**: [https://live-ai-demo.netlify.app/immigration/](https://live-ai-demo.netlify.app/immigration/)

### What It Does
- **Real-time voice chat** with ElevenLabs Agent using RAG over USCIS Policy Manual + Forms Instructions
- **Immigration policy guidance** with precise citations and official form links
- **Recent news integration** for policy updates and immigration developments
- **Event-driven UI updates** with context panel showing forms, news, and citations automatically

### Architecture
- **Frontend**: Next.js 15 with ElevenLabs React SDK for voice integration and context panel
- **Voice Platform**: ElevenLabs Agent with RAG over complete USCIS documentation
- **Backend**: FastAPI with 2 specialized immigration tool endpoints
- **Security**: Netlify Functions proxy layer with token authentication and no personal data storage
- **Deployment**: Split architecture (Netlify + Render) for scalability

## 🚀 Features

### Voice Interface
- **Real-time audio streaming** with sub-second latency
- **Full-duplex conversation** with natural voice interaction
- **Session management** with automatic UI event routing

### Immigration Tools
- **Forms Finder** (`forms_finder`) - Official USCIS form pages and PDF instructions
- **Immigration News** (`immigration_news`) - Recent policy updates and immigration developments
- **UI Event Feed** - Automatic context panel updates with citations and links

### Policy Guidance Features
- **USCIS Policy Manual Citations** - Precise references to official policy sections
- **Official Form Links** - Direct links to USCIS form pages and instructions
- **Educational Focus** - Clear disclaimers about educational vs. legal advice
- **Recent Updates** - Current immigration news and policy changes

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Voice**: ElevenLabs Agent with RAG over USCIS Policy Manual + Forms Instructions
- **Backend**: FastAPI, Python 3.11+
- **APIs**: NewsAPI for immigration updates, USCIS forms database
- **Deployment**: Netlify (frontend + functions), Render (backend)
- **Security**: Token-based authentication, environment secrets, no personal data storage

## ⚙️ Environment Variables

### Netlify (Frontend/Functions):
```
ELEVEN_API_KEY=sk-...          # Secret - ElevenLabs API key
ELEVEN_AGENT_ID=agent_...      # Required - Immigration agent with USCIS knowledge
TOOL_TOKEN=your-secret-token   # Secret - Shared authentication
BACKEND_BASE_URL=https://...   # Public - FastAPI backend URL
```

### Backend (Render/Local):
```
TOOL_TOKEN=your-secret-token   # Must match Netlify value
NEWS_API_KEY=...              # Required for immigration news endpoints
```

<<<<<<< Updated upstream
Project structure (high level)
- `src/app/voice/page.tsx` — ElevenLabs voice chat UI (push-to-talk, playback, theme-aligned)
- `netlify/functions/` — `elevenSignedUrl.ts`, tools proxies (`toolsCheckSchedule.ts`, etc.)
- `backend/` — FastAPI app (`main.py`), services (`mlb_service.py`, `news_service.py`, `youtube_service.py`, `config.py`)

---
## 🚀 Quick Start (AI Hackathon Template)

These instructions run the Next.js site with Netlify Functions and the ElevenLabs real-time voice agent locally, and (optionally) start the FastAPI backend scaffold.
=======
## 🏃‍♂️ Quick Start
>>>>>>> Stashed changes

### Prerequisites
- Node.js 18+
- Python 3.11+
- Netlify CLI: `npm install -g netlify-cli`

### Local Development

#### 1. Backend Setup
```powershell
cd backend 
python -m venv .venv ##(first time only)
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

#### 2. Frontend + Functions
```powershell
cd 'C:\Users\k_pow\OneDrive\Documents\MIT\MIT TPP\Speech Agent\'
npm install ##(first time only)
npm --prefix "demo_website_v2" run build ##(first time only)
npx netlify-cli@latest link ##(first time only)
npx netlify-cli@latest dev 
npx netlify-cli@latest dev  --live #For ElevenLabs
# For ElevenLabs tool testing: netlify dev --live
```

<<<<<<< Updated upstream
### Access Points
- Site: http://localhost:8888
- Voice coach (real-time): http://localhost:8888/voice
- Backend health (optional): http://127.0.0.1:8001/health

### Troubleshooting
- Socket error (WinError 10013): bind to `--host 127.0.0.1` and use a different port (`--port 8001`).
- npx EPERM/ECONNRESET: clear `"$env:LOCALAPPDATA\npm-cache\_npx"` or install `netlify-cli` globally.

**Last Updated**: August 2025  
**Version**: 1.0.0  
**Compatibility**: Python 3.8+, Node.js 18+
=======
#### 3. Access Points
- **Site**: http://localhost:8888
- **Immigration Assistant**: http://localhost:8888/immigration
- **Backend API Docs**: http://127.0.0.1:8001/docs

## 🚀 Deployment

### 1. Backend (Render)
- Create Web Service → Connect GitHub repo
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port ${PORT}`
- Set environment variables: `TOOL_TOKEN`, `NEWS_API_KEY`, `YOUTUBE_API_KEY`

### 2. Frontend (Netlify)
- Connect GitHub repo → Auto-deploy from `main`
- Set environment variables (mark secrets appropriately)
- Update `BACKEND_BASE_URL` with Render service URL

## 🧪 Testing

### API Testing (PowerShell)
```powershell
$base = "https://live-ai-demo.netlify.app/.netlify/functions"
$headers = @{ "Content-Type" = "application/json"; "x-tool-token" = "your-token" }

# Forms finder
$body = @{ form_id = "I-485"; tool_token = "your-token" } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "$base/toolsFormsFinder" -Headers $headers -Body $body

# Immigration news
$body = @{ query = "OPT STEM extension"; days_back = 30; max_results = 10; tool_token = "your-token" } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "$base/toolsImmigrationNews" -Headers $headers -Body $body
```

### Voice Testing
1. Visit `/immigration` page
2. Click to start voice conversation
3. Try: "What is Form I-485?" or "Any recent updates on STEM OPT?" or "How do I apply for a green card?"

## 📁 Project Structure

```
├── docs/                       # Documentation and submission materials
│   ├── system-prompt.md        # ElevenLabs Agent system prompt for immigration
│   ├── project-summary.md      # Project overview and impact
│   ├── one-page-report.md      # Technical implementation details
│   ├── demo-video-script.md    # Demo presentation script
│   └── tech-demo-script.md     # Technical demonstration guide
├── src/app/
│   ├── page.tsx               # Homepage focused on immigration assistant
│   ├── immigration/page.tsx   # Immigration voice interface with context panel
│   └── layout.tsx             # Root layout and metadata
├── netlify/functions/
│   ├── elevenSignedUrl.ts     # WebSocket broker for ElevenLabs
│   ├── toolsImmigrationNews.ts # Immigration news proxy
│   ├── toolsFormsFinder.ts    # Forms finder proxy
│   ├── uiFeed.ts              # UI event feed for context panel
│   ├── toolsUiEvent.ts        # UI event posting
│   └── _lib/                  # Shared proxy and UI helpers
├── backend/
│   ├── main.py                # FastAPI app with immigration endpoints
│   ├── forms_service.py       # USCIS forms database and lookup
│   ├── news_service.py        # NewsAPI integration for immigration
│   └── requirements.txt       # Python dependencies
└── README.md
```

## 🔧 Troubleshooting

- **404 on Functions**: Use `elevenSignedUrl` (no hyphens) instead of `eleven-signed-url`
- **Empty PowerShell Results**: Pipe to JSON: `| ConvertTo-Json -Depth 8`
- **News Tool Empty**: Ensure `NEWS_API_KEY` is set on backend for immigration news
- **Context Panel Not Updating**: Check UI feed polling and session management
- **Voice Connection Issues**: Verify `ELEVEN_API_KEY` and immigration agent configuration

## 📚 Documentation

- **[System Prompt](docs/system-prompt.md)** - ElevenLabs Agent configuration for immigration
- **[Technical Report](docs/one-page-report.md)** - Architecture and implementation details
- **[Project Summary](docs/project-summary.md)** - Project overview and impact
- **[Demo Scripts](docs/)** - Video and technical demonstration guides

## 🎯 Usage Examples

**Voice Commands:**
- "What is Form I-485?"
- "How do I apply for a green card through marriage?"
- "Any recent updates on STEM OPT extensions?"
- "What are the requirements for naturalization?"
- "Tell me about the I-140 petition process"

**Expected Response Format:**
- Clear, direct answer to immigration question
- USCIS Policy Manual citations when applicable
- Official form links and instructions (displayed in context panel)
- Recent news updates if relevant
- Educational disclaimer emphasizing this is not legal advice

---

Built by Kevin Power • [Live Demo](https://live-ai-demo.netlify.app/immigration/)
>>>>>>> Stashed changes
