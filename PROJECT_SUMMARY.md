# Speech Agent Demo Website Project

## Overview

This is a Next.js 15 hackathon demo website featuring voice AI agents and sports data analytics. The project serves as a multi-demo platform with isolated navigation patterns designed for both investor presentations and individual demo user experiences.

## Repository Structure

```
Speech Agent/
├── netlify.toml                    # Root Netlify configuration
└── demo_website_v2/               # Main application directory
    ├── src/app/                   # Next.js App Router pages
    │   ├── page.tsx              # Demos hub homepage
    │   ├── mlb/page.tsx          # MLB analytics demo
    │   └── voice/page.tsx        # Voice agent demo
    ├── netlify/functions/         # Netlify Functions
    │   ├── _lib/toolsProxy.ts    # Shared proxy utility
    │   ├── eleven-signed-url.ts  # ElevenLabs WebSocket URL
    │   ├── elevenSignedUrl.ts    # Alias for compatibility
    │   ├── tools*.ts             # Backend proxy functions
    │   ├── chat.ts               # Deprecated endpoint
    │   └── tts.ts                # Deprecated endpoint
    ├── backend/                   # FastAPI backend
    │   ├── main.py               # Main FastAPI application
    │   ├── config.py             # Environment configuration
    │   ├── mlb_service.py        # MLB data service
    │   ├── news_service.py       # News API service
    │   ├── youtube_service.py    # YouTube Data API service
    │   └── sports_data_service.py # Combined sports intelligence
    ├── next.config.ts            # Next.js configuration (static export)
    ├── netlify.toml              # Application-specific config
    ├── package.json              # Dependencies and scripts
    └── README.md                 # Application documentation
```

## Technical Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build**: Static export (`output: "export"`)
- **Images**: Unoptimized for static hosting

### Backend Services
- **API Framework**: FastAPI (Python)
- **Proxy Layer**: Netlify Functions
- **Voice AI**: ElevenLabs Conversational AI
- **Data Sources**: NewsAPI, YouTube Data API, MLB Stats API

### Deployment
- **Platform**: Netlify
- **Build Directory**: `demo_website_v2/`
- **Publish Directory**: `demo_website_v2/out/`
- **Functions Directory**: `demo_website_v2/netlify/functions/`

## Current Demos

### 1. Root Homepage (`/`)
- **Purpose**: Demos hub and investor landing page
- **Features**:
  - Navigation bar with "Demos" anchor link
  - Hero section introducing the demo platform
  - Demo cards linking to MLB and Voice demos
  - Architecture section showcasing technical stack
  - Footer with project information

### 2. MLB Demo (`/mlb`)
- **Purpose**: Sports analytics with conversational AI
- **Features**:
  - Scoped navigation (MLB, Videos, Voice only)
  - MLB team statistics and analysis
  - Video highlights integration
  - Voice agent for sports queries
  - No back-navigation to root homepage

### 3. Voice Demo (`/voice`)
- **Purpose**: ElevenLabs conversational AI showcase
- **Features**:
  - Scoped navigation (MLB brand link, Videos, Voice)
  - Push-to-talk voice interface
  - Real-time WebSocket connection to ElevenLabs
  - Error handling and connection status
  - No back-navigation to root homepage

## Navigation Architecture

### Design Philosophy
The navigation system implements a **dual-access pattern**:

1. **Investor/General Access**: Root homepage serves as a hub linking to all demos
2. **Demo User Isolation**: Individual demo pages have scoped navigation preventing return to hub

### Implementation Details
- **Root Homepage**: Links to all available demos via cards and navigation
- **Demo Pages**: Navigation scoped to related demos only (no root homepage links)
- **Mobile Menus**: Updated to match desktop navigation scope per page
- **Isolation Benefit**: Demo users stay within demo ecosystem, investors can access all demos

## API Endpoints

### Netlify Functions (Base: `/.netlify/functions/`)

#### Active Endpoints
- **`GET /eleven-signed-url`** - ElevenLabs signed WebSocket URL
  - Query params: `?agent_id=<id>` (optional if env var set)
  - Returns: `{ signedUrl: "wss://..." }`

- **`POST /toolsCheckSchedule`** - MLB schedule lookup
  - Body: `{ team, days?, from_iso?, tool_token? }`
  - Proxies to: `BACKEND_BASE_URL/tools/check_schedule`

- **`POST /toolsCompareStats`** - Team statistics comparison
  - Body: `{ team1, team2, season?, tool_token? }`
  - Proxies to: `BACKEND_BASE_URL/tools/compare_stats`

- **`POST /toolsNews`** - Team news search
  - Body: `{ team, days_back?, max_results?, tool_token? }`
  - Proxies to: `BACKEND_BASE_URL/tools/news`

- **`POST /toolsTeamIntelligence`** - Combined team intelligence
  - Body: `{ team, days_back?, max_news?, max_videos?, tool_token? }`
  - Proxies to: `BACKEND_BASE_URL/tools/team_intelligence`

- **`POST /toolsYoutube`** - YouTube video search
  - Body: `{ query? | team?, max_results?, tool_token? }`
  - Proxies to: `BACKEND_BASE_URL/tools/youtube`

#### Deprecated Endpoints
- **`POST /chat`** - Returns 410 with redirect to `/voice`
- **`POST /tts`** - Returns 410 with redirect to `/voice`

### FastAPI Backend (Base: `BACKEND_BASE_URL`)

