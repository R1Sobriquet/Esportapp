"""
User-related Pydantic models with comprehensive validation.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import date, datetime
from enum import Enum
import re


class SkillLevel(str, Enum):
    """Global skill level enum."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class LookingFor(str, Enum):
    """What the user is looking for."""
    TEAMMATES = "teammates"
    MENTOR = "mentor"
    CASUAL_FRIENDS = "casual_friends"
    COMPETITIVE_TEAM = "competitive_team"


class ProfileVisibility(str, Enum):
    """Profile visibility settings."""
    PUBLIC = "public"
    FRIENDS = "friends"
    PRIVATE = "private"


class UserRegister(BaseModel):
    """Model for user registration request."""

    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Username (3-50 characters, alphanumeric and underscores)"
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password (minimum 8 characters)"
    )
    profile: Optional[dict] = Field(default={}, description="Initial profile data")

    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        """Validate username format."""
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username can only contain letters, numbers, and underscores')
        if v.startswith('_') or v.endswith('_'):
            raise ValueError('Username cannot start or end with underscore')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v


class UserLogin(BaseModel):
    """Model for user login request."""

    email: EmailStr
    password: str = Field(..., min_length=1)


class UserProfile(BaseModel):
    """Model for user profile update request with comprehensive validation."""

    region: Optional[str] = Field(
        None,
        max_length=100,
        description="User's region (e.g., Europe, NA)"
    )
    date_of_birth: Optional[str] = Field(
        None,
        description="Date of birth in YYYY-MM-DD format"
    )
    avatar_url: Optional[str] = Field(
        None,
        max_length=500,
        description="URL to avatar image"
    )
    banner_url: Optional[str] = Field(
        None,
        max_length=500,
        description="URL to banner image"
    )
    bio: Optional[str] = Field(
        None,
        max_length=1000,
        description="User biography (max 1000 characters)"
    )
    timezone: Optional[str] = Field(
        None,
        max_length=50,
        description="User's timezone"
    )
    discord_username: Optional[str] = Field(
        None,
        max_length=100,
        description="Discord username"
    )
    steam_id: Optional[str] = Field(
        None,
        max_length=100,
        description="Steam ID"
    )
    twitch_username: Optional[str] = Field(
        None,
        max_length=100,
        description="Twitch username"
    )
    riot_id: Optional[str] = Field(
        None,
        max_length=100,
        description="Riot ID (for Valorant, LoL)"
    )
    skill_level: Optional[SkillLevel] = Field(
        default=SkillLevel.BEGINNER,
        description="Global skill level"
    )
    looking_for: Optional[LookingFor] = Field(
        default=LookingFor.TEAMMATES,
        description="What the user is looking for"
    )
    profile_visibility: Optional[ProfileVisibility] = Field(
        default=ProfileVisibility.PUBLIC,
        description="Profile visibility setting"
    )
    show_stats: Optional[bool] = Field(default=True, description="Show statistics on profile")
    allow_friend_requests: Optional[bool] = Field(default=True, description="Allow friend requests")

    @field_validator('date_of_birth')
    @classmethod
    def validate_date_of_birth(cls, v):
        """Validate date of birth format and age."""
        if v is None or v == '':
            return None

        try:
            # Parse date
            birth_date = datetime.strptime(v, '%Y-%m-%d').date()

            # Check not in future
            today = date.today()
            if birth_date > today:
                raise ValueError('Date of birth cannot be in the future')

            # Check minimum age (13 years - COPPA compliance)
            age = today.year - birth_date.year - (
                (today.month, today.day) < (birth_date.month, birth_date.day)
            )
            if age < 13:
                raise ValueError('You must be at least 13 years old to use this service')

            # Check reasonable maximum age
            if age > 120:
                raise ValueError('Please enter a valid date of birth')

            return v
        except ValueError as e:
            if 'does not match format' in str(e) or 'unconverted data' in str(e):
                raise ValueError('Date must be in YYYY-MM-DD format')
            raise

    @field_validator('avatar_url', 'banner_url')
    @classmethod
    def validate_url(cls, v):
        """Validate URL format if provided."""
        if v is not None and v != '':
            v = v.strip()
            if v and not v.startswith(('http://', 'https://')):
                raise ValueError('URL must start with http:// or https://')
        return v if v != '' else None

    @field_validator('discord_username')
    @classmethod
    def validate_discord(cls, v):
        """Validate Discord username format."""
        if v is not None and v != '':
            v = v.strip()
            # Discord usernames are now just the display name
            if len(v) > 32:
                raise ValueError('Discord username must be 32 characters or less')
        return v if v != '' else None

    @field_validator('bio')
    @classmethod
    def clean_bio(cls, v):
        """Clean and validate bio."""
        if v is not None:
            v = v.strip()
            if v == '':
                return None
        return v

    class Config:
        use_enum_values = True


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


class UserProfileResponse(BaseModel):
    """Model for complete user profile response."""

    id: int
    username: str
    email: Optional[str] = None
    region: Optional[str] = None
    date_of_birth: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    bio: Optional[str] = None
    timezone: Optional[str] = None
    discord_username: Optional[str] = None
    steam_id: Optional[str] = None
    twitch_username: Optional[str] = None
    riot_id: Optional[str] = None
    skill_level: Optional[str] = None
    looking_for: Optional[str] = None
    profile_visibility: Optional[str] = None
    show_stats: Optional[bool] = True
    allow_friend_requests: Optional[bool] = True
    created_at: Optional[str] = None


class PasswordChange(BaseModel):
    """Model for password change request."""

    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        """Validate new password strength."""
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v
