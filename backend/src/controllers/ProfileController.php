<?php
namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class ProfileController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function getProfile() {
        $userId = Auth::validateToken();
        
        // Get query parameter for viewing other profiles
        $profileUserId = $_GET['user_id'] ?? $userId;
        
        try {
            // Get user and profile data
            $stmt = $this->db->prepare("
                SELECT 
                    u.id, u.username, u.email, u.created_at,
                    p.first_name, p.last_name, p.date_of_birth, p.avatar_url,
                    p.bio, p.location, p.timezone, p.discord_username,
                    p.steam_id, p.twitch_username, p.skill_level, p.looking_for,
                    p.profile_visibility, p.show_stats, p.allow_friend_requests
                FROM users u
                LEFT JOIN user_profiles p ON u.id = p.user_id
                WHERE u.id = ?
            ");
            $stmt->execute([$profileUserId]);
            $profile = $stmt->fetch();
            
            if (!$profile) {
                http_response_code(404);
                echo json_encode(['error' => 'Profile not found']);
                return;
            }
            
            // Check privacy settings
            if ($profileUserId != $userId && $profile['profile_visibility'] === 'private') {
                http_response_code(403);
                echo json_encode(['error' => 'This profile is private']);
                return;
            }
            
            // Get user's games
            $stmt = $this->db->prepare("
                SELECT 
                    g.id, g.name, g.category, g.icon_url,
                    ug.skill_level, ug.rank, ug.hours_played, ug.is_favorite
                FROM user_games ug
                JOIN games g ON ug.game_id = g.id
                WHERE ug.user_id = ?
                ORDER BY ug.is_favorite DESC, g.name ASC
            ");
            $stmt->execute([$profileUserId]);
            $games = $stmt->fetchAll();
            
            // Get user preferences
            $stmt = $this->db->prepare("
                SELECT preferred_game_mode, preferred_playtime
                FROM user_preferences
                WHERE user_id = ?
            ");
            $stmt->execute([$profileUserId]);
            $preferences = $stmt->fetchAll();
            
            $gameModes = [];
            $playtimes = [];
            foreach ($preferences as $pref) {
                if ($pref['preferred_game_mode']) {
                    $gameModes[] = $pref['preferred_game_mode'];
                }
                if ($pref['preferred_playtime']) {
                    $playtimes[] = $pref['preferred_playtime'];
                }
            }
            
            // Get user stats if allowed
            $stats = null;
            if ($profile['show_stats']) {
                $stmt = $this->db->prepare("
                    SELECT 
                        COUNT(DISTINCT CASE WHEN status = 'accepted' THEN 
                            CASE WHEN user1_id = ? THEN user2_id ELSE user1_id END 
                        END) as total_matches,
                        AVG(rating) as average_rating,
                        COUNT(DISTINCT rated_id) as total_ratings
                    FROM matches m
                    LEFT JOIN user_ratings r ON r.rated_id = ?
                    WHERE (m.user1_id = ? OR m.user2_id = ?) AND m.status = 'accepted'
                ");
                $stmt->execute([$profileUserId, $profileUserId, $profileUserId, $profileUserId]);
                $stats = $stmt->fetch();
            }
            
            // Remove sensitive data for other users
            if ($profileUserId != $userId) {
                unset($profile['email']);
            }
            
            echo json_encode([
                'profile' => $profile,
                'games' => $games,
                'preferences' => [
                    'game_modes' => array_unique($gameModes),
                    'playtimes' => array_unique($playtimes)
                ],
                'stats' => $stats
            ]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get profile: ' . $e->getMessage()]);
        }
    }
    
    public function updateProfile() {
        $userId = Auth::validateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $this->db->beginTransaction();
            
            // Update user profile
            $allowedFields = [
                'first_name', 'last_name', 'date_of_birth', 'avatar_url',
                'bio', 'location', 'timezone', 'discord_username',
                'steam_id', 'twitch_username', 'skill_level', 'looking_for',
                'profile_visibility', 'show_stats', 'allow_friend_requests'
            ];
            
            $updates = [];
            $params = [];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updates[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }
            
            if (!empty($updates)) {
                $params[] = $userId;
                $stmt = $this->db->prepare("
                    UPDATE user_profiles 
                    SET " . implode(', ', $updates) . "
                    WHERE user_id = ?
                ");
                $stmt->execute($params);
            }
            
            // Update preferences
            if (isset($data['preferences'])) {
                // Delete existing preferences
                $stmt = $this->db->prepare("DELETE FROM user_preferences WHERE user_id = ?");
                $stmt->execute([$userId]);
                
                // Add new preferences
                if (isset($data['preferences']['game_modes'])) {
                    foreach ($data['preferences']['game_modes'] as $mode) {
                        $stmt = $this->db->prepare("INSERT INTO user_preferences (user_id, preferred_game_mode) VALUES (?, ?)");
                        $stmt->execute([$userId, $mode]);
                    }
                }
                
                if (isset($data['preferences']['playtimes'])) {
                    foreach ($data['preferences']['playtimes'] as $time) {
                        $stmt = $this->db->prepare("INSERT INTO user_preferences (user_id, preferred_playtime) VALUES (?, ?)");
                        $stmt->execute([$userId, $time]);
                    }
                }
            }
            
            $this->db->commit();
            
            echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
            
        } catch (\Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update profile: ' . $e->getMessage()]);
        }
    }
}