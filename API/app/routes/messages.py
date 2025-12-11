"""
Messages routes.
Handles conversations and messaging between matched users.
"""

from fastapi import APIRouter, HTTPException, Depends

from ..models.message import Message
from ..services.auth import get_current_user_id
from ..database import DatabaseSession

router = APIRouter()


@router.get("/messages")
def get_conversations(user_id: int = Depends(get_current_user_id)):
    """
    Get all conversations for the current user.

    Returns a list of conversations with last message and unread count.
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute(
            """
            SELECT
                u.id as user_id,
                u.username,
                p.avatar_url,
                MAX(m.created_at) as last_message_time,
                (
                    SELECT content FROM messages
                    WHERE (sender_id = u.id AND receiver_id = %s)
                       OR (sender_id = %s AND receiver_id = u.id)
                    ORDER BY created_at DESC LIMIT 1
                ) as last_message,
                COUNT(CASE WHEN m.is_read = 0 AND m.receiver_id = %s THEN 1 END) as unread_count
            FROM users u
            JOIN user_profiles p ON u.id = p.user_id
            JOIN messages m ON (m.sender_id = u.id AND m.receiver_id = %s)
                            OR (m.sender_id = %s AND m.receiver_id = u.id)
            WHERE u.id != %s
            GROUP BY u.id
            ORDER BY last_message_time DESC
            """,
            (user_id, user_id, user_id, user_id, user_id, user_id),
        )

        return {"conversations": db.fetchall()}


@router.get("/messages/{other_user_id}")
def get_messages(other_user_id: int, user_id: int = Depends(get_current_user_id)):
    """
    Get messages between current user and another user.

    Args:
        other_user_id: The ID of the other user in the conversation

    Returns:
        List of messages in the conversation
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Check if users are matched
        db.execute(
            """
            SELECT id FROM matches
            WHERE ((user1_id = %s AND user2_id = %s) OR (user1_id = %s AND user2_id = %s))
                AND status = 'accepted'
            """,
            (user_id, other_user_id, other_user_id, user_id),
        )

        if not db.fetchone():
            raise HTTPException(status_code=403, detail="You can only message matched users")

        # Get messages
        db.execute(
            """
            SELECT
                m.id,
                m.sender_id,
                m.receiver_id,
                m.content,
                m.is_read,
                m.created_at,
                u.username as sender_username,
                p.avatar_url as sender_avatar
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            JOIN user_profiles p ON u.id = p.user_id
            WHERE (m.sender_id = %s AND m.receiver_id = %s)
               OR (m.sender_id = %s AND m.receiver_id = %s)
            ORDER BY m.created_at ASC
            """,
            (user_id, other_user_id, other_user_id, user_id),
        )

        messages = db.fetchall()

        # Mark as read
        db.execute(
            """
            UPDATE messages SET is_read = TRUE
            WHERE sender_id = %s AND receiver_id = %s AND is_read = FALSE
            """,
            (other_user_id, user_id),
        )

        return {"messages": messages}


@router.post("/messages")
def send_message(message: Message, user_id: int = Depends(get_current_user_id)):
    """
    Send a message to another user.

    Users can only message each other if they have an accepted match.
    """
    with DatabaseSession() as db:
        # Verify users are matched
        db.execute(
            """
            SELECT id FROM matches
            WHERE (
                (user1_id = %s AND user2_id = %s) OR
                (user1_id = %s AND user2_id = %s)
            )
            AND status = 'accepted'
            """,
            (user_id, message.receiver_id, message.receiver_id, user_id),
        )

        if not db.fetchone():
            raise HTTPException(status_code=403, detail="You can only message matched users")

        # Insert the message
        db.execute(
            """
            INSERT INTO messages (sender_id, receiver_id, content, is_read)
            VALUES (%s, %s, %s, FALSE)
            """,
            (user_id, message.receiver_id, message.content),
        )

        return {"success": True, "message": "Message sent"}
