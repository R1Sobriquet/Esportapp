"""
User-related Pydantic models.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional


class UserRegister(BaseModel):
    """Model for user registration request."""

    email: EmailStr
    username: str
    password: str
    profile: Optional[dict] = {}


class UserLogin(BaseModel):
    """Model for user login request."""

    email: EmailStr
    password: str


class UserProfile(BaseModel):
    """Model for user profile update request."""

    region: Optional[str] = None
    date_of_birth: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    timezone: Optional[str] = None
    discord_username: Optional[str] = None
    steam_id: Optional[str] = None
    twitch_username: Optional[str] = None
    skill_level: Optional[str] = "beginner"
    looking_for: Optional[str] = "teammates"
    profile_visibility: Optional[str] = "public"
    show_stats: Optional[bool] = True
    allow_friend_requests: Optional[bool] = True


class UserResponse(BaseModel):
    """Model for user response in authentication."""

    id: int
    email: str
    username: str
    email_verified: Optional[bool] = False


class AuthResponse(BaseModel):
    """Model for authentication response."""

    success: bool
    token: str
    user: UserResponse
