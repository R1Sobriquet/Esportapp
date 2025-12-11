"""
Matching routes.
Handles player matching and match management.
"""

from fastapi import APIRouter, HTTPException, Depends

from ..services.auth import get_current_user_id
from ..database import DatabaseSession

router = APIRouter()


@router.post("/matches")
def find_matches(user_id: int = Depends(get_current_user_id)):
    """
    Find potential matches for the current user.

    Searches for users with common games and creates match records.
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Get user's games
        db.execute(
            "SELECT game_id, skill_level FROM user_games WHERE user_id = %s",
            (user_id,),
        )
        user_games = db.fetchall()

        if not user_games:
            return {"matches": [], "message": "Add games to your profile to find matches"}

        game_ids = [g["game_id"] for g in user_games]
        placeholders = ",".join(["%s"] * len(game_ids))

        # Find potential matches
        query = f"""
            SELECT DISTINCT
                u.id as user_id,
                u.username,
                p.avatar_url,
                p.bio,
                p.skill_level,
                p.looking_for,
                p.timezone,
                p.region,
                GROUP_CONCAT(DISTINCT g.name) as games,
                COUNT(DISTINCT ug.game_id) as common_game_count
            FROM users u
            JOIN user_profiles p ON u.id = p.user_id
            JOIN user_games ug ON u.id = ug.user_id
            JOIN games g ON ug.game_id = g.id
            WHERE u.id != %s
                AND p.profile_visibility != 'private'
                AND ug.game_id IN ({placeholders})
                AND u.id NOT IN (
                    SELECT CASE
                        WHEN user1_id = %s THEN user2_id
                        ELSE user1_id
                    END
                    FROM matches
                    WHERE (user1_id = %s OR user2_id = %s)
                    AND status IN ('accepted', 'pending')
                )
            GROUP BY u.id
            ORDER BY common_game_count DESC
            LIMIT 10
        """

        params = [user_id] + game_ids + [user_id, user_id, user_id]
        db.execute(query, params)
        potential_matches = db.fetchall()

        # Calculate match scores and create match records
        matches = []
        for match in potential_matches:
            # Simple scoring based on common games
            score = min(100, match["common_game_count"] * 25)

            # Create match record
            db.execute(
                """
                INSERT INTO matches (user1_id, user2_id, match_score, status)
                VALUES (%s, %s, %s, 'pending')
                ON DUPLICATE KEY UPDATE match_score = VALUES(match_score)
                """,
                (user_id, match["user_id"], score),
            )

            match["match_score"] = score
            match["match_id"] = db.lastrowid
            matches.append(match)

        return {"matches": matches}


@router.get("/matches")
def get_matches(user_id: int = Depends(get_current_user_id)):
    """
    Get current user's matches.

    Returns all pending and accepted matches.
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute(
            """
            SELECT
                m.id as match_id,
                m.match_score,
                m.status,
                m.created_at,
                u.id as user_id,
                u.username,
                p.avatar_url,
                p.bio,
                p.skill_level,
                p.looking_for,
                GROUP_CONCAT(DISTINCT g.name) as games
            FROM matches m
            JOIN users u ON (
                CASE
                    WHEN m.user1_id = %s THEN m.user2_id
                    ELSE m.user1_id
                END = u.id
            )
            JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN user_games ug ON u.id = ug.user_id
            LEFT JOIN games g ON ug.game_id = g.id
            WHERE (m.user1_id = %s OR m.user2_id = %s)
                AND m.status IN ('pending', 'accepted')
            GROUP BY m.id
            ORDER BY m.status ASC, m.match_score DESC
            """,
            (user_id, user_id, user_id),
        )

        return {"matches": db.fetchall()}


@router.post("/matches/{match_id}/accept")
def accept_match(match_id: int, user_id: int = Depends(get_current_user_id)):
    """
    Accept a match.

    Args:
        match_id: The ID of the match to accept
    """
    with DatabaseSession() as db:
        db.execute(
            """
            UPDATE matches SET status = 'accepted'
            WHERE id = %s AND (user1_id = %s OR user2_id = %s) AND status = 'pending'
            """,
            (match_id, user_id, user_id),
        )

        if db.rowcount == 0:
            raise HTTPException(status_code=404, detail="Match not found or already processed")

        return {"success": True, "message": "Match accepted"}


@router.post("/matches/{match_id}/reject")
def reject_match(match_id: int, user_id: int = Depends(get_current_user_id)):
    """
    Reject a match.

    Args:
        match_id: The ID of the match to reject
    """
    with DatabaseSession() as db:
        db.execute(
            """
            UPDATE matches SET status = 'rejected'
            WHERE id = %s AND (user1_id = %s OR user2_id = %s)
            """,
            (match_id, user_id, user_id),
        )

        if db.rowcount == 0:
            raise HTTPException(status_code=404, detail="Match not found")

        return {"success": True, "message": "Match rejected"}
