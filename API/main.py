from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from services.activity_monitor import ActivityMonitor, check_inactive_accounts_task
import asyncio
from contextlib import asynccontextmanager
import os
import sys
import secrets
import jwt
import bcrypt
import MySQLdb
from jwt import ExpiredSignatureError, InvalidTokenError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app instance
from fastapi import FastAPI
# app = FastAPI()
# Context manager pour gérer le cycle de vie
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    task = asyncio.create_task(check_inactive_accounts_task())
    yield
    # Shutdown
    task.cancel()

app = FastAPI(
    title="E-Sport Social Platform API",
    lifespan=lifespan
)

# ===================== SECURITY CONFIG =====================
#  Vulnérabilité Critique JWT_SECRET - Validation au démarrage
def get_jwt_secret():
    """Get JWT secret or generate one if not exists."""
    secret = os.getenv("JWT_SECRET")

    if not secret or secret == "your-secret-key-change-this":
        if os.getenv("ENV") == "production":
            print("CRITICAL ERROR: JWT_SECRET not configured in production!")
            sys.exit(1)

        secret_file = ".jwt_secret"

        if os.path.exists(secret_file):
            with open(secret_file, "r") as f:
                return f.read().strip()

        new_secret = secrets.token_urlsafe(64)

        with open(secret_file, "w") as f:
            f.write(new_secret)

        print("⚠️ JWT_SECRET was missing, a new one has been generated in .jwt_secret")
        return new_secret

    return secret

# Apply secure secret
SECRET_KEY = get_jwt_secret()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

security = HTTPBearer()
#  Vulnérabilité Critique JWT_SECRET
# CORS Configuration (moved after 'app' is defined)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db():
    return MySQLdb.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        passwd=os.getenv("DB_PASS", ""),
        db=os.getenv("DB_NAME", "esport_social"),
        charset='utf8mb4'
    )

# ===================== MODELS =====================

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    profile: Optional[dict] = {}

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    region: Optional[str] = None
    date_of_birth: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    timezone: Optional[str] = None
    discord_username: Optional[str] = None
    steam_id: Optional[str] = None
    twitch_username: Optional[str] = None
    skill_level: Optional[str] = 'beginner'
    looking_for: Optional[str] = 'teammates'
    profile_visibility: Optional[str] = 'public'
    show_stats: Optional[bool] = True
    allow_friend_requests: Optional[bool] = True

class Game(BaseModel):
    name: str
    category: Optional[str] = None
    icon_url: Optional[str] = None
    api_id: Optional[str] = None

class UserGame(BaseModel):
    game_id: int
    skill_level: Optional[str] = 'beginner'
    game_rank: Optional[str] = None
    hours_played: Optional[int] = 0
    is_favorite: Optional[bool] = False

class Message(BaseModel):
    receiver_id: int
    content: str

class MatchAction(BaseModel):
    action: str  # 'accept' or 'reject'

# ===================== AUTHENTICATION =====================

def create_access_token(user_id: int):
    expires = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode = {"user_id": user_id, "exp": expires}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# ===================== AUTH ENDPOINTS =====================

