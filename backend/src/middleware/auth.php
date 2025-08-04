<?php
namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth {
    private static $secretKey;
    
    public static function init() {
        self::$secretKey = $_ENV['JWT_SECRET'] ?? 'your_jwt_secret_key_here';
    }
    
    public static function generateToken($userId) {
        self::init();
        
        $payload = [
            'user_id' => $userId,
            'iat' => time(),
            'exp' => time() + (7 * 24 * 60 * 60) // 7 days
        ];
        
        return JWT::encode($payload, self::$secretKey, 'HS256');
    }
    
    public static function validateToken() {
        self::init();
        
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (empty($authHeader)) {
            http_response_code(401);
            echo json_encode(['error' => 'No authorization header']);
            exit;
        }
        
        $token = str_replace('Bearer ', '', $authHeader);
        
        try {
            $decoded = JWT::decode($token, new Key(self::$secretKey, 'HS256'));
            return $decoded->user_id;
        } catch (\Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            exit;
        }
    }
    
    public static function optionalAuth() {
        self::init();
        
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (empty($authHeader)) {
            return null;
        }
        
        $token = str_replace('Bearer ', '', $authHeader);
        
        try {
            $decoded = JWT::decode($token, new Key(self::$secretKey, 'HS256'));
            return $decoded->user_id;
        } catch (\Exception $e) {
            return null;
        }
    }
}