"""
Stats routes.
Handles platform statistics, popular players, and leaderboards.
"""

from fastapi import APIRouter, Query
from typing import Optional

from ..database import DatabaseSession

router = APIRouter()


@router.get("/stats/platform")
def get_platform_stats():
    """
    Get global platform statistics.

    Returns total users, games, matches, and messages.
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Get total users
        db.execute("SELECT COUNT(*) as count FROM users")
        total_users = db.fetchone()["count"]

        # Get total games
        db.execute("SELECT COUNT(*) as count FROM games")
        total_games = db.fetchone()["count"]

        # Get total successful matches
        db.execute("SELECT COUNT(*) as count FROM matches WHERE status = 'accepted'")
        total_matches = db.fetchone()["count"]

        # Get total messages
        db.execute("SELECT COUNT(*) as count FROM messages")
        total_messages = db.fetchone()["count"]

        # Get active users (logged in last 7 days)
        db.execute("""
            SELECT COUNT(DISTINCT user_id) as count
            FROM user_activity_log
            WHERE activity_type = 'login'
            AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        """)
        result = db.fetchone()
        active_users = result["count"] if result else 0

        return {
            "total_users": total_users,
            "total_games": total_games,
            "total_matches": total_matches,
            "total_messages": total_messages,
            "active_users_7d": active_users,
        }


@router.get("/stats/popular-players")
def get_popular_players(limit: int = Query(default=6, le=20)):
    """
    Get popular players based on match count and acceptance rate.

    Returns players with most accepted matches.
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute("""
            SELECT
                u.id,
                u.username,
                p.avatar_url,
                p.skill_level,
                p.bio,
                COUNT(DISTINCT m.id) as match_count,
                GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') as games
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN matches m ON (
                (m.user1_id = u.id OR m.user2_id = u.id)
                AND m.status = 'accepted'
            )
            LEFT JOIN user_games ug ON u.id = ug.user_id AND ug.is_favorite = 1
            LEFT JOIN games g ON ug.game_id = g.id
            WHERE p.profile_visibility = 'public' OR p.profile_visibility IS NULL
            GROUP BY u.id, u.username, p.avatar_url, p.skill_level, p.bio
            HAVING match_count > 0
            ORDER BY match_count DESC, u.username ASC
            LIMIT %s
        """, (limit,))

        players = db.fetchall()

        return {"players": players}


@router.get("/stats/recently-active")
def get_recently_active_players(limit: int = Query(default=6, le=20)):
    """
    Get recently active players.

    Returns players who logged in recently.
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute("""
            SELECT
                u.id,
                u.username,
                p.avatar_url,
                p.skill_level,
                p.bio,
                MAX(a.created_at) as last_active,
                GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') as games
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN user_activity_log a ON u.id = a.user_id
            LEFT JOIN user_games ug ON u.id = ug.user_id AND ug.is_favorite = 1
            LEFT JOIN games g ON ug.game_id = g.id
            WHERE (p.profile_visibility = 'public' OR p.profile_visibility IS NULL)
            AND a.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY u.id, u.username, p.avatar_url, p.skill_level, p.bio
            ORDER BY last_active DESC
            LIMIT %s
        """, (limit,))

        players = db.fetchall()

        # Format last_active as relative time
        for player in players:
            if player.get("last_active"):
                player["last_active"] = player["last_active"].isoformat()

        return {"players": players}


@router.get("/stats/top-matchers")
def get_top_matchers(limit: int = Query(default=6, le=20)):
    """
    Get players with the most matches.

    Returns top players by total match count.
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute("""
            SELECT
                u.id,
                u.username,
                p.avatar_url,
                p.skill_level,
                p.bio,
                COUNT(DISTINCT m.id) as match_count,
                SUM(CASE WHEN m.status = 'accepted' THEN 1 ELSE 0 END) as accepted_count,
                GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') as games
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN matches m ON (m.user1_id = u.id OR m.user2_id = u.id)
            LEFT JOIN user_games ug ON u.id = ug.user_id AND ug.is_favorite = 1
            LEFT JOIN games g ON ug.game_id = g.id
            WHERE p.profile_visibility = 'public' OR p.profile_visibility IS NULL
            GROUP BY u.id, u.username, p.avatar_url, p.skill_level, p.bio
            HAVING match_count > 0
            ORDER BY accepted_count DESC, match_count DESC
            LIMIT %s
        """, (limit,))

        players = db.fetchall()

        return {"players": players}


@router.get("/stats/games-ranking")
def get_games_ranking(limit: int = Query(default=10, le=50)):
    """
    Get most popular games by player count.

    Returns games ranked by number of players.
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute("""
            SELECT
                g.id,
                g.name,
                g.category,
                g.icon_url,
                COUNT(DISTINCT ug.user_id) as player_count
            FROM games g
            LEFT JOIN user_games ug ON g.id = ug.game_id
            GROUP BY g.id, g.name, g.category, g.icon_url
            ORDER BY player_count DESC
            LIMIT %s
        """, (limit,))

        games = db.fetchall()

        return {"games": games}


@router.get("/stats/user/{user_id}")
def get_user_public_stats(user_id: int):
    """
    Get public statistics for a specific user.

    Returns user's match count, games, and activity if profile is public.
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Check if profile is public
        db.execute("""
            SELECT p.profile_visibility, p.show_stats
            FROM user_profiles p
            WHERE p.user_id = %s
        """, (user_id,))
        profile = db.fetchone()

        if profile and profile.get("profile_visibility") == "private":
            return {"error": "Profile is private", "stats": None}

        show_stats = profile.get("show_stats", True) if profile else True

        if not show_stats:
            return {"error": "User has hidden their stats", "stats": None}

        # Get match stats
        db.execute("""
            SELECT
                COUNT(*) as total_matches,
                SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_matches,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_matches
            FROM matches
            WHERE user1_id = %s OR user2_id = %s
        """, (user_id, user_id))
        match_stats = db.fetchone()

        # Get game count
        db.execute("""
            SELECT COUNT(*) as game_count
            FROM user_games
            WHERE user_id = %s
        """, (user_id,))
        game_count = db.fetchone()["game_count"]

        # Get message count
        db.execute("""
            SELECT COUNT(*) as message_count
            FROM messages
            WHERE sender_id = %s
        """, (user_id,))
        message_count = db.fetchone()["message_count"]

        return {
            "stats": {
                "total_matches": match_stats["total_matches"],
                "accepted_matches": match_stats["accepted_matches"],
                "pending_matches": match_stats["pending_matches"],
                "game_count": game_count,
                "message_count": message_count,
            }
        }
