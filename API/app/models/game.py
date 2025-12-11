"""
Game-related Pydantic models.
"""

from pydantic import BaseModel
from typing import Optional


class Game(BaseModel):
    """Model for game data."""

    name: str
    category: Optional[str] = None
    icon_url: Optional[str] = None
    api_id: Optional[str] = None


class UserGame(BaseModel):
    """Model for adding/updating a game to user profile."""

    game_id: int
    skill_level: Optional[str] = "beginner"
    game_rank: Optional[str] = None
    hours_played: Optional[int] = 0
    is_favorite: Optional[bool] = False


class GameResponse(BaseModel):
    """Model for game response."""

    id: int
    name: str
    category: Optional[str] = None
    icon_url: Optional[str] = None


class UserGameResponse(BaseModel):
    """Model for user game response with details."""

    id: int
    name: str
    category: Optional[str] = None
    icon_url: Optional[str] = None
    skill_level: Optional[str] = None
    game_rank: Optional[str] = None
    hours_played: Optional[int] = None
    is_favorite: Optional[bool] = None