@app.post("/register")
def register(user: UserRegister):
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = %s OR username = %s", 
                      (user.email, user.username))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email or username already exists")
        
        # Create user
        password_hash = hash_password(user.password)
        cursor.execute(
            "INSERT INTO users (email, username, password_hash) VALUES (%s, %s, %s)",
            (user.email, user.username, password_hash)
        )
        user_id = cursor.lastrowid
        
        # Create profile with new schema (region instead of first_name/last_name)
        profile = user.profile if user.profile else {}
        cursor.execute("""
            INSERT INTO user_profiles (
                user_id, region, date_of_birth, avatar_url, bio, timezone,
                discord_username, steam_id, twitch_username,
                skill_level, looking_for, profile_visibility,
                show_stats, allow_friend_requests
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            profile.get('region'),
            profile.get('date_of_birth'),
            profile.get('avatar_url'),
            profile.get('bio'),
            profile.get('timezone'),
            profile.get('discord_username'),
            profile.get('steam_id'),
            profile.get('twitch_username'),
            profile.get('skill_level', 'beginner'),
            profile.get('looking_for', 'teammates'),
            profile.get('profile_visibility', 'public'),
            profile.get('show_stats', True),
            profile.get('allow_friend_requests', True)
        ))
        
        db.commit()
        
        # Generate token
        token = create_access_token(user_id)
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "email": user.email,
                "username": user.username
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()

@app.post("/login")
def login(user: UserLogin):
    db = get_db()
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    try:
        cursor.execute(
            "SELECT id, username, password_hash, email_verified FROM users WHERE email = %s",
            (user.email,)
        )
        db_user = cursor.fetchone()
        
        if not db_user or not verify_password(user.password, db_user['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = create_access_token(db_user['id'])
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": db_user['id'],
                "username": db_user['username'],
                "email": user.email,
                "email_verified": bool(db_user['email_verified'])
            }
        }
    finally:
        cursor.close()
        db.close()


# ===================== Système de Détection des Comptes Inactifs =====================

# Middleware pour tracker l'activité
@app.middleware("http")
async def track_activity(request, call_next):
    response = await call_next(request)
    
    # Si l'utilisateur est authentifié, logger l'activité
    if hasattr(request.state, "user_id"):
        try:
            db = get_db()
            monitor = ActivityMonitor(db)
            monitor.log_activity(
                user_id=request.state.user_id,
                activity_type="api_call",
                ip=request.client.host,
                user_agent=request.headers.get("User-Agent")
            )
        except:
            pass  # Ne pas bloquer la requête si le logging échoue
    
    return response

# Endpoint pour les stats d'activité
@app.get("/user/activity-stats")
def get_user_activity_stats(user_id: int = Depends(verify_token)):
    db = get_db()
    monitor = ActivityMonitor(db)
    stats = monitor.get_activity_stats(user_id)
    return {"stats": stats}

# ===================== PROFILE ENDPOINTS =====================

@app.get("/profile")
def get_profile(user_id: int = Depends(verify_token)):
    db = get_db()
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    try:
        # Get user and profile info (updated for new schema)
        cursor.execute("""
            SELECT 
                u.id, u.username, u.email, u.created_at,
                p.region, p.date_of_birth, p.avatar_url,
                p.bio, p.timezone, p.discord_username,
                p.steam_id, p.twitch_username, p.skill_level, p.looking_for,
                p.profile_visibility, p.show_stats, p.allow_friend_requests
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = %s
        """, (user_id,))
        profile = cursor.fetchone()
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Get user's games
        cursor.execute("""
            SELECT 
                g.id, g.name, g.category, g.icon_url,
                ug.skill_level, ug.game_rank, ug.hours_played, ug.is_favorite
            FROM user_games ug
            JOIN games g ON ug.game_id = g.id
            WHERE ug.user_id = %s
            ORDER BY ug.is_favorite DESC, g.name ASC
        """, (user_id,))
        games = cursor.fetchall()
        
        # Get preferences
        cursor.execute("""
            SELECT preferred_game_mode, preferred_playtime
            FROM user_preferences
            WHERE user_id = %s
        """, (user_id,))
        preferences = cursor.fetchall()
        
        return {
            "profile": profile,
            "games": games,
            "preferences": preferences
        }
    finally:
        cursor.close()
        db.close()

@app.put("/profile")
def update_profile(profile_data: UserProfile, user_id: int = Depends(verify_token)):
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Update profile with new schema
        cursor.execute("""
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
        """, (
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
            user_id
        ))
        
        db.commit()
        return {"success": True, "message": "Profile updated"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()

# ===================== GAMES ENDPOINTS =====================

@app.get("/games")
def get_all_games():
    db = get_db()
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    try:
        cursor.execute("SELECT * FROM games ORDER BY name ASC")
        return cursor.fetchall()
    finally:
        cursor.close()
        db.close()

@app.get("/user/games")
def get_user_games(user_id: int = Depends(verify_token)):
    db = get_db()
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    try:
        cursor.execute("""
            SELECT 
                g.id, g.name, g.category, g.icon_url,
                ug.skill_level, ug.game_rank, ug.hours_played, ug.is_favorite
            FROM user_games ug
            JOIN games g ON ug.game_id = g.id
            WHERE ug.user_id = %s
            ORDER BY ug.is_favorite DESC, g.name ASC
        """, (user_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        db.close()

@app.post("/user/games")
def add_user_game(game_data: UserGame, user_id: int = Depends(verify_token)):
    db = get_db()
    cursor = db.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                skill_level = VALUES(skill_level),
                game_rank = VALUES(game_rank),
                hours_played = VALUES(hours_played),
                is_favorite = VALUES(is_favorite)
        """, (
            user_id, game_data.game_id, game_data.skill_level,
            game_data.game_rank, game_data.hours_played, game_data.is_favorite
        ))
        db.commit()
        return {"success": True, "message": "Game added/updated"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()

@app.delete("/user/games/{game_id}")
def remove_user_game(game_id: int, user_id: int = Depends(verify_token)):
    db = get_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            "DELETE FROM user_games WHERE user_id = %s AND game_id = %s",
            (user_id, game_id)
        )
        db.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Game not found in profile")
        
        return {"success": True, "message": "Game removed"}
    finally:
        cursor.close()
        db.close()

