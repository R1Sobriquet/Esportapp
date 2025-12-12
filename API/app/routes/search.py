"""
Search routes.
Handles search for players and games.
"""

from fastapi import APIRouter, Query, Depends
from typing import Optional

from ..services.auth import get_current_user_id
from ..database import DatabaseSession

router = APIRouter()


@router.get("/search/players")
def search_players(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    game: Optional[str] = Query(None, description="Filter by game name"),
    skill_level: Optional[str] = Query(None, description="Filter by skill level"),
    region: Optional[str] = Query(None, description="Filter by region"),
    looking_for: Optional[str] = Query(None, description="Filter by looking_for"),
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0),
):
    """
    Search for players by username, bio, or games.

    Args:
        q: Search query (searches username, bio)
        game: Optional filter by game name
        skill_level: Optional filter by skill level
        region: Optional filter by region
        looking_for: Optional filter by looking_for preference
        limit: Maximum results to return
        offset: Pagination offset
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Build dynamic query
        conditions = ["(p.profile_visibility != 'private' OR p.profile_visibility IS NULL)"]
        params = []

        # Search in username and bio
        conditions.append("(u.username LIKE %s OR p.bio LIKE %s)")
        search_term = f"%{q}%"
        params.extend([search_term, search_term])

        # Optional filters
        if skill_level:
            conditions.append("p.skill_level = %s")
            params.append(skill_level)

        if region:
            conditions.append("p.region = %s")
            params.append(region)

        if looking_for:
            conditions.append("p.looking_for = %s")
            params.append(looking_for)

        where_clause = " AND ".join(conditions)

        # Game filter requires a join
        game_join = ""
        if game:
            game_join = """
                JOIN user_games ug_filter ON u.id = ug_filter.user_id
                JOIN games g_filter ON ug_filter.game_id = g_filter.id AND g_filter.name LIKE %s
            """
            params.insert(0, f"%{game}%")  # Add at beginning for join

        query = f"""
            SELECT DISTINCT
                u.id,
                u.username,
                p.avatar_url,
                p.bio,
                p.skill_level,
                p.looking_for,
                p.region,
                p.timezone,
                GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') as games,
                COUNT(DISTINCT ug.game_id) as game_count
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN user_games ug ON u.id = ug.user_id
            LEFT JOIN games g ON ug.game_id = g.id
            {game_join}
            WHERE {where_clause}
            GROUP BY u.id, u.username, p.avatar_url, p.bio, p.skill_level,
                     p.looking_for, p.region, p.timezone
            ORDER BY
                CASE WHEN u.username LIKE %s THEN 0 ELSE 1 END,
                game_count DESC,
                u.username ASC
            LIMIT %s OFFSET %s
        """

        # Priority sort for exact username match
        params.append(f"{q}%")
        params.extend([limit, offset])

        db.execute(query, params)
        players = db.fetchall()

        # Get total count
        count_query = f"""
            SELECT COUNT(DISTINCT u.id) as total
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            {game_join}
            WHERE {where_clause}
        """
        # Remove limit/offset params for count
        count_params = params[:-3] if not game else params[:-3]
        count_params = count_params[:-1]  # Remove priority sort param
        db.execute(count_query, count_params)
        total = db.fetchone()["total"]

        return {
            "players": players,
            "total": total,
            "limit": limit,
            "offset": offset,
        }


@router.get("/search/games")
def search_games(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0),
):
    """
    Search for games by name or category.

    Args:
        q: Search query
        category: Optional filter by category
        limit: Maximum results
        offset: Pagination offset
    """
    with DatabaseSession(dict_cursor=True) as db:
        conditions = ["g.name LIKE %s"]
        params = [f"%{q}%"]

        if category:
            conditions.append("g.category = %s")
            params.append(category)

        where_clause = " AND ".join(conditions)

        query = f"""
            SELECT
                g.id,
                g.name,
                g.category,
                g.icon_url,
                COUNT(DISTINCT ug.user_id) as player_count
            FROM games g
            LEFT JOIN user_games ug ON g.id = ug.game_id
            WHERE {where_clause}
            GROUP BY g.id, g.name, g.category, g.icon_url
            ORDER BY
                CASE WHEN g.name LIKE %s THEN 0 ELSE 1 END,
                player_count DESC,
                g.name ASC
            LIMIT %s OFFSET %s
        """

        params.append(f"{q}%")  # Priority for exact match
        params.extend([limit, offset])

        db.execute(query, params)
        games = db.fetchall()

        # Get total
        count_query = f"""
            SELECT COUNT(*) as total FROM games g WHERE {where_clause}
        """
        db.execute(count_query, params[:len(conditions)])
        total = db.fetchone()["total"]

        return {
            "games": games,
            "total": total,
            "limit": limit,
            "offset": offset,
        }


@router.get("/search/suggestions")
def get_search_suggestions(
    q: str = Query(..., min_length=1, max_length=50),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    """
    Get search suggestions for autocomplete.

    Returns player usernames and game names matching query.
    """
    with DatabaseSession(dict_cursor=True) as db:
        suggestions = {"players": [], "games": []}

        # Player suggestions
        db.execute("""
            SELECT u.id, u.username, p.avatar_url
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.username LIKE %s
            AND (p.profile_visibility != 'private' OR p.profile_visibility IS NULL)
            ORDER BY
                CASE WHEN u.username LIKE %s THEN 0 ELSE 1 END,
                u.username ASC
            LIMIT 5
        """, (f"%{q}%", f"{q}%"))
        suggestions["players"] = db.fetchall()

        # Game suggestions
        db.execute("""
            SELECT g.id, g.name, g.icon_url, COUNT(ug.user_id) as player_count
            FROM games g
            LEFT JOIN user_games ug ON g.id = ug.game_id
            WHERE g.name LIKE %s
            GROUP BY g.id, g.name, g.icon_url
            ORDER BY
                CASE WHEN g.name LIKE %s THEN 0 ELSE 1 END,
                player_count DESC
            LIMIT 5
        """, (f"%{q}%", f"{q}%"))
        suggestions["games"] = db.fetchall()

        return suggestions
