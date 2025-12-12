"""
Game-related Pydantic models with comprehensive validation.
"""

from pydantic import BaseModel, Field, field_validator, HttpUrl
from typing import Optional, Literal
from enum import Enum


class SkillLevel(str, Enum):
    """Enum for skill levels."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class Game(BaseModel):
    """Model for game data."""

    name: str = Field(..., min_length=1, max_length=255, description="Game name")
    category: Optional[str] = Field(None, max_length=100, description="Game category (FPS, MOBA, etc.)")
    icon_url: Optional[str] = Field(None, max_length=500, description="URL to game icon")
    api_id: Optional[str] = Field(None, max_length=100, description="External API identifier")

    @field_validator('icon_url')
    @classmethod
    def validate_icon_url(cls, v):
        """Validate icon URL format if provided."""
        if v is not None and v != '':
            if not v.startswith(('http://', 'https://')):
                raise ValueError('icon_url must be a valid HTTP/HTTPS URL')
        return v


class UserGame(BaseModel):
    """Model for adding/updating a game to user profile with validation."""

    game_id: int = Field(..., gt=0, description="ID of the game to add")
    skill_level: SkillLevel = Field(
        default=SkillLevel.BEGINNER,
        description="Player's skill level for this game"
    )
    game_rank: Optional[str] = Field(
        None,
        max_length=100,
        description="Player's rank in the game (e.g., Gold III, Diamond)"
    )
    hours_played: int = Field(
        default=0,
        ge=0,
        le=100000,
        description="Total hours played (0-100000)"
    )
    is_favorite: bool = Field(default=False, description="Whether this is a favorite game")

    @field_validator('game_rank')
    @classmethod
    def validate_game_rank(cls, v):
        """Clean up game rank string."""
        if v is not None:
            v = v.strip()
            if v == '':
                return None
        return v

    class Config:
        use_enum_values = True


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


class GameCreate(BaseModel):
    """Model for creating a new game (admin only)."""

    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    icon_url: Optional[str] = Field(None, max_length=500)
    api_id: Optional[str] = Field(None, max_length=100)

    @field_validator('name', 'category')
    @classmethod
    def strip_strings(cls, v):
        """Strip whitespace from strings."""
        if v:
            return v.strip()
        return v


class GameUpdate(BaseModel):
    """Model for updating a game (admin only)."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    icon_url: Optional[str] = Field(None, max_length=500)
    api_id: Optional[str] = Field(None, max_length=100)
