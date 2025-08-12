from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os

from config import settings
from mlb_service import resolve_team_id, find_next_game, get_schedule, compare_teams, GameInfo
from news_service import NewsService, NewsArticle
from youtube_service import search_videos, VideoItem
from sports_data_service import SportsDataService

load_dotenv()
app = FastAPI(title="Hackathon AI Backend", version="0.1.0")

# CORS for local dev (Next.js and Netlify dev)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8888",  # Netlify dev default
    "http://127.0.0.1:8888",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"],  # relax during hackathon; tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CheckScheduleRequest(BaseModel):
    team: str = Field(..., description="Team name or alias, e.g., 'Yankees'")
    days: int = Field(14, ge=1, le=60, description="Days ahead to search for next game")
    from_iso: Optional[str] = Field(None, description="ISO datetime to start from; defaults to now")
    tool_token: Optional[str] = None


class NewsRequest(BaseModel):
    team: str
    days_back: int = Field(7, ge=1, le=30)
    max_results: int = Field(10, ge=1, le=50)
    tool_token: Optional[str] = None


class YouTubeRequest(BaseModel):
    query: Optional[str] = None
    team: Optional[str] = None
    max_results: int = Field(10, ge=1, le=50)
    tool_token: Optional[str] = None


class CompareStatsRequest(BaseModel):
    team1: str
    team2: str
    season: Optional[int] = None
    tool_token: Optional[str] = None


class TeamIntelRequest(BaseModel):
    team: str
    days_back: int = Field(7, ge=1, le=30)
    max_news: int = Field(10, ge=1, le=50)
    max_videos: int = Field(10, ge=1, le=50)
    tool_token: Optional[str] = None


class GameOut(BaseModel):
    game_pk: int
    game_date: str
    home_team: str
    away_team: str
    is_home: bool
    opponent: str
    venue: Optional[str] = None
    status: str

    @staticmethod
    def from_game(g: GameInfo) -> "GameOut":
        return GameOut(
            game_pk=g.game_pk,
            game_date=g.game_date.isoformat(),
            home_team=g.home_team,
            away_team=g.away_team,
            is_home=g.is_home,
            opponent=g.opponent,
            venue=g.venue,
            status=g.status,
        )


def _check_auth(header_token: Optional[str], body_token: Optional[str]) -> None:
    expected = settings.TOOL_TOKEN or os.getenv("TOOL_TOKEN")
    if not expected:
        # No token configured -> allow (dev)
        return
    incoming = body_token or header_token
    if incoming != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing tool token")


@app.get("/health")
def health():
    return {"status": "ok"}


# Placeholder and ping for tools
@app.post("/tools/echo")
def tool_echo(payload: Dict[str, Any], x_tool_token: Optional[str] = Header(None)):
    _check_auth(x_tool_token, (payload or {}).get("tool_token"))
    return {"received": payload}


@app.post("/tools/check_schedule")
def tools_check_schedule(req: CheckScheduleRequest, x_tool_token: Optional[str] = Header(None)):
    _check_auth(x_tool_token, req.tool_token)
    resolved = resolve_team_id(req.team)
    if not resolved:
        raise HTTPException(status_code=404, detail=f"Team not found for input: {req.team}")
    team_id, team_name = resolved
    from_dt = datetime.fromisoformat(req.from_iso) if req.from_iso else datetime.now(timezone.utc)
    # Normalize to timezone-aware (UTC) if input lacked tzinfo
    if from_dt.tzinfo is None:
        from_dt = from_dt.replace(tzinfo=timezone.utc)
    next_game = find_next_game(team_id, from_dt=from_dt, search_days=req.days)
    end_date = from_dt.date() + timedelta(days=req.days)
    sched = get_schedule(team_id, from_dt.date(), end_date)
    return {
        "team_id": team_id,
        "team_name": team_name,
        "from": from_dt.isoformat(),
        "to": end_date.isoformat(),
        "next_game": GameOut.from_game(next_game).model_dump() if next_game else None,
        "schedule": [GameOut.from_game(g).model_dump() for g in sched],
    }


@app.post("/tools/news")
def tools_news(req: NewsRequest, x_tool_token: Optional[str] = Header(None)):
    _check_auth(x_tool_token, req.tool_token)
    service = NewsService()
    articles = service.search_team_news(req.team, req.days_back, req.max_results)
    def article_to_dict(a: NewsArticle) -> Dict[str, Any]:
        return {
            "title": a.title,
            "description": a.description,
            "url": a.url,
            "source": a.source,
            "published_at": a.published_at.isoformat(),
            "url_to_image": a.url_to_image,
        }
    return {"team": req.team, "articles": [article_to_dict(a) for a in articles]}


@app.post("/tools/youtube")
def tools_youtube(req: YouTubeRequest, x_tool_token: Optional[str] = Header(None)):
    _check_auth(x_tool_token, req.tool_token)
    query = req.query
    if not query and req.team:
        query = f"{req.team} MLB highlights analysis"
    if not query:
        raise HTTPException(status_code=400, detail="Provide 'query' or 'team'")
    items = search_videos(query, max_results=req.max_results)
    def video_to_dict(v: VideoItem) -> Dict[str, Any]:
        return {
            "video_id": v.video_id,
            "title": v.title,
            "url": v.url,
            "channel": v.channel,
            "view_count": v.view_count,
        }
    return {"query": query, "results": [video_to_dict(v) for v in items]}


@app.post("/tools/compare_stats")
def tools_compare_stats(req: CompareStatsRequest, x_tool_token: Optional[str] = Header(None)):
    _check_auth(x_tool_token, req.tool_token)
    r1 = resolve_team_id(req.team1)
    r2 = resolve_team_id(req.team2)
    if not r1 or not r2:
        raise HTTPException(status_code=404, detail="One or both teams could not be resolved")
    team1_id, team1_name = r1
    team2_id, team2_name = r2
    cmp = compare_teams(team1_id, team2_id, season=req.season)
    return {
        "team1": {"id": team1_id, "name": team1_name},
        "team2": {"id": team2_id, "name": team2_name},
        "comparison": cmp,
    }


@app.post("/tools/team_intelligence")
def tools_team_intel(req: TeamIntelRequest, x_tool_token: Optional[str] = Header(None)):
    _check_auth(x_tool_token, req.tool_token)
    svc = SportsDataService()
    intel = svc.get_team_intelligence(req.team, req.days_back, req.max_news, req.max_videos)
    return {
        "team": intel.team_name,
        "generated_at": intel.generated_at.isoformat(),
        "news": [
            {
                "title": n.title,
                "description": n.description,
                "url": n.url,
                "source": n.source,
                "published_at": n.published_at.isoformat(),
                "url_to_image": n.url_to_image,
            }
            for n in intel.news_articles
        ],
        "youtube": [
            {
                "video_id": v.video_id,
                "title": v.title,
                "url": v.url,
                "channel": v.channel,
                "view_count": v.view_count,
            }
            for v in intel.youtube_videos
        ],
    }
