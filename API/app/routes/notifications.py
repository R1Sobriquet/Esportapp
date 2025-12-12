"""
Notifications routes.
Handles user notifications for matches, messages, etc.
"""

from fastapi import APIRouter, Query, Depends, HTTPException
from typing import Optional
from datetime import datetime

from ..services.auth import get_current_user_id
from ..database import DatabaseSession

router = APIRouter()


@router.get("/notifications")
def get_notifications(
    user_id: int = Depends(get_current_user_id),
    unread_only: bool = Query(default=False),
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0),
):
    """
    Get user's notifications.

    Args:
        unread_only: If True, only return unread notifications
        limit: Maximum notifications to return
        offset: Pagination offset
    """
    with DatabaseSession(dict_cursor=True) as db:
        conditions = ["n.user_id = %s"]
        params = [user_id]

        if unread_only:
            conditions.append("n.is_read = FALSE")

        where_clause = " AND ".join(conditions)

        query = f"""
            SELECT
                n.id,
                n.type,
                n.title,
                n.message,
                n.data,
                n.is_read,
                n.created_at,
                u.username as from_username,
                p.avatar_url as from_avatar
            FROM notifications n
            LEFT JOIN users u ON n.from_user_id = u.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE {where_clause}
            ORDER BY n.created_at DESC
            LIMIT %s OFFSET %s
        """

        params.extend([limit, offset])
        db.execute(query, params)
        notifications = db.fetchall()

        # Convert datetime and JSON data
        for notif in notifications:
            if notif.get("created_at"):
                notif["created_at"] = notif["created_at"].isoformat()
            if notif.get("data"):
                import json
                try:
                    notif["data"] = json.loads(notif["data"])
                except (json.JSONDecodeError, TypeError):
                    pass

        # Get unread count
        db.execute("""
            SELECT COUNT(*) as count FROM notifications
            WHERE user_id = %s AND is_read = FALSE
        """, (user_id,))
        unread_count = db.fetchone()["count"]

        return {
            "notifications": notifications,
            "unread_count": unread_count,
            "limit": limit,
            "offset": offset,
        }


@router.get("/notifications/unread-count")
def get_unread_count(user_id: int = Depends(get_current_user_id)):
    """
    Get count of unread notifications.
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute("""
            SELECT COUNT(*) as count FROM notifications
            WHERE user_id = %s AND is_read = FALSE
        """, (user_id,))
        return {"unread_count": db.fetchone()["count"]}


@router.post("/notifications/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    user_id: int = Depends(get_current_user_id),
):
    """
    Mark a notification as read.
    """
    with DatabaseSession() as db:
        db.execute("""
            UPDATE notifications
            SET is_read = TRUE, read_at = NOW()
            WHERE id = %s AND user_id = %s
        """, (notification_id, user_id))

        if db.rowcount == 0:
            raise HTTPException(status_code=404, detail="Notification not found")

        return {"success": True}


@router.post("/notifications/read-all")
def mark_all_as_read(user_id: int = Depends(get_current_user_id)):
    """
    Mark all notifications as read.
    """
    with DatabaseSession() as db:
        db.execute("""
            UPDATE notifications
            SET is_read = TRUE, read_at = NOW()
            WHERE user_id = %s AND is_read = FALSE
        """, (user_id,))

        return {"success": True, "count": db.rowcount}


@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    user_id: int = Depends(get_current_user_id),
):
    """
    Delete a notification.
    """
    with DatabaseSession() as db:
        db.execute("""
            DELETE FROM notifications
            WHERE id = %s AND user_id = %s
        """, (notification_id, user_id))

        if db.rowcount == 0:
            raise HTTPException(status_code=404, detail="Notification not found")

        return {"success": True}


@router.delete("/notifications")
def clear_notifications(
    user_id: int = Depends(get_current_user_id),
    read_only: bool = Query(default=True, description="Only delete read notifications"),
):
    """
    Clear notifications.

    Args:
        read_only: If True, only delete read notifications
    """
    with DatabaseSession() as db:
        if read_only:
            db.execute("""
                DELETE FROM notifications
                WHERE user_id = %s AND is_read = TRUE
            """, (user_id,))
        else:
            db.execute("""
                DELETE FROM notifications WHERE user_id = %s
            """, (user_id,))

        return {"success": True, "deleted": db.rowcount}


def create_notification(
    user_id: int,
    notification_type: str,
    title: str,
    message: str,
    from_user_id: Optional[int] = None,
    data: Optional[dict] = None,
) -> int:
    """
    Create a new notification.

    Args:
        user_id: User to notify
        notification_type: Type of notification (match, message, system, etc.)
        title: Notification title
        message: Notification message
        from_user_id: Optional user who triggered the notification
        data: Optional JSON data

    Returns:
        The notification ID
    """
    import json

    with DatabaseSession() as db:
        data_json = json.dumps(data) if data else None

        db.execute("""
            INSERT INTO notifications (user_id, from_user_id, type, title, message, data)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, from_user_id, notification_type, title, message, data_json))

        return db.lastrowid