# ===================== MATCHING ENDPOINTS =====================

@app.post("/matches")
def find_matches(user_id: int = Depends(verify_token)):
    db = get_db()
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    try:
        # Get user's games
        cursor.execute("""
            SELECT game_id, skill_level FROM user_games WHERE user_id = %s
        """, (user_id,))
        user_games = cursor.fetchall()
        
        if not user_games:
            return {"matches": [], "message": "Add games to your profile to find matches"}
        
        game_ids = [g['game_id'] for g in user_games]
        placeholders = ','.join(['%s'] * len(game_ids))
        
        # Find potential matches
        cursor.execute(f"""
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
        """, [user_id] + game_ids + [user_id, user_id, user_id])
        
        potential_matches = cursor.fetchall()
        
        # Calculate match scores and create match records
        matches = []
        for match in potential_matches:
            # Simple scoring based on common games
            score = min(100, match['common_game_count'] * 25)
            
            # Create match record
            cursor.execute("""
                INSERT INTO matches (user1_id, user2_id, match_score, status)
                VALUES (%s, %s, %s, 'pending')
                ON DUPLICATE KEY UPDATE match_score = VALUES(match_score)
            """, (user_id, match['user_id'], score))
            
            match['match_score'] = score
            match['match_id'] = cursor.lastrowid
            matches.append(match)
        
        db.commit()
        return {"matches": matches}
    finally:
        cursor.close()
        db.close()

@app.get("/matches")
def get_matches(user_id: int = Depends(verify_token)):
    db = get_db()
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    try:
        cursor.execute("""
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
        """, (user_id, user_id, user_id))
        
        return {"matches": cursor.fetchall()}
    finally:
        cursor.close()
        db.close()

@app.post("/matches/{match_id}/accept")
def accept_match(match_id: int, user_id: int = Depends(verify_token)):
    db = get_db()
    cursor = db.cursor()
    
    try:
        cursor.execute("""
            UPDATE matches SET status = 'accepted'
            WHERE id = %s AND (user1_id = %s OR user2_id = %s) AND status = 'pending'
        """, (match_id, user_id, user_id))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Match not found or already processed")
        
        db.commit()
        return {"success": True, "message": "Match accepted"}
    finally:
        cursor.close()
        db.close()

