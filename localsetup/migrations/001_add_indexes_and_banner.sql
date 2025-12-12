-- ============================================================
-- Migration 001: Add indexes for performance + banner_url column
-- Run this migration to optimize database queries
-- ============================================================

USE esport_social;

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Index on user_games for faster lookups by user
ALTER TABLE user_games ADD INDEX idx_user_games_user_id (user_id);

-- Index on user_games for faster lookups by game
ALTER TABLE user_games ADD INDEX idx_user_games_game_id (game_id);

-- Index on matches for faster lookups by user
ALTER TABLE matches ADD INDEX idx_matches_user1 (user1_id);
ALTER TABLE matches ADD INDEX idx_matches_user2 (user2_id);

-- Index on matches for status filtering
ALTER TABLE matches ADD INDEX idx_matches_status (status);

-- Composite index for match queries (user + status)
ALTER TABLE matches ADD INDEX idx_matches_user1_status (user1_id, status);
ALTER TABLE matches ADD INDEX idx_matches_user2_status (user2_id, status);

-- Index on matches for created_at (for sorting and time-based queries)
ALTER TABLE matches ADD INDEX idx_matches_created_at (created_at);

-- Index on messages for conversation lookups
ALTER TABLE messages ADD INDEX idx_messages_sender (sender_id);
ALTER TABLE messages ADD INDEX idx_messages_receiver (receiver_id);

-- Composite index for conversation queries
ALTER TABLE messages ADD INDEX idx_messages_conversation (sender_id, receiver_id, created_at);

-- Index on messages for unread count queries
ALTER TABLE messages ADD INDEX idx_messages_unread (receiver_id, is_read);

-- Index on messages for created_at (for sorting)
ALTER TABLE messages ADD INDEX idx_messages_created_at (created_at);

-- Index on user_profiles for visibility filtering
ALTER TABLE user_profiles ADD INDEX idx_profiles_visibility (profile_visibility);

-- Index on games for category filtering
ALTER TABLE games ADD INDEX idx_games_category (category);

-- Index on games for name search
ALTER TABLE games ADD INDEX idx_games_name (name);

-- ============================================================
-- NEW COLUMNS
-- ============================================================

-- Add banner_url column to user_profiles if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS banner_url VARCHAR(500) DEFAULT NULL
AFTER avatar_url;

-- Add riot_id column to user_profiles if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS riot_id VARCHAR(100) DEFAULT NULL
AFTER twitch_username;

-- Add last_active column for "recently active" feature
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
AFTER updated_at;

-- ============================================================
-- UPDATE last_active on login (trigger)
-- ============================================================

DELIMITER //

DROP TRIGGER IF EXISTS update_last_active//

-- Note: This trigger would need to be called from the application
-- when a user logs in or performs an action

DELIMITER ;

-- ============================================================
-- VERIFY INDEXES
-- ============================================================

-- Show all indexes on key tables (for verification)
-- SHOW INDEX FROM user_games;
-- SHOW INDEX FROM matches;
-- SHOW INDEX FROM messages;
-- SHOW INDEX FROM user_profiles;
-- SHOW INDEX FROM games;
