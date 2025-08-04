<?php
namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class ForumController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function getCategories() {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    fc.id,
                    fc.name,
                    fc.description,
                    fc.game_id,
                    g.name as game_name,
                    COUNT(DISTINCT fp.id) as post_count,
                    MAX(fp.created_at) as last_post_date
                FROM forum_categories fc
                LEFT JOIN games g ON fc.game_id = g.id
                LEFT JOIN forum_posts fp ON fc.id = fp.category_id
                GROUP BY fc.id
                ORDER BY fc.game_id IS NULL, fc.name
            ");
            $stmt->execute();
            $categories = $stmt->fetchAll();
            
            echo json_encode(['categories' => $categories]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get categories: ' . $e->getMessage()]);
        }
    }
    
    public function getPosts($categoryId) {
        $userId = Auth::optionalAuth();
        $page = (int)($_GET['page'] ?? 1);
        $limit = 20;
        $offset = ($page - 1) * $limit;
        
        try {
            // Get category info
            $stmt = $this->db->prepare("SELECT * FROM forum_categories WHERE id = ?");
            $stmt->execute([$categoryId]);
            $category = $stmt->fetch();
            
            if (!$category) {
                http_response_code(404);
                echo json_encode(['error' => 'Category not found']);
                return;
            }
            
            // Get posts
            $stmt = $this->db->prepare("
                SELECT 
                    fp.id,
                    fp.title,
                    fp.content,
                    fp.views,
                    fp.is_pinned,
                    fp.created_at,
                    fp.updated_at,
                    u.id as author_id,
                    u.username as author_username,
                    p.avatar_url as author_avatar,
                    COUNT(DISTINCT fr.id) as reply_count,
                    MAX(fr.created_at) as last_reply_date
                FROM forum_posts fp
                JOIN users u ON fp.user_id = u.id
                JOIN user_profiles p ON u.id = p.user_id
                LEFT JOIN forum_replies fr ON fp.id = fr.post_id
                WHERE fp.category_id = ?
                GROUP BY fp.id
                ORDER BY fp.is_pinned DESC, COALESCE(MAX(fr.created_at), fp.created_at) DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$categoryId, $limit, $offset]);
            $posts = $stmt->fetchAll();
            
            // Get total count
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM forum_posts WHERE category_id = ?");
            $stmt->execute([$categoryId]);
            $total = $stmt->fetch()['total'];
            
            echo json_encode([
                'category' => $category,
                'posts' => $posts,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get posts: ' . $e->getMessage()]);
        }
    }
    
    public function createPost($categoryId) {
        $userId = Auth::validateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['title']) || !isset($data['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Title and content are required']);
            return;
        }
        
        $title = trim($data['title']);
        $content = trim($data['content']);
        
        if (strlen($title) < 5 || strlen($title) > 255) {
            http_response_code(400);
            echo json_encode(['error' => 'Title must be between 5 and 255 characters']);
            return;
        }
        
        if (strlen($content) < 10) {
            http_response_code(400);
            echo json_encode(['error' => 'Content must be at least 10 characters']);
            return;
        }
        
        try {
            // Check if category exists
            $stmt = $this->db->prepare("SELECT id FROM forum_categories WHERE id = ?");
            $stmt->execute([$categoryId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Category not found']);
                return;
            }
            
            // Create post
            $stmt = $this->db->prepare("
                INSERT INTO forum_posts (category_id, user_id, title, content)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$categoryId, $userId, $title, $content]);
            $postId = $this->db->lastInsertId();
            
            // Return created post
            $stmt = $this->db->prepare("
                SELECT 
                    fp.*,
                    u.username as author_username,
                    p.avatar_url as author_avatar
                FROM forum_posts fp
                JOIN users u ON fp.user_id = u.id
                JOIN user_profiles p ON u.id = p.user_id
                WHERE fp.id = ?
            ");
            $stmt->execute([$postId]);
            $post = $stmt->fetch();
            
            echo json_encode(['success' => true, 'post' => $post]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create post: ' . $e->getMessage()]);
        }
    }
    
    public function getReplies($postId) {
        $page = (int)($_GET['page'] ?? 1);
        $limit = 20;
        $offset = ($page - 1) * $limit;
        
        try {
            // Get post info and increment views
            $stmt = $this->db->prepare("
                SELECT 
                    fp.*,
                    u.username as author_username,
                    p.avatar_url as author_avatar
                FROM forum_posts fp
                JOIN users u ON fp.user_id = u.id
                JOIN user_profiles p ON u.id = p.user_id
                WHERE fp.id = ?
            ");
            $stmt->execute([$postId]);
            $post = $stmt->fetch();
            
            if (!$post) {
                http_response_code(404);
                echo json_encode(['error' => 'Post not found']);
                return;
            }
            
            // Increment view count
            $stmt = $this->db->prepare("UPDATE forum_posts SET views = views + 1 WHERE id = ?");
            $stmt->execute([$postId]);
            
            // Get replies
            $stmt = $this->db->prepare("
                SELECT 
                    fr.id,
                    fr.content,
                    fr.created_at,
                    fr.updated_at,
                    u.id as author_id,
                    u.username as author_username,
                    p.avatar_url as author_avatar
                FROM forum_replies fr
                JOIN users u ON fr.user_id = u.id
                JOIN user_profiles p ON u.id = p.user_id
                WHERE fr.post_id = ?
                ORDER BY fr.created_at ASC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$postId, $limit, $offset]);
            $replies = $stmt->fetchAll();
            
            // Get total count
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM forum_replies WHERE post_id = ?");
            $stmt->execute([$postId]);
            $total = $stmt->fetch()['total'];
            
            echo json_encode([
                'post' => $post,
                'replies' => $replies,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get replies: ' . $e->getMessage()]);
        }
    }
    
    public function createReply($postId) {
        $userId = Auth::validateToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Content is required']);
            return;
        }
        
        $content = trim($data['content']);
        
        if (strlen($content) < 5) {
            http_response_code(400);
            echo json_encode(['error' => 'Content must be at least 5 characters']);
            return;
        }
        
        try {
            // Check if post exists
            $stmt = $this->db->prepare("SELECT id FROM forum_posts WHERE id = ?");
            $stmt->execute([$postId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Post not found']);
                return;
            }
            
            // Create reply
            $stmt = $this->db->prepare("
                INSERT INTO forum_replies (post_id, user_id, content)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$postId, $userId, $content]);
            $replyId = $this->db->lastInsertId();
            
            // Return created reply
            $stmt = $this->db->prepare("
                SELECT 
                    fr.*,
                    u.username as author_username,
                    p.avatar_url as author_avatar
                FROM forum_replies fr
                JOIN users u ON fr.user_id = u.id
                JOIN user_profiles p ON u.id = p.user_id
                WHERE fr.id = ?
            ");
            $stmt->execute([$replyId]);
            $reply = $stmt->fetch();
            
            echo json_encode(['success' => true, 'reply' => $reply]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create reply: ' . $e->getMessage()]);
        }
    }
}