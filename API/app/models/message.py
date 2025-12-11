"""
Message-related Pydantic models.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Message(BaseModel):
    """Model for sending a message."""

    receiver_id: int
    content: str


class MessageResponse(BaseModel):
    """Model for message response."""

    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime
    sender_username: Optional[str] = None
    sender_avatar: Optional[str] = None


class ConversationResponse(BaseModel):
    """Model for conversation list response."""

    user_id: int
    username: str
    avatar_url: Optional[str] = None
    last_message_time: Optional[datetime] = None
    last_message: Optional[str] = None
    unread_count: int = 0
