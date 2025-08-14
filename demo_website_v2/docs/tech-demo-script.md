# Tech Demo Script (60s) — Implementation Walkthrough

Duration: 60 seconds
Format: screen capture + voiceover. Show repo, live site `/voice`, and API docs.

0–6s — Title + live URL
- On-screen: Project title and `live-ai-demo.netlify.app/immigration`
- VO: “This is an immigration voice assistant that cites the USCIS Policy Manual and Forms Instructions.”

6–15s — Frontend + WS broker
- On-screen: `src/app/immigration/page.tsx` and `netlify/functions/toolsImmigrationNews.ts`
- VO: “The Immigration page embeds the ElevenLabs agent inline. Tool calls go through Netlify Functions to keep tokens server-side.”

15–28s — Tool bridge via Netlify Functions
- On-screen: `netlify/functions/toolsImmigrationNews.ts`, `netlify/functions/toolsFormsFinder.ts`, and `_lib/toolsProxy.ts`
- VO: “All tools are proxied via Netlify Functions. We inject `x-tool-token`, forward POST JSON to the backend, and return clean JSON. This isolates the backend, adds CORS/headers, and centralizes auth.”

28–44s — FastAPI backend
- On-screen: `backend/main.py` and `/docs`
- VO: “The backend exposes `/tools/*`: `immigration_news` and `forms_finder`. It also handles `/ui/event` and `/ui/feed` for the Context panel. Services include `news_service.py` and `forms_service.py`. Settings come from `config.py` with `.env` loading.”

44–54s — Reliability + security
- On-screen: commits showing fixes
- VO: “We added session-aware UI events so the Context panel auto-updates after tool calls. Secrets stay in environment variables: `TOOL_TOKEN`, `NEWS_API_KEY`, optional `ELEVEN_API_KEY` (for the voice demo).”

54–60s — Deployment
- On-screen: Netlify dashboard and Render service
- VO: “Netlify serves the site and Functions; FastAPI runs on Render. Netlify uses `BACKEND_BASE_URL` to reach the backend. The result is a fast, secure, production‑ready voice agent with concise scouting and betting leans.”
