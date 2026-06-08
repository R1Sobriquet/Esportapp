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
    # GC-EVOL-T2 : catégorie facultative du message (FK vers message_categories).
    # NULL autorisé => un message peut rester « sans catégorie ».
    category_id: Optional[int] = None


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
    # GC-EVOL-T2 : infos de catégorie jointes depuis message_categories
    # (renseignées via LEFT JOIN dans get_messages ; NULL si non catégorisé).
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    category_slug: Optional[str] = None
    category_color: Optional[str] = None


class ConversationResponse(BaseModel):
    """Model for conversation list response."""

    user_id: int
    username: str
    avatar_url: Optional[str] = None
    last_message_time: Optional[datetime] = None
    last_message: Optional[str] = None
    unread_count: int = 0
