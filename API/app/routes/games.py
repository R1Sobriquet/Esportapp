"""
Games routes.
Handles game catalog and user game management.
"""

from fastapi import APIRouter, HTTPException, Depends

from ..models.game import UserGame
from ..services.auth import get_current_user_id
from ..database import DatabaseSession

router = APIRouter()


@router.get("/games")
def get_all_games():
    """
    Get all available games.

    Returns the complete game catalog.
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute("SELECT * FROM games ORDER BY name ASC")
        return db.fetchall()


@router.get("/user/games")
def get_user_games(user_id: int = Depends(get_current_user_id)):
    """
    Get games in the current user's profile.

    Returns all games the user has added to their profile.
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


@router.post("/user/games")
def add_user_game(game_data: UserGame, user_id: int = Depends(get_current_user_id)):
    """
    Add or update a game in the user's profile.

    If the game already exists, updates the existing entry.
    """
    with DatabaseSession() as db:
        db.execute(
            """
            INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                skill_level = VALUES(skill_level),
                game_rank = VALUES(game_rank),
                hours_played = VALUES(hours_played),
                is_favorite = VALUES(is_favorite)
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

        return {"success": True, "message": "Game added/updated"}


@router.delete("/user/games/{game_id}")
def remove_user_game(game_id: int, user_id: int = Depends(get_current_user_id)):
    """
    Remove a game from the user's profile.

    Args:
        game_id: The ID of the game to remove
    """
    with DatabaseSession() as db:
        db.execute(
            "DELETE FROM user_games WHERE user_id = %s AND game_id = %s",
            (user_id, game_id),
        )

        if db.rowcount == 0:
            raise HTTPException(status_code=404, detail="Game not found in profile")

        return {"success": True, "message": "Game removed"}
