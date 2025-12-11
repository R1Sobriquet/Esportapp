"""
Match-related Pydantic models.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MatchAction(BaseModel):
    """Model for match action (accept/reject)."""

    action: str  # 'accept' or 'reject'


class MatchResponse(BaseModel):
    """Model for match response."""

    match_id: int
    user_id: int
    username: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    skill_level: Optional[str] = None
    looking_for: Optional[str] = None
    timezone: Optional[str] = None
    region: Optional[str] = None
    games: Optional[str] = None
    common_game_count: Optional[int] = None
    match_score: int
    status: Optional[str] = None
    created_at: Optional[datetime] = None


class MatchesListResponse(BaseModel):
    """Model for list of matches response."""

    matches: List[MatchResponse]
    message: Optional[str] = None
