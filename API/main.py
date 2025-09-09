from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import MySQLdb

app = FastAPI()

# Connection to MySQL
db = MySQLdb.connect(
    host="localhost",
    user="root",
    passwd="11081971",  # change if necessary
    db="esport_social",
    charset='utf8mb4'
)
cursor = db.cursor()

@app.get("/")
def root():
    return {"status": "API is running"}



# ---------------- USERS ----------------

class User(BaseModel):
    email: str
    username: str
    password_hash: str


@app.get("/users")
def get_users():
    cursor.execute("SELECT id, email, username, password_hash, email_verified FROM users")
    rows = cursor.fetchall()
    return [
        {
            "id": row[0],
            "email": row[1],
            "username": row[2],
            "password_hash": row[3],
            "email_verified": bool(row[4])
        } for row in rows
    ]


@app.post("/users")
def create_user(user: User):
    try:
        cursor.execute(
            "INSERT INTO users (email, username, password_hash) VALUES (%s, %s, %s)",
            (user.email, user.username, user.password_hash)
        )
        db.commit()
        return {"status": "created"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    db.commit()
    return {"status": "deleted"}


# ---------------- USER PROFILES ----------------

class UserProfile(BaseModel):
    user_id: int
    region: str = None
    date_of_birth: str = None
    avatar_url: str = None
    bio: str = None
    timezone: str = None
    discord_username: str = None
    steam_id: str = None
    twitch_username: str = None
    skill_level: str = 'beginner'
    looking_for: str = 'teammates'
    profile_visibility: str = 'public'
    show_stats: bool = True
    allow_friend_requests: bool = True


@app.get("/profiles")
def get_profiles():
    cursor.execute("SELECT * FROM user_profiles")
    rows = cursor.fetchall()
    return [dict(zip([d[0] for d in cursor.description], row)) for row in rows]


@app.post("/profiles")
def create_profile(profile: UserProfile):
    try:
        cursor.execute("""
            INSERT INTO user_profiles (
                user_id, region, date_of_birth, avatar_url, bio, timezone,
                discord_username, steam_id, twitch_username,
                skill_level, looking_for, profile_visibility,
                show_stats, allow_friend_requests
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            profile.user_id, profile.region, profile.date_of_birth, profile.avatar_url,
            profile.bio, profile.timezone, profile.discord_username, profile.steam_id,
            profile.twitch_username, profile.skill_level, profile.looking_for,
            profile.profile_visibility, profile.show_stats, profile.allow_friend_requests
        ))
        db.commit()
        return {"status": "created"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/profiles/{user_id}")
def delete_profile(user_id: int):
    cursor.execute("DELETE FROM user_profiles WHERE user_id = %s", (user_id,))
    db.commit()
    return {"status": "deleted"}

# ---------------- GAMES ----------------

class Game(BaseModel):
    name: str
    category: str = None
    icon_url: str = None
    api_id: str = None


@app.get("/games")
def get_games():
    cursor.execute("SELECT * FROM games")
    rows = cursor.fetchall()
    return [dict(zip([d[0] for d in cursor.description], row)) for row in rows]


@app.post("/games")
def create_game(game: Game):
    cursor.execute("""
        INSERT INTO games (name, category, icon_url, api_id)
        VALUES (%s, %s, %s, %s)
    """, (game.name, game.category, game.icon_url, game.api_id))
    db.commit()
    return {"status": "created"}


@app.delete("/games/{game_id}")
def delete_game(game_id: int):
    cursor.execute("DELETE FROM games WHERE id = %s", (game_id,))
    db.commit()
    return {"status": "deleted"}


# ---------------- USER GAMES ----------------

class UserGame(BaseModel):
    user_id: int
    game_id: int
    skill_level: str = 'beginner'
    game_rank: str = None
    hours_played: int = 0
    is_favorite: bool = False


@app.get("/user_games")
def get_user_games():
    cursor.execute("SELECT * FROM user_games")
    rows = cursor.fetchall()
    return [dict(zip([d[0] for d in cursor.description], row)) for row in rows]


@app.post("/user_games")
def create_user_game(data: UserGame):
    cursor.execute("""
        INSERT INTO user_games (
            user_id, game_id, skill_level, game_rank, hours_played, is_favorite
        ) VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        data.user_id, data.game_id, data.skill_level, data.game_rank,
        data.hours_played, data.is_favorite
    ))
    db.commit()
    return {"status": "created"}


@app.delete("/user_games/{user_id}/{game_id}")
def delete_user_game(user_id: int, game_id: int):
    cursor.execute("DELETE FROM user_games WHERE user_id = %s AND game_id = %s", (user_id, game_id))
    db.commit()
    return {"status": "deleted"}


# ---------------- USER PREFERENCES ----------------

class Preference(BaseModel):
    user_id: int
    preferred_game_mode: str = "any"
    preferred_playtime: str = "any"


@app.get("/preferences")
def get_preferences():
    cursor.execute("SELECT * FROM user_preferences")
    rows = cursor.fetchall()
    return [dict(zip([d[0] for d in cursor.description], row)) for row in rows]


@app.post("/preferences")
def create_preference(pref: Preference):
    cursor.execute("""
        INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime)
        VALUES (%s, %s, %s)
    """, (pref.user_id, pref.preferred_game_mode, pref.preferred_playtime))
    db.commit()
    return {"status": "created"}


@app.delete("/preferences/{pref_id}")
def delete_preference(pref_id: int):
    cursor.execute("DELETE FROM user_preferences WHERE id = %s", (pref_id,))
    db.commit()
    return {"status": "deleted"}


# ---------------- MATCHES ----------------

class Match(BaseModel):
    user1_id: int
    user2_id: int
    match_score: float = 0.0
    status: str = "pending"


@app.get("/matches")
def get_matches():
    cursor.execute("SELECT * FROM matches")
    rows = cursor.fetchall()
    return [dict(zip([d[0] for d in cursor.description], row)) for row in rows]


@app.post("/matches")
def create_match(match: Match):
    cursor.execute("""
        INSERT INTO matches (user1_id, user2_id, match_score, status)
        VALUES (%s, %s, %s, %s)
    """, (match.user1_id, match.user2_id, match.match_score, match.status))
    db.commit()
    return {"status": "created"}


@app.delete("/matches/{match_id}")
def delete_match(match_id: int):
    cursor.execute("DELETE FROM matches WHERE id = %s", (match_id,))
    db.commit()
    return {"status": "deleted"}


# ---------------- MESSAGES ----------------

class Message(BaseModel):
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool = False


@app.get("/messages")
def get_messages():
    cursor.execute("SELECT * FROM messages")
    rows = cursor.fetchall()
    return [dict(zip([d[0] for d in cursor.description], row)) for row in rows]


@app.post("/messages")
def send_message(msg: Message):
    cursor.execute("""
        INSERT INTO messages (sender_id, receiver_id, content, is_read)
        VALUES (%s, %s, %s, %s)
    """, (msg.sender_id, msg.receiver_id, msg.content, msg.is_read))
    db.commit()
    return {"status": "sent"}


@app.delete("/messages/{msg_id}")
def delete_message(msg_id: int):
    cursor.execute("DELETE FROM messages WHERE id = %s", (msg_id,))
    db.commit()
    return {"status": "deleted"}


@app.patch("/messages/{msg_id}/read")
def mark_as_read(msg_id: int):
    cursor.execute("UPDATE messages SET is_read = TRUE WHERE id = %s", (msg_id,))
    db.commit()
    return {"status": "marked as read"}
