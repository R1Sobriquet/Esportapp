"""
Matching service.
Provides advanced matching algorithm with weighted scoring.
"""

from typing import List, Dict, Any
from ..database import DatabaseSession


# Scoring weights for matching algorithm
WEIGHTS = {
    "common_games": 30,       # Base points per common game
    "skill_match": 20,        # Bonus for same skill level
    "region_match": 15,       # Bonus for same region
    "timezone_match": 10,     # Bonus for same timezone
    "looking_for_match": 15,  # Bonus for compatible "looking for"
    "game_skill_match": 10,   # Bonus per game with matching skill
}

# Skill level compatibility matrix (how well levels match)
SKILL_COMPATIBILITY = {
    ("beginner", "beginner"): 1.0,
    ("beginner", "intermediate"): 0.7,
    ("beginner", "advanced"): 0.3,
    ("beginner", "expert"): 0.1,
    ("intermediate", "beginner"): 0.7,
    ("intermediate", "intermediate"): 1.0,
    ("intermediate", "advanced"): 0.8,
    ("intermediate", "expert"): 0.4,
    ("advanced", "beginner"): 0.3,
    ("advanced", "intermediate"): 0.8,
    ("advanced", "advanced"): 1.0,
    ("advanced", "expert"): 0.8,
    ("expert", "beginner"): 0.1,
    ("expert", "intermediate"): 0.4,
    ("expert", "advanced"): 0.8,
    ("expert", "expert"): 1.0,
}

# Looking for compatibility
LOOKING_FOR_COMPATIBILITY = {
    ("casual", "casual"): 1.0,
    ("casual", "competitive"): 0.3,
    ("casual", "both"): 0.7,
    ("competitive", "casual"): 0.3,
    ("competitive", "competitive"): 1.0,
    ("competitive", "both"): 0.8,
    ("both", "casual"): 0.7,
    ("both", "competitive"): 0.8,
    ("both", "both"): 1.0,
}


