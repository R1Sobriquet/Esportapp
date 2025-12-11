"""
Authentication routes.
Handles user registration and login.
"""

from fastapi import APIRouter, HTTPException, Depends
import MySQLdb.cursors

from ..models.user import UserRegister, UserLogin
from ..services.auth import create_access_token, hash_password, verify_password
from ..database import DatabaseSession

router = APIRouter()


@router.post("/register")
def register(user: UserRegister):
    """
    Register a new user.

    Creates a new user account with the provided credentials
    and returns an authentication token.
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Check if user exists
        db.execute(
            "SELECT id FROM users WHERE email = %s OR username = %s",
            (user.email, user.username),
        )

        if db.fetchone():
            raise HTTPException(status_code=400, detail="Email or username already exists")

        # Create user
        password_hash = hash_password(user.password)
        db.execute(
            "INSERT INTO users (email, username, password_hash) VALUES (%s, %s, %s)",
            (user.email, user.username, password_hash),
        )
        user_id = db.lastrowid

        # Create profile with new schema
        profile = user.profile if user.profile else {}
        db.execute(
            """
            INSERT INTO user_profiles (
                user_id, region, date_of_birth, avatar_url, bio, timezone,
                discord_username, steam_id, twitch_username,
                skill_level, looking_for, profile_visibility,
                show_stats, allow_friend_requests
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                profile.get("region"),
                profile.get("date_of_birth"),
                profile.get("avatar_url"),
                profile.get("bio"),
                profile.get("timezone"),
                profile.get("discord_username"),
                profile.get("steam_id"),
                profile.get("twitch_username"),
                profile.get("skill_level", "beginner"),
                profile.get("looking_for", "teammates"),
                profile.get("profile_visibility", "public"),
                profile.get("show_stats", True),
                profile.get("allow_friend_requests", True),
            ),
        )

        # Generate token
        token = create_access_token(user_id)

        return {
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "email": user.email,
                "username": user.username,
            },
        }


@router.post("/login")
def login(user: UserLogin):
    """
    Authenticate a user.

    Validates credentials and returns an authentication token.
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute(
            "SELECT id, username, password_hash, email_verified FROM users WHERE email = %s",
            (user.email,),
        )
        db_user = db.fetchone()

        if not db_user or not verify_password(user.password, db_user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token(db_user["id"])

        return {
            "success": True,
            "token": token,
            "user": {
                "id": db_user["id"],
                "username": db_user["username"],
                "email": user.email,
                "email_verified": bool(db_user["email_verified"]),
            },
        }
