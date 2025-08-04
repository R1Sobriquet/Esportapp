<?php
// Enable CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/middleware/auth.php';

// Get request data
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = str_replace('/api', '', $uri);

// Route handling
try {
    switch ($uri) {
        // Auth routes
        case '/register':
            if ($method === 'POST') {
                require_once __DIR__ . '/src/controllers/AuthController.php';
                $controller = new App\Controllers\AuthController();
                $controller->register();
            }
            break;
            
        case '/login':
            if ($method === 'POST') {
                require_once __DIR__ . '/src/controllers/AuthController.php';
                $controller = new App\Controllers\AuthController();
                $controller->login();
            }
            break;
            
        // Profile routes
        case '/profile':
            require_once __DIR__ . '/src/controllers/ProfileController.php';
            $controller = new App\Controllers\ProfileController();
            
            if ($method === 'GET') {
                $controller->getProfile();
            } elseif ($method === 'PUT') {
                $controller->updateProfile();
            }
            break;
            
        // Games routes
        case '/games':
            if ($method === 'GET') {
                require_once __DIR__ . '/src/controllers/GameController.php';
                $controller = new App\Controllers\GameController();
                $controller->getAllGames();
            }
            break;
            
        case '/user/games':
            require_once __DIR__ . '/src/controllers/GameController.php';
            $controller = new App\Controllers\GameController();
            
            if ($method === 'GET') {
                $controller->getUserGames();
            } elseif ($method === 'POST') {
                $controller->addUserGame();
            }
            break;
            
        // Matching routes
        case '/matches':
            require_once __DIR__ . '/src/controllers/MatchingController.php';
            $controller = new App\Controllers\MatchingController();
            
            if ($method === 'GET') {
                $controller->getMatches();
            } elseif ($method === 'POST') {
                $controller->findMatches();
            }
            break;
            
        case (preg_match('/^\/matches\/(\d+)\/accept$/', $uri, $matches) ? true : false):
            if ($method === 'POST') {
                require_once __DIR__ . '/src/controllers/MatchingController.php';
                $controller = new App\Controllers\MatchingController();
                $controller->acceptMatch($matches[1]);
            }
            break;
            
        // Messages routes
        case '/messages':
            require_once __DIR__ . '/src/controllers/MessageController.php';
            $controller = new App\Controllers\MessageController();
            
            if ($method === 'GET') {
                $controller->getConversations();
            } elseif ($method === 'POST') {
                $controller->sendMessage();
            }
            break;
            
        case (preg_match('/^\/messages\/(\d+)$/', $uri, $matches) ? true : false):
            if ($method === 'GET') {
                require_once __DIR__ . '/src/controllers/MessageController.php';
                $controller = new App\Controllers\MessageController();
                $controller->getMessages($matches[1]);
            }
            break;
            
        // Forum routes
        case '/forum/categories':
            if ($method === 'GET') {
                require_once __DIR__ . '/src/controllers/ForumController.php';
                $controller = new App\Controllers\ForumController();
                $controller->getCategories();
            }
            break;
            
        case (preg_match('/^\/forum\/categories\/(\d+)\/posts$/', $uri, $matches) ? true : false):
            require_once __DIR__ . '/src/controllers/ForumController.php';
            $controller = new App\Controllers\ForumController();
            
            if ($method === 'GET') {
                $controller->getPosts($matches[1]);
            } elseif ($method === 'POST') {
                $controller->createPost($matches[1]);
            }
            break;
            
        case (preg_match('/^\/forum\/posts\/(\d+)\/replies$/', $uri, $matches) ? true : false):
            require_once __DIR__ . '/src/controllers/ForumController.php';
            $controller = new App\Controllers\ForumController();
            
            if ($method === 'GET') {
                $controller->getReplies($matches[1]);
            } elseif ($method === 'POST') {
                $controller->createReply($matches[1]);
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Route not found']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}