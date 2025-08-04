<?php
namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class MessageController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function getConversations() {
        $userId = Auth::validateToken();
        
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    u.id as user_id,
                    u.username,
                    p.avatar_url,
                    p.profile_visibility,
                    MAX(m.created_at) as last_message_time,
                    (
                        SELECT content 
                        FROM messages 
                        WHERE (sender_id = u.id AND receiver_id = ?) 
                           OR (sender_id = ? AND receiver_id = u.id)
                        ORDER BY created_at DESC 
                        LIMIT 1
                    ) as last_message,
                    COUNT(CASE WHEN m.is_read = 0 AND m.receiver_id = ? THEN 1 END) as unread_count
                FROM users u
                JOIN user_profiles p ON u.id = p.user_id
                JOIN messages m ON (m.sender_id = u.id AND m.receiver_id = ?) 
                                OR (m.sender_id = ? AND m.receiver_id = u.id)
                WHERE u.id != ?
                GROUP BY u.id
                ORDER BY last_message_time DESC
            ");
            $stmt->execute([$userId, $userId, $userId, $userId, $userId, $userId]);
            $conversations = $stmt->fetchAll();
            
            echo json_encode(['conversations' => $conversations]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get conversations: ' . $e->getMessage()]);
        }
    }
    
    public function getMessages($otherUserId) {
        $userId = Auth::validateToken();
        
        try {
            // Check if users have an accepted match
            $stmt = $this->db->prepare("
                SELECT id FROM matches 
                WHERE ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?))
                    AND status = 'accepted'
            ");
            $stmt->execute([$userId, $otherUserId, $otherUserId, $userId]);
            
            if (!$stmt->fetch()) {
                http_response_code(403);
                echo json_encode(['error' => 'You can only message matched users']);
                return;
            }
            
            // Get messages
            $stmt = $this->db->prepare("
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
                WHERE (m.sender_id = ? AND m.receiver_id = ?) 
                   OR (m.sender_id = ? AND m.receiver_id = ?)
                ORDER BY m.created_at ASC
            ");
            $stmt->execute([$userId, $otherUserId, $otherUserId, $userId]);
            $messages = $stmt->fetchAll();
            
            // Mark messages as read
            $stmt = $this->db->prepare("
                UPDATE messages 
                SET is_read = TRUE 
                WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE
            ");
            $stmt->execute([$otherUserId, $userId]);
            
            echo json_encode(['messages' => $messages]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get messages: ' . $e->getMessage()]);
        }
    }
    
    public function sendMessage() {
        $userId = Auth::validateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['receiver_id']) || !isset($data['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Receiver ID and content are required']);
            return;
        }
        
        $receiverId = (int)$data['receiver_id'];
        $content = trim($data['content']);
        
        if (empty($content)) {
            http_response_code(400);
            echo json_encode(['error' => 'Message content cannot be empty']);
            return;
        }
        
        if (strlen($content) > 1000) {
            http_response_code(400);
            echo json_encode(['error' => 'Message content too long (max 1000 characters)']);
            return;
        }
        
        try {
            // Check if users have an accepted match
            $stmt = $this->db->prepare("
                SELECT id FROM matches 
                WHERE ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?))
                    AND status = 'accepted'
            ");
            $stmt->execute([$userId, $receiverId, $receiverId, $userId]);
            
            if (!$stmt->fetch()) {
                http_response_code(403);
                echo json_encode(['error' => 'You can only message matched users']);
                return;
            }
            
            // Send message
            $stmt = $this->db->prepare("
                INSERT INTO messages (sender_id, receiver_id, content)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$userId, $receiverId, $content]);
            $messageId = $this->db->lastInsertId();
            
            // Return the created message
            $stmt = $this->db->prepare("
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
                WHERE m.id = ?
            ");
            $stmt->execute([$messageId]);
            $message = $stmt->fetch();
            
            echo json_encode(['success' => true, 'message' => $message]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to send message: ' . $e->getMessage()]);
        }
    }
    
    public function getUnreadCount() {
        $userId = Auth::validateToken();
        
        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as unread_count
                FROM messages
                WHERE receiver_id = ? AND is_read = FALSE
            ");
            $stmt->execute([$userId]);
            $result = $stmt->fetch();
            
            echo json_encode(['unread_count' => (int)$result['unread_count']]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get unread count: ' . $e->getMessage()]);
        }
    }
}