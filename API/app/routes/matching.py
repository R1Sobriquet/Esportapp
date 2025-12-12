"""
Matching routes.
Handles player matching and match management.
"""

from fastapi import APIRouter, HTTPException, Depends, Query

from ..services.auth import get_current_user_id
from ..services.matching import find_matches_advanced, create_match_record
from ..database import DatabaseSession

router = APIRouter()


@router.post("/matches")
def find_matches(
    user_id: int = Depends(get_current_user_id),
    limit: int = Query(default=10, le=20),
):
    """
    Find potential matches for the current user.

    Uses advanced weighted scoring algorithm considering:
    - Common games (30 pts each, max 60)
    - Game skill compatibility (up to 30 pts)
    - Overall skill level match (up to 20 pts)
    - Same region bonus (15 pts)
    - Same timezone bonus (up to 10 pts)
    - Compatible playstyle (up to 15 pts)
    """
    # Use advanced matching algorithm
    potential_matches = find_matches_advanced(user_id, limit=limit)

    if not potential_matches:
        # Check if user has games
        with DatabaseSession(dict_cursor=True) as db:
            db.execute("SELECT COUNT(*) as count FROM user_games WHERE user_id = %s", (user_id,))
            if db.fetchone()["count"] == 0:
                return {"matches": [], "message": "Ajoute des jeux à ton profil pour trouver des matchs"}
            return {"matches": [], "message": "Aucun nouveau match disponible pour le moment"}

    # Create match records and build response
    matches = []
    for match in potential_matches:
        match_id = create_match_record(user_id, match["user_id"], match["match_score"])
        match["match_id"] = match_id
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
