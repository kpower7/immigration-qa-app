# Stub for MLB service - not needed for USCIS RAG functionality
from dataclasses import dataclass
from typing import Optional, List

@dataclass
class GameInfo:
    game_pk: int = 0
    game_date: str = ""
    home_team: str = ""
    away_team: str = ""
    is_home: bool = False
    opponent: str = ""
    venue: Optional[str] = None
    status: str = ""

def resolve_team_id(team: str) -> Optional[int]:
    return None

def find_next_game(team_id: int, days: int = 14) -> Optional[GameInfo]:
    return None

def get_schedule(team_id: int, days: int = 14) -> List[GameInfo]:
    return []

def compare_teams(team1: str, team2: str, season: Optional[int] = None) -> dict:
    return {"error": "MLB service not implemented"}
