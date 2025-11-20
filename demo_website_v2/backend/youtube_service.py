# Stub for YouTube service - not needed for USCIS RAG functionality
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class VideoItem:
    video_id: str = ""
    title: str = ""
    url: str = ""
    description: str = ""

def search_videos(query: Optional[str] = None, team: Optional[str] = None, max_results: int = 10) -> List[VideoItem]:
    return []