@app.post("/matches/{match_id}/reject")
def reject_match(match_id: int, user_id: int = Depends(verify_token)):
    db = get_db()
    cursor = db.cursor()
    
    try:
        cursor.execute("""
            UPDATE matches SET status = 'rejected'
            WHERE id = %s AND (user1_id = %s OR user2_id = %s)
        """, (match_id, user_id, user_id))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Match not found")
        
        db.commit()
        return {"success": True, "message": "Match rejected"}
    finally:
        cursor.close()
        db.close()

# ===================== MESSAGES ENDPOINTS =====================

@app.get("/messages")
def get_conversations(user_id: int = Depends(verify_token)):
    db = get_db()
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    try:
        cursor.execute("""
            SELECT 
                u.id as user_id,
                u.username,
                p.avatar_url,
                MAX(m.created_at) as last_message_time,
                (
                    SELECT content FROM messages 
                    WHERE (sender_id = u.id AND receiver_id = %s) 
                       OR (sender_id = %s AND receiver_id = u.id)
                    ORDER BY created_at DESC LIMIT 1
                ) as last_message,
                COUNT(CASE WHEN m.is_read = 0 AND m.receiver_id = %s THEN 1 END) as unread_count
            FROM users u
            JOIN user_profiles p ON u.id = p.user_id
            JOIN messages m ON (m.sender_id = u.id AND m.receiver_id = %s) 
                            OR (m.sender_id = %s AND m.receiver_id = u.id)
            WHERE u.id != %s
            GROUP BY u.id
            ORDER BY last_message_time DESC
        """, (user_id, user_id, user_id, user_id, user_id, user_id))
        
        return {"conversations": cursor.fetchall()}
    finally:
        cursor.close()
        db.close()

@app.get("/messages/{other_user_id}")
def get_messages(other_user_id: int, user_id: int = Depends(verify_token)):
    db = get_db()
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    try:
        # Check if users are matched
        cursor.execute("""
            SELECT id FROM matches 
            WHERE ((user1_id = %s AND user2_id = %s) OR (user1_id = %s AND user2_id = %s))
                AND status = 'accepted'
        """, (user_id, other_user_id, other_user_id, user_id))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="You can only message matched users")
        
        # Get messages
        cursor.execute("""
            SELECT 
                m.id,
                m.sender_id,
                m.receiver_id,
                m.content,
                m.is_read,
                m.created_at,
                u.username as sender_username,
                p.avatar_url as sender_avatar
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            JOIN user_profiles p ON u.id = p.user_id
            WHERE (m.sender_id = %s AND m.receiver_id = %s) 
               OR (m.sender_id = %s AND m.receiver_id = %s)
            ORDER BY m.created_at ASC
        """, (user_id, other_user_id, other_user_id, user_id))
        
        messages = cursor.fetchall()
        
        # Mark as read
        cursor.execute("""
            UPDATE messages SET is_read = TRUE 
            WHERE sender_id = %s AND receiver_id = %s AND is_read = FALSE
        """, (other_user_id, user_id))
        db.commit()
        
        return {"messages": messages}
    finally:
        cursor.close()
        db.close()

@app.post("/messages")
def send_message(message: Message, user_id: int = Depends(verify_token)):
    db = get_db()
    cursor = db.cursor()

    try:
        # Vérifier si les deux utilisateurs sont match acceptés
        cursor.execute("""
            SELECT id FROM matches 
            WHERE (
                (user1_id = %s AND user2_id = %s) OR 
                (user1_id = %s AND user2_id = %s)
            )
            AND status = 'accepted'
        """, (user_id, message.receiver_id, message.receiver_id, user_id))

        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="You can only message matched users")

        # Insérer le message
        cursor.execute("""
            INSERT INTO messages (sender_id, receiver_id, content, is_read)
            VALUES (%s, %s, %s, FALSE)
        """, (user_id, message.receiver_id, message.content))

        db.commit()

        return {"success": True, "message": "Message sent"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        db.close()


# ===================== ROOT ENDPOINT =====================

@app.get("/")
def root():
    return {
        "status": "API is running",
        "name": "E-Sport Social Platform API",
        "version": "2.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)