-- Ajouter le tracking d'activité
ALTER TABLE users 
ADD COLUMN last_login_at TIMESTAMP NULL AFTER updated_at,
ADD COLUMN last_activity_at TIMESTAMP NULL AFTER last_login_at,
ADD COLUMN account_status ENUM('active', 'inactive', 'suspended', 'deleted') DEFAULT 'active' AFTER email_verified,
ADD INDEX idx_last_activity (last_activity_at),
ADD INDEX idx_account_status (account_status);

-- Table pour l'historique d'activité
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_type ENUM('login', 'logout', 'profile_update', 'message_sent', 'match_action', 'game_added') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_activity (user_id, created_at)
);