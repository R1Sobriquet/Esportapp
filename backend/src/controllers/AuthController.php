<?php
namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class AuthController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!isset($data['email']) || !isset($data['username']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email, username, and password are required']);
            return;
        }
        
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $username = filter_var($data['username'], FILTER_SANITIZE_STRING);
        $password = $data['password'];
        $profile = $data['profile'] ?? [];
        
        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email format']);
            return;
        }
        
        // Validate password strength
        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            return;
        }
        
        try {
            // Check if email or username already exists
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
            $stmt->execute([$email, $username]);
            
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'Email or username already exists']);
                return;
            }
            
            // Begin transaction
            $this->db->beginTransaction();
            
            // Create user
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)");
            $stmt->execute([$email, $username, $passwordHash]);
            $userId = $this->db->lastInsertId();
            
            // Create user profile
            $stmt = $this->db->prepare("
                INSERT INTO user_profiles (
                    user_id, first_name, last_name, date_of_birth, avatar_url, 
                    bio, location, timezone, discord_username, steam_id, 
                    twitch_username, skill_level, looking_for, profile_visibility, 
                    show_stats, allow_friend_requests
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $userId,
                $profile['first_name'] ?? null,
                $profile['last_name'] ?? null,
                $profile['date_of_birth'] ?? null,
                $profile['avatar_url'] ?? null,
                $profile['bio'] ?? null,
                $profile['location'] ?? null,
                $profile['timezone'] ?? null,
                $profile['discord_username'] ?? null,
                $profile['steam_id'] ?? null,
                $profile['twitch_username'] ?? null,
                $profile['skill_level'] ?? 'beginner',
                $profile['looking_for'] ?? 'teammates',
                $profile['profile_visibility'] ?? 'public',
                $profile['show_stats'] ?? true,
                $profile['allow_friend_requests'] ?? true
            ]);
            
            // Add user preferences
            if (isset($profile['preferred_game_modes']) && is_array($profile['preferred_game_modes'])) {
                foreach ($profile['preferred_game_modes'] as $mode) {
                    $stmt = $this->db->prepare("INSERT INTO user_preferences (user_id, preferred_game_mode) VALUES (?, ?)");
                    $stmt->execute([$userId, $mode]);
                }
            }
            
            if (isset($profile['preferred_playtime']) && is_array($profile['preferred_playtime'])) {
                foreach ($profile['preferred_playtime'] as $time) {
                    $stmt = $this->db->prepare("INSERT INTO user_preferences (user_id, preferred_playtime) VALUES (?, ?)");
                    $stmt->execute([$userId, $time]);
                }
            }
            
            $this->db->commit();
            
            // Generate token
            $token = Auth::generateToken($userId);
            
            echo json_encode([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $userId,
                    'email' => $email,
                    'username' => $username
                ]
            ]);
            
        } catch (\Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
        }
    }
    
    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }
        
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $password = $data['password'];
        
        try {
            $stmt = $this->db->prepare("SELECT id, username, password_hash, email_verified FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user || !password_verify($password, $user['password_hash'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
                return;
            }
            
            // Generate token
            $token = Auth::generateToken($user['id']);
            
            echo json_encode([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $email,
                    'email_verified' => (bool)$user['email_verified']
                ]
            ]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
        }
    }
}