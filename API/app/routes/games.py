"""
Games routes.
Handles game catalog and user game management with improved validation.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List

from ..models.game import UserGame, GameResponse, UserGameResponse
from ..services.auth import get_current_user_id
from ..database import DatabaseSession

router = APIRouter()


@router.get("/games", response_model=List[GameResponse])
def get_all_games():
    """
    Get all available games.

    Returns the complete game catalog sorted alphabetically.
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute("SELECT id, name, category, icon_url FROM games ORDER BY name ASC")
        return db.fetchall()


@router.get("/user/games", response_model=List[UserGameResponse])
def get_user_games(user_id: int = Depends(get_current_user_id)):
    """
    Get games in the current user's profile.

    Returns all games the user has added to their profile,
    sorted by favorites first, then alphabetically.
    """
    with DatabaseSession(dict_cursor=True) as db:
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
        return db.fetchall()


@router.post("/user/games", status_code=status.HTTP_201_CREATED)
def add_user_game(game_data: UserGame, user_id: int = Depends(get_current_user_id)):
    """
    Add a game to the user's profile.

    Validates that:
    - The game exists in the catalog
    - The game is not already in the user's profile

    Returns the added game details.
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Verify game exists
        db.execute("SELECT id, name FROM games WHERE id = %s", (game_data.game_id,))
        game = db.fetchone()

        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Game with ID {game_data.game_id} not found"
            )

        # Check if already in profile
        db.execute(
            "SELECT id FROM user_games WHERE user_id = %s AND game_id = %s",
            (user_id, game_data.game_id)
        )
        existing = db.fetchone()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Game '{game['name']}' is already in your profile"
            )

        # Insert the game
        db.execute(
            """
            INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                game_data.game_id,
                game_data.skill_level,
                game_data.game_rank,
                game_data.hours_played,
                game_data.is_favorite,
            ),
        )

        return {
            "success": True,
            "message": f"Game '{game['name']}' added to your profile",
            "game_id": game_data.game_id,
            "game_name": game['name']
        }


@router.put("/user/games/{game_id}")
def update_user_game(
    game_id: int,
    game_data: UserGame,
    user_id: int = Depends(get_current_user_id)
):
    """
    Update a game in the user's profile.

    Updates skill level, rank, hours played, and favorite status.
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Check if game is in profile
        db.execute(
            "SELECT id FROM user_games WHERE user_id = %s AND game_id = %s",
            (user_id, game_id)
        )
        existing = db.fetchone()

        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found in your profile"
            )

        # Update the game
        db.execute(
            """
            UPDATE user_games
            SET skill_level = %s, game_rank = %s, hours_played = %s, is_favorite = %s
            WHERE user_id = %s AND game_id = %s
            """,
            (
                game_data.skill_level,
                game_data.game_rank,
                game_data.hours_played,
                game_data.is_favorite,
                user_id,
                game_id
            ),
        )

        return {"success": True, "message": "Game updated successfully"}


@router.delete("/user/games/{game_id}")
def remove_user_game(game_id: int, user_id: int = Depends(get_current_user_id)):
    """
    Remove a game from the user's profile.

    Args:
        game_id: The ID of the game to remove
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Get game name for response message
        db.execute(
            """
            SELECT g.name
            FROM user_games ug
            JOIN games g ON ug.game_id = g.id
            WHERE ug.user_id = %s AND ug.game_id = %s
            """,
            (user_id, game_id)
        )
        game = db.fetchone()

        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found in your profile"
            )

        # Delete the game
        db.execute(
            "DELETE FROM user_games WHERE user_id = %s AND game_id = %s",
            (user_id, game_id),
        )

        return {
            "success": True,
            "message": f"Game '{game['name']}' removed from your profile"
        }


@router.get("/games/categories")
def get_game_categories():
    """
    Get all unique game categories.

    Returns a list of categories for filtering.
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute(
            """
            SELECT DISTINCT category
            FROM games
            WHERE category IS NOT NULL
            ORDER BY category ASC
            """
        )
        categories = db.fetchall()
        return [cat['category'] for cat in categories]


@router.get("/games/search")
def search_games(q: str = "", category: str = None):
    """
    Search games by name and/or category.

    Args:
        q: Search query for game name
        category: Filter by category
    """
    with DatabaseSession(dict_cursor=True) as db:
        query = "SELECT id, name, category, icon_url FROM games WHERE 1=1"
        params = []

        if q:
            query += " AND name LIKE %s"
            params.append(f"%{q}%")

        if category:
            query += " AND category = %s"
            params.append(category)

        query += " ORDER BY name ASC LIMIT 50"

        db.execute(query, tuple(params) if params else None)
        return db.fetchall()
