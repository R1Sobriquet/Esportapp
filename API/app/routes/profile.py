"""
Profile routes.
Handles user profile operations and activity stats.
"""

from fastapi import APIRouter, HTTPException, Depends

from ..models.user import UserProfile
from ..services.auth import get_current_user_id
from ..services.activity_monitor import ActivityMonitor
from ..database import DatabaseSession, get_db_connection

router = APIRouter()


@router.get("/profile")
def get_profile(user_id: int = Depends(get_current_user_id)):
    """
    Get the current user's profile.

    Returns user information, games, and preferences.
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Get user and profile info
        db.execute(
            """
            SELECT
                u.id, u.username, u.email, u.created_at,
                p.region, p.date_of_birth, p.avatar_url,
                p.bio, p.timezone, p.discord_username,
                p.steam_id, p.twitch_username, p.skill_level, p.looking_for,
                p.profile_visibility, p.show_stats, p.allow_friend_requests
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = %s
            """,
            (user_id,),
        )
        profile = db.fetchone()

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Get user's games
        db.execute(
            """
            SELECT
                g.id, g.name, g.category, g.icon_url,
                ug.skill_level, ug.game_rank, ug.hours_played, ug.is_favorite
            FROM user_games ug
            JOIN games g ON ug.game_id = g.id
            WHERE ug.user_id = %s
            ORDER BY ug.is_favorite DESC, g.name ASC
            """,
            (user_id,),
        )
        games = db.fetchall()

        # Get preferences
        db.execute(
            """
            SELECT preferred_game_mode, preferred_playtime
            FROM user_preferences
            WHERE user_id = %s
            """,
            (user_id,),
        )
        preferences = db.fetchall()

        return {
            "profile": profile,
            "games": games,
            "preferences": preferences,
        }


@router.put("/profile")
def update_profile(profile_data: UserProfile, user_id: int = Depends(get_current_user_id)):
    """
    Update the current user's profile.

    Updates profile fields with the provided data.
    """
    with DatabaseSession() as db:
        db.execute(
            """
            UPDATE user_profiles SET
                region = %s,
                date_of_birth = %s,
                avatar_url = %s,
                bio = %s,
                timezone = %s,
                discord_username = %s,
                steam_id = %s,
                twitch_username = %s,
                skill_level = %s,
                looking_for = %s,
                profile_visibility = %s,
                show_stats = %s,
                allow_friend_requests = %s
            WHERE user_id = %s
            """,
            (
                profile_data.region,
                profile_data.date_of_birth,
                profile_data.avatar_url,
                profile_data.bio,
                profile_data.timezone,
                profile_data.discord_username,
                profile_data.steam_id,
                profile_data.twitch_username,
                profile_data.skill_level,
                profile_data.looking_for,
                profile_data.profile_visibility,
                profile_data.show_stats,
                profile_data.allow_friend_requests,
                user_id,
            ),
        )

        return {"success": True, "message": "Profile updated"}


@router.get("/user/activity-stats")
def get_user_activity_stats(user_id: int = Depends(get_current_user_id)):
    """
    Get activity statistics for the current user.

    Returns login count, messages sent, and other activity metrics.
    """
    db = get_db_connection()
    try:
        monitor = ActivityMonitor(db)
        stats = monitor.get_activity_stats(user_id)
        return {"stats": stats}
    finally:
        db.close()