- **`GET /health`** - Health check endpoint
- **`POST /tools/echo`** - Development utility
- **`POST /tools/check_schedule`** - MLB schedule data
- **`POST /tools/news`** - News article search
- **`POST /tools/youtube`** - YouTube video search
- **`POST /tools/compare_stats`** - Team statistics comparison
- **`POST /tools/team_intelligence`** - Combined data intelligence

## Environment Variables

### Required for Production
- **`ELEVEN_API_KEY`** (or `ELEVENLABS_API_KEY`) - ElevenLabs API authentication
- **`ELEVEN_AGENT_ID`** (or `AGENT_ID`) - Default ElevenLabs agent ID
- **`NEWS_API_KEY`** - NewsAPI.org authentication
- **`YOUTUBE_API_KEY`** - YouTube Data API v3 authentication

### Optional Configuration
- **`BACKEND_BASE_URL`** - Backend API base URL (default: `http://127.0.0.1:8001`)
- **`TOOL_TOKEN`** - Simple authentication for backend tools (optional)

### Build Configuration
- **`NODE_VERSION`** - Node.js version (set to 18 in netlify.toml)
- **`NPM_FLAGS`** - NPM installation flags (set to `--production=false`)

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.10+
- Netlify CLI (`npm i -g netlify-cli`)

### Setup Instructions

1. **Install Frontend Dependencies**
   ```bash
   cd demo_website_v2
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd demo_website_v2
   pip install -r backend/requirements.txt
   ```

3. **Configure Environment Variables**
   - Set required API keys in your environment or `.env` files
   - Backend can use `backend/.env` for Python environment variables

4. **Start Backend Server**
   ```bash
   cd demo_website_v2
   uvicorn backend.main:app --reload --port 8001
   ```

5. **Start Frontend + Functions**
   ```bash
   cd demo_website_v2
   netlify dev
   ```

6. **Access Application**
   - Frontend: `http://localhost:8888` (Netlify dev server)
   - Backend: `http://localhost:8001` (FastAPI server)
   - Functions: `http://localhost:8888/.netlify/functions/*`

## Recent Updates (December 12, 2025)

### Navigation and Homepage Restructuring

#### Root Homepage Transformation (`src/app/page.tsx`)
- **Before**: MLB-specific homepage with team statistics and videos
- **After**: Demos hub serving as investor/general access point
- **Changes**:
  - Updated navigation: Replaced "Home" and "Videos" with "Demos" anchor
  - New hero section: "Explore Our AI-Powered Demos" with hub description
  - Demo cards section: Replaced videos with cards linking to MLB and Voice demos
  - Preserved architecture and footer sections for consistency
  - Updated mobile menu to match new navigation structure

#### MLB Demo Page Migration (`src/app/mlb/page.tsx`)
- **Purpose**: Migrated original homepage content to dedicated MLB demo page
- **Navigation**: Scoped to MLB demo ecosystem (MLB, Videos, Voice only)
- **Content**: Preserved original MLB statistics, videos, and functionality
- **Isolation**: No links back to root homepage to maintain demo user isolation

#### Voice Demo Page Updates (`src/app/voice/page.tsx`)
- **Navigation**: Updated to scope within demo ecosystem
- **Links**: Brand links to MLB demo, Videos to MLB videos, Voice to current page
- **Isolation**: No root homepage navigation to maintain user isolation

### Deployment Infrastructure Fixes

#### Git Repository Issues
- **Problem**: Repository had stale Git submodule references to `demo_website_v2`
- **Solution**: Removed submodule references and re-added directory as regular files
- **Commands**: `git rm --cached demo_website_v2` followed by `git add demo_website_v2`

#### Netlify Configuration
- **Problem**: Netlify couldn't find `package.json` in repository root
- **Solution**: Created root `netlify.toml` with proper base directory configuration
- **Configuration**:
  ```toml
  [build]
    base = "demo_website_v2"
    command = "npm run build"
    publish = "demo_website_v2/out"
  
  [functions]
    directory = "demo_website_v2/netlify/functions"
  ```

#### Deployment Success
- **Status**: Successfully deployed and accessible via Netlify
- **Functions**: All Netlify Functions operational
- **Demos**: Both MLB and Voice demos fully functional
- **Navigation**: Isolated navigation patterns working as designed

## Architecture Benefits

### Scalability
- **Easy Demo Addition**: New demos require only new App Router pages
- **Shared Infrastructure**: Functions and backend serve all demos
- **Consistent Patterns**: Navigation and styling patterns established

### User Experience
- **Investor Access**: Root homepage provides overview and access to all demos
- **Demo Isolation**: Users stay within demo ecosystem without confusion
- **Mobile Responsive**: All navigation patterns work across device sizes

### Technical Robustness
- **Static Export**: Fast loading and CDN-friendly
- **Serverless Functions**: Scalable backend proxy layer
- **Environment Flexibility**: Works in local development and production

## Future Extensibility

The current architecture supports easy addition of new demos:

1. **Create Demo Page**: Add new route in `src/app/<demo-name>/page.tsx`
2. **Update Hub**: Add demo card to root homepage
3. **Add Backend Endpoints**: Extend FastAPI with new `/tools/<demo>_*` endpoints
4. **Add Functions**: Create new `tools<Demo>*.ts` Netlify Functions if needed
5. **Update Navigation**: Follow established scoped navigation patterns

This structure provides a solid foundation for expanding the demo platform while maintaining the established user experience and technical patterns.