def calculate_match_score(
    user_profile: Dict[str, Any],
    user_games: List[Dict[str, Any]],
    candidate_profile: Dict[str, Any],
    candidate_games: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Calculate detailed match score between two users.

    Args:
        user_profile: Current user's profile data
        user_games: Current user's games with skill levels
        candidate_profile: Potential match's profile data
        candidate_games: Potential match's games with skill levels

    Returns:
        Dict containing total score and breakdown
    """
    score = 0
    breakdown = {}

    # Create game lookup for user
    user_game_map = {g["game_id"]: g for g in user_games}
    candidate_game_map = {g["game_id"]: g for g in candidate_games}

    # 1. Common games score
    common_games = set(user_game_map.keys()) & set(candidate_game_map.keys())
    common_game_count = len(common_games)
    common_game_score = min(common_game_count * WEIGHTS["common_games"], 60)
    score += common_game_score
    breakdown["common_games"] = {
        "count": common_game_count,
        "score": common_game_score,
    }

    # 2. Game skill level matching
    game_skill_score = 0
    for game_id in common_games:
        user_skill = (user_game_map[game_id].get("skill_level") or "intermediate").lower()
        candidate_skill = (candidate_game_map[game_id].get("skill_level") or "intermediate").lower()
        compatibility = SKILL_COMPATIBILITY.get((user_skill, candidate_skill), 0.5)
        game_skill_score += WEIGHTS["game_skill_match"] * compatibility

    game_skill_score = min(game_skill_score, 30)
    score += game_skill_score
    breakdown["game_skill_match"] = game_skill_score

    # 3. Overall skill level matching
    user_skill = (user_profile.get("skill_level") or "intermediate").lower()
    candidate_skill = (candidate_profile.get("skill_level") or "intermediate").lower()
    skill_compatibility = SKILL_COMPATIBILITY.get((user_skill, candidate_skill), 0.5)
    skill_score = WEIGHTS["skill_match"] * skill_compatibility
    score += skill_score
    breakdown["skill_match"] = skill_score

    # 4. Region matching
    if user_profile.get("region") and candidate_profile.get("region"):
        if user_profile["region"].lower() == candidate_profile["region"].lower():
            score += WEIGHTS["region_match"]
            breakdown["region_match"] = WEIGHTS["region_match"]
        else:
            breakdown["region_match"] = 0
    else:
        breakdown["region_match"] = 0

    # 5. Timezone matching
    if user_profile.get("timezone") and candidate_profile.get("timezone"):
        if user_profile["timezone"] == candidate_profile["timezone"]:
            score += WEIGHTS["timezone_match"]
            breakdown["timezone_match"] = WEIGHTS["timezone_match"]
        else:
            # Partial credit for nearby timezones
            try:
                user_tz = int(user_profile["timezone"].replace("UTC", "").replace("+", "") or 0)
                candidate_tz = int(candidate_profile["timezone"].replace("UTC", "").replace("+", "") or 0)
                tz_diff = abs(user_tz - candidate_tz)
                if tz_diff <= 2:
                    partial_score = WEIGHTS["timezone_match"] * (1 - tz_diff * 0.3)
                    score += partial_score
                    breakdown["timezone_match"] = partial_score
                else:
                    breakdown["timezone_match"] = 0
            except (ValueError, AttributeError):
                breakdown["timezone_match"] = 0
    else:
        breakdown["timezone_match"] = 0

    # 6. Looking for compatibility
    user_looking = (user_profile.get("looking_for") or "both").lower()
    candidate_looking = (candidate_profile.get("looking_for") or "both").lower()
    looking_compatibility = LOOKING_FOR_COMPATIBILITY.get((user_looking, candidate_looking), 0.5)
    looking_score = WEIGHTS["looking_for_match"] * looking_compatibility
    score += looking_score
    breakdown["looking_for_match"] = looking_score

    # Normalize to 0-100
    total_score = min(100, round(score))

    return {
        "total_score": total_score,
        "breakdown": breakdown,
        "common_games_count": common_game_count,
    }


def find_matches_advanced(user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Find potential matches using advanced scoring algorithm.

    Args:
        user_id: Current user's ID
        limit: Maximum number of matches to return

    Returns:
        List of potential matches with scores
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Get user's profile
        db.execute("""
            SELECT skill_level, region, timezone, looking_for
            FROM user_profiles WHERE user_id = %s
        """, (user_id,))
        user_profile = db.fetchone() or {}

        # Get user's games
        db.execute("""
            SELECT game_id, skill_level
            FROM user_games WHERE user_id = %s
        """, (user_id,))
        user_games = db.fetchall()

        if not user_games:
            return []

        game_ids = [g["game_id"] for g in user_games]
        placeholders = ",".join(["%s"] * len(game_ids))

        # Find candidates with common games
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
                GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') as games
            FROM users u
            JOIN user_profiles p ON u.id = p.user_id
            JOIN user_games ug ON u.id = ug.user_id
            JOIN games g ON ug.game_id = g.id
            WHERE u.id != %s
                AND (p.profile_visibility != 'private' OR p.profile_visibility IS NULL)
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
            GROUP BY u.id, u.username, p.avatar_url, p.bio, p.skill_level,
                     p.looking_for, p.timezone, p.region
            LIMIT 50
        """

        params = [user_id] + game_ids + [user_id, user_id, user_id]
        db.execute(query, params)
        candidates = db.fetchall()

        # Calculate scores for each candidate
        scored_matches = []
        for candidate in candidates:
            # Get candidate's games
            db.execute("""
                SELECT game_id, skill_level
                FROM user_games WHERE user_id = %s
            """, (candidate["user_id"],))
            candidate_games = db.fetchall()

            # Calculate score
            score_result = calculate_match_score(
                user_profile,
                user_games,
                candidate,
                candidate_games,
            )

            candidate["match_score"] = score_result["total_score"]
            candidate["score_breakdown"] = score_result["breakdown"]
            candidate["common_games_count"] = score_result["common_games_count"]
            scored_matches.append(candidate)

        # Sort by score descending
        scored_matches.sort(key=lambda x: x["match_score"], reverse=True)

        return scored_matches[:limit]


def create_match_record(user_id: int, candidate_id: int, score: int) -> int:
    """
    Create or update a match record.

    Args:
        user_id: Current user's ID
        candidate_id: Candidate's ID
        score: Match score

    Returns:
        The match ID
    """
    with DatabaseSession() as db:
        db.execute("""
            INSERT INTO matches (user1_id, user2_id, match_score, status)
            VALUES (%s, %s, %s, 'pending')
            ON DUPLICATE KEY UPDATE
                match_score = VALUES(match_score),
                updated_at = NOW()
        """, (user_id, candidate_id, score))

        # Get the match ID
        db.execute("""
            SELECT id FROM matches
            WHERE (user1_id = %s AND user2_id = %s)
               OR (user1_id = %s AND user2_id = %s)
        """, (user_id, candidate_id, candidate_id, user_id))
        result = db.fetchone()

        return result[0] if result else db.lastrowid
