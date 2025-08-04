<?php
namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class GameController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function getAllGames() {
        try {
            $stmt = $this->db->prepare("SELECT id, name, category, icon_url FROM games ORDER BY name ASC");
            $stmt->execute();
            $games = $stmt->fetchAll();
            
            echo json_encode($games);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get games: ' . $e->getMessage()]);
        }
    }
    
    public function getUserGames() {
        $userId = Auth::validateToken();
        
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    g.id, g.name, g.category, g.icon_url,
                    ug.skill_level, ug.rank, ug.hours_played, ug.is_favorite
                FROM user_games ug
                JOIN games g ON ug.game_id = g.id
                WHERE ug.user_id = ?
                ORDER BY ug.is_favorite DESC, g.name ASC
            ");
            $stmt->execute([$userId]);
            $games = $stmt->fetchAll();
            
            echo json_encode($games);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get user games: ' . $e->getMessage()]);
        }
    }
    
    public function addUserGame() {
        $userId = Auth::validateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['game_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Game ID is required']);
            return;
        }
        
        $gameId = (int)$data['game_id'];
        $skillLevel = $data['skill_level'] ?? 'beginner';
        $rank = $data['rank'] ?? null;
        $hoursPlayed = $data['hours_played'] ?? 0;
        $isFavorite = $data['is_favorite'] ?? false;
        
        try {
            // Check if game exists
            $stmt = $this->db->prepare("SELECT id FROM games WHERE id = ?");
            $stmt->execute([$gameId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Game not found']);
                return;
            }
            
            // Check if user already has this game
            $stmt = $this->db->prepare("SELECT id FROM user_games WHERE user_id = ? AND game_id = ?");
            $stmt->execute([$userId, $gameId]);
            if ($stmt->fetch()) {
                // Update existing entry
                $stmt = $this->db->prepare("
                    UPDATE user_games 
                    SET skill_level = ?, rank = ?, hours_played = ?, is_favorite = ?
                    WHERE user_id = ? AND game_id = ?
                ");
                $stmt->execute([$skillLevel, $rank, $hoursPlayed, $isFavorite, $userId, $gameId]);
                echo json_encode(['success' => true, 'message' => 'Game updated']);
            } else {
                // Insert new entry
                $stmt = $this->db->prepare("
                    INSERT INTO user_games (user_id, game_id, skill_level, rank, hours_played, is_favorite)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([$userId, $gameId, $skillLevel, $rank, $hoursPlayed, $isFavorite]);
                echo json_encode(['success' => true, 'message' => 'Game added']);
            }
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add game: ' . $e->getMessage()]);
        }
    }
    
    public function removeUserGame($gameId) {
        $userId = Auth::validateToken();
        
        try {
            $stmt = $this->db->prepare("DELETE FROM user_games WHERE user_id = ? AND game_id = ?");
            $stmt->execute([$userId, $gameId]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Game removed']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Game not found in user profile']);
            }
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to remove game: ' . $e->getMessage()]);
        }
    }
}