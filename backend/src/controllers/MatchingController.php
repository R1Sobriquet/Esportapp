<?php
namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class MatchingController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function findMatches() {
        $userId = Auth::validateToken();
        
        try {
            // Get user's games and preferences
            $stmt = $this->db->prepare("
                SELECT 
                    g.id as game_id, 
                    ug.skill_level,
                    p.looking_for,
                    p.timezone
                FROM user_games ug
                JOIN games g ON ug.game_id = g.id
                JOIN user_profiles p ON p.user_id = ug.user_id
                WHERE ug.user_id = ?
            ");
            $stmt->execute([$userId]);
            $userGames = $stmt->fetchAll();
            
            if (empty($userGames)) {
                echo json_encode(['matches' => [], 'message' => 'Add games to your profile to find matches']);
                return;
            }
            
            $userProfile = $userGames[0]; // Get profile info from first row
            $gameIds = array_column($userGames, 'game_id');
            $gameSkills = array_column($userGames, 'skill_level', 'game_id');
            
            // Find potential matches
            $placeholders = str_repeat('?,', count($gameIds) - 1) . '?';
            $params = array_merge([$userId, $userId], $gameIds);
            
            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    u.id as user_id,
                    u.username,
                    p.avatar_url,
                    p.bio,
                    p.skill_level as overall_skill,
                    p.looking_for,
                    p.timezone,
                    p.location,
                    GROUP_CONCAT(DISTINCT g.name) as common_games,
                    COUNT(DISTINCT ug.game_id) as common_game_count
                FROM users u
                JOIN user_profiles p ON u.id = p.user_id
                JOIN user_games ug ON u.id = ug.user_id
                JOIN games g ON ug.game_id = g.id
                WHERE u.id != ?
                    AND p.profile_visibility != 'private'
                    AND u.id NOT IN (
                        SELECT CASE 
                            WHEN user1_id = ? THEN user2_id 
                            ELSE user1_id 
                        END
                        FROM matches 
                        WHERE (user1_id = ? OR user2_id = ?) 
                        AND status IN ('accepted', 'pending')
                    )
                    AND ug.game_id IN ($placeholders)
                GROUP BY u.id
                ORDER BY common_game_count DESC, u.created_at DESC
                LIMIT 20
            ");
            
            array_unshift($params, $userId, $userId); // Add userId for the NOT IN subquery
            $stmt->execute($params);
            $potentialMatches = $stmt->fetchAll();
            
            // Calculate match scores
            $matches = [];
            foreach ($potentialMatches as $match) {
                $score = $this->calculateMatchScore($userId, $match, $userProfile, $gameSkills);
                $matches[] = array_merge($match, ['match_score' => $score]);
            }
            
            // Sort by match score
            usort($matches, function($a, $b) {
                return $b['match_score'] <=> $a['match_score'];
            });
            
            // Create match records for top matches
            $topMatches = array_slice($matches, 0, 5);
            foreach ($topMatches as &$match) {
                $stmt = $this->db->prepare("
                    INSERT INTO matches (user1_id, user2_id, match_score, status)
                    VALUES (?, ?, ?, 'pending')
                    ON DUPLICATE KEY UPDATE match_score = VALUES(match_score)
                ");
                $stmt->execute([$userId, $match['user_id'], $match['match_score']]);
                $match['match_id'] = $this->db->lastInsertId();
            }
            
            echo json_encode(['matches' => $topMatches]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to find matches: ' . $e->getMessage()]);
        }
    }
    
    private function calculateMatchScore($userId, $match, $userProfile, $userGameSkills) {
        $score = 0;
        
        // Base score for common games
        $score += $match['common_game_count'] * 20;
        
        // Bonus for similar looking_for preferences
        if ($userProfile['looking_for'] === $match['looking_for']) {
            $score += 15;
        }
        
        // Bonus for same timezone
        if ($userProfile['timezone'] === $match['timezone']) {
            $score += 10;
        }
        
        // Get detailed game compatibility
        $stmt = $this->db->prepare("
            SELECT game_id, skill_level 
            FROM user_games 
            WHERE user_id = ?
        ");
        $stmt->execute([$match['user_id']]);
        $matchGames = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        // Bonus for similar skill levels in common games
        foreach ($userGameSkills as $gameId => $userSkill) {
            if (isset($matchGames[$gameId])) {
                $skillDiff = abs($this->getSkillLevelValue($userSkill) - $this->getSkillLevelValue($matchGames[$gameId]));
                if ($skillDiff <= 1) {
                    $score += 10; // Similar skill level
                } else {
                    $score -= $skillDiff * 2; // Penalty for large skill gap
                }
            }
        }
        
        // Normalize score to 0-100
        return min(100, max(0, $score));
    }
    
    private function getSkillLevelValue($level) {
        $levels = [
            'beginner' => 1,
            'intermediate' => 2,
            'advanced' => 3,
            'expert' => 4
        ];
        return $levels[$level] ?? 1;
    }
    
    public function getMatches() {
        $userId = Auth::validateToken();
        
        try {
            $stmt = $this->db->prepare("
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
                        WHEN m.user1_id = ? THEN m.user2_id 
                        ELSE m.user1_id 
                    END = u.id
                )
                JOIN user_profiles p ON u.id = p.user_id
                LEFT JOIN user_games ug ON u.id = ug.user_id
                LEFT JOIN games g ON ug.game_id = g.id
                WHERE (m.user1_id = ? OR m.user2_id = ?)
                    AND m.status IN ('pending', 'accepted')
                GROUP BY m.id
                ORDER BY m.status ASC, m.match_score DESC, m.created_at DESC
            ");
            $stmt->execute([$userId, $userId, $userId]);
            $matches = $stmt->fetchAll();
            
            echo json_encode(['matches' => $matches]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get matches: ' . $e->getMessage()]);
        }
    }
    
    public function acceptMatch($matchId) {
        $userId = Auth::validateToken();
        
        try {
            // Verify user is part of this match
            $stmt = $this->db->prepare("
                SELECT * FROM matches 
                WHERE id = ? AND (user1_id = ? OR user2_id = ?)
            ");
            $stmt->execute([$matchId, $userId, $userId]);
            $match = $stmt->fetch();
            
            if (!$match) {
                http_response_code(404);
                echo json_encode(['error' => 'Match not found']);
                return;
            }
            
            if ($match['status'] !== 'pending') {
                http_response_code(400);
                echo json_encode(['error' => 'Match already processed']);
                return;
            }
            
            // Update match status
            $stmt = $this->db->prepare("UPDATE matches SET status = 'accepted' WHERE id = ?");
            $stmt->execute([$matchId]);
            
            echo json_encode(['success' => true, 'message' => 'Match accepted']);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to accept match: ' . $e->getMessage()]);
        }
    }
    
    public function rejectMatch($matchId) {
        $userId = Auth::validateToken();
        
        try {
            $stmt = $this->db->prepare("
                UPDATE matches 
                SET status = 'rejected' 
                WHERE id = ? AND (user1_id = ? OR user2_id = ?)
            ");
            $stmt->execute([$matchId, $userId, $userId]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Match rejected']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Match not found']);
            }
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to reject match: ' . $e->getMessage()]);
        }
    }
}