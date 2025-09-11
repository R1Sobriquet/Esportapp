-- ============================================================
-- Sample Users for Testing Matching Logic
-- ============================================================
-- NOTE: All passwords are hashed version of "password123"
-- You can generate a new hash using Python:
-- import bcrypt
-- print(bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode())

USE esport_social;

-- First, ensure we have games in the database
INSERT IGNORE INTO games (id, name, category, icon_url) VALUES
(1, 'Valorant', 'FPS', 'https://example.com/valorant.png'),
(2, 'League of Legends', 'MOBA', 'https://example.com/lol.png'),
(3, 'Counter-Strike 2', 'FPS', 'https://example.com/cs2.png'),
(4, 'Overwatch 2', 'FPS', 'https://example.com/ow2.png'),
(5, 'Rocket League', 'Sports', 'https://example.com/rl.png'),
(6, 'Dota 2', 'MOBA', 'https://example.com/dota2.png'),
(7, 'Apex Legends', 'Battle Royale', 'https://example.com/apex.png'),
(8, 'Fortnite', 'Battle Royale', 'https://example.com/fortnite.png'),
(9, 'Rainbow Six Siege', 'FPS', 'https://example.com/r6s.png'),
(10, 'Call of Duty: Warzone', 'Battle Royale', 'https://example.com/cod.png');

-- ============================================================
-- IMPORTANT: Generate this hash using the test script below
-- ============================================================
SET @password_hash = '$2b$12$nEM0cYZaxAfA8bfzUUERZuFd9Uz3.ebhuy9YybDq9Qj24MtiaEp46';

-- ============================================================
-- Insert Test Users
-- ============================================================

-- User 1: Alice - FPS Expert from Europe
INSERT INTO users (email, username, password_hash, email_verified) VALUES
('alice@test.com', 'AliceShooter', @password_hash, TRUE);
SET @alice_id = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone) VALUES
(@alice_id, 'Europe', 'Competitive FPS player, main Valorant and CS2. Looking for serious teammates for ranked grind!', 
'expert', 'competitive_team', 'Alice#1234', 'Europe/Paris');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@alice_id, 1, 'expert', 'Immortal 3', 1500, TRUE),  -- Valorant
(@alice_id, 3, 'advanced', 'Global Elite', 2000, FALSE), -- CS2
(@alice_id, 4, 'intermediate', 'Diamond', 300, FALSE); -- Overwatch 2

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@alice_id, 'competitive', 'evening'),
(@alice_id, 'competitive', 'night');

-- User 2: Bob - Casual Gamer from NA
INSERT INTO users (email, username, password_hash, email_verified) VALUES
('bob@test.com', 'BobTheGamer', @password_hash, TRUE);
SET @bob_id = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone) VALUES
(@bob_id, 'North America', 'Just here to have fun and make friends. Love team-based games!', 
'intermediate', 'casual_friends', 'Bob#5678', 'America/New_York');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@bob_id, 5, 'intermediate', 'Platinum 2', 400, TRUE),  -- Rocket League
(@bob_id, 8, 'beginner', NULL, 100, FALSE), -- Fortnite
(@bob_id, 4, 'intermediate', 'Gold', 200, FALSE); -- Overwatch 2

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@bob_id, 'casual', 'afternoon'),
(@bob_id, 'casual', 'evening');

-- User 3: Charlie - MOBA Specialist from Asia
INSERT INTO users (email, username, password_hash, email_verified) VALUES
('charlie@test.com', 'CharlieCarry', @password_hash, TRUE);
SET @charlie_id = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone) VALUES
(@charlie_id, 'Asia', 'MOBA main, ex-semi pro. Looking for competitive team or coaching opportunities.', 
'expert', 'competitive_team', 'Charlie#9012', 'Asia/Tokyo');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@charlie_id, 2, 'expert', 'Challenger', 3000, TRUE),  -- League of Legends
(@charlie_id, 6, 'expert', 'Divine 5', 2500, FALSE), -- Dota 2
(@charlie_id, 1, 'intermediate', 'Platinum', 200, FALSE); -- Valorant

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@charlie_id, 'competitive', 'evening'),
(@charlie_id, 'competitive', 'night');

-- User 4: Diana - FPS Player from Europe (Good match for Alice)
INSERT INTO users (email, username, password_hash, email_verified) VALUES
('diana@test.com', 'DianaAim', @password_hash, TRUE);
SET @diana_id = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone) VALUES
(@diana_id, 'Europe', 'Valorant main, looking for duo or team. Can play entry or support.', 
'advanced', 'teammates', 'Diana#3456', 'Europe/Berlin');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@diana_id, 1, 'advanced', 'Ascendant 2', 800, TRUE),  -- Valorant
(@diana_id, 3, 'intermediate', 'DMG', 400, FALSE), -- CS2
(@diana_id, 7, 'intermediate', 'Platinum', 300, FALSE); -- Apex Legends

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@diana_id, 'competitive', 'evening'),
(@diana_id, 'competitive', 'night');

-- User 5: Eric - Battle Royale Fan from NA
INSERT INTO users (email, username, password_hash, email_verified) VALUES
('eric@test.com', 'EricEliminator', @password_hash, TRUE);
SET @eric_id = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone) VALUES
(@eric_id, 'North America', 'BR games enthusiast. Apex, Fortnite, Warzone - I play them all!', 
'advanced', 'teammates', 'Eric#7890', 'America/Los_Angeles');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@eric_id, 7, 'advanced', 'Master', 1200, TRUE),  -- Apex Legends
(@eric_id, 8, 'intermediate', NULL, 600, FALSE), -- Fortnite
(@eric_id, 10, 'intermediate', NULL, 400, FALSE); -- Warzone

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@eric_id, 'competitive', 'night'),
(@eric_id, 'casual', 'evening');

-- User 6: Fiona - Variety Gamer from Europe
INSERT INTO users (email, username, password_hash, email_verified) VALUES
('fiona@test.com', 'FionaFlex', @password_hash, TRUE);
SET @fiona_id = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone) VALUES
(@fiona_id, 'Europe', 'I play everything! Looking for chill people to game with.', 
'intermediate', 'casual_friends', 'Fiona#2468', 'Europe/London');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@fiona_id, 1, 'intermediate', 'Gold 3', 300, FALSE),  -- Valorant
(@fiona_id, 5, 'beginner', 'Silver', 100, FALSE), -- Rocket League
(@fiona_id, 4, 'intermediate', 'Platinum', 250, TRUE), -- Overwatch 2
(@fiona_id, 8, 'beginner', NULL, 150, FALSE); -- Fortnite

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@fiona_id, 'casual', 'afternoon'),
(@fiona_id, 'any', 'evening');

-- User 7: George - Competitive All-Rounder from Asia
INSERT INTO users (email, username, password_hash, email_verified) VALUES
('george@test.com', 'GeorgeGG', @password_hash, TRUE);
SET @george_id = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone) VALUES
(@george_id, 'Asia', 'Competitive player across multiple genres. Always improving!', 
'advanced', 'competitive_team', 'George#1357', 'Asia/Seoul');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@george_id, 1, 'advanced', 'Diamond 3', 600, TRUE),  -- Valorant
(@george_id, 2, 'intermediate', 'Gold', 400, FALSE), -- League of Legends
(@george_id, 5, 'advanced', 'Champion', 800, FALSE); -- Rocket League

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@george_id, 'competitive', 'evening'),
(@george_id, 'competitive', 'night');

-- User 8: Hannah - Support Player from NA
INSERT INTO users (email, username, password_hash, email_verified) VALUES
('hannah@test.com', 'HannahHealer', @password_hash, TRUE);
SET @hannah_id = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone) VALUES
(@hannah_id, 'North America', 'Support main in every game. Looking for a consistent team!', 
'intermediate', 'teammates', 'Hannah#8642', 'America/Chicago');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@hannah_id, 4, 'intermediate', 'Platinum', 500, TRUE), -- Overwatch 2
(@hannah_id, 2, 'beginner', 'Silver', 200, FALSE), -- League of Legends
(@hannah_id, 1, 'beginner', 'Bronze', 100, FALSE); -- Valorant

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@hannah_id, 'casual', 'evening'),
(@hannah_id, 'competitive', 'afternoon');

-- User 9: Ian - FPS Beginner looking for Mentor
INSERT INTO users (email, username, password_hash, email_verified) VALUES
('ian@test.com', 'IanImproving', @password_hash, TRUE);
SET @ian_id = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone) VALUES
(@ian_id, 'Europe', 'New to FPS games, eager to learn and improve. Need a mentor!', 
'beginner', 'mentor', 'Ian#9753', 'Europe/Madrid');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@ian_id, 1, 'beginner', 'Iron 3', 50, TRUE),  -- Valorant
(@ian_id, 4, 'beginner', 'Bronze', 30, FALSE), -- Overwatch 2
(@ian_id, 7, 'beginner', 'Bronze', 40, FALSE); -- Apex Legends

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@ian_id, 'casual', 'afternoon'),
(@ian_id, 'any', 'evening');

-- User 10: Julia - Solo Queue Warrior from Asia
INSERT INTO users (email, username, password_hash, email_verified) VALUES
('julia@test.com', 'JuliaSolo', @password_hash, TRUE);
SET @julia_id = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone) VALUES
(@julia_id, 'Asia', 'Tired of solo queue. Looking for consistent duo partners.', 
'advanced', 'teammates', 'Julia#3698', 'Asia/Singapore');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@julia_id, 2, 'advanced', 'Diamond', 1500, TRUE),  -- League of Legends
(@julia_id, 1, 'intermediate', 'Platinum', 400, FALSE), -- Valorant
(@julia_id, 6, 'intermediate', 'Ancient', 600, FALSE); -- Dota 2

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@julia_id, 'competitive', 'night'),
(@julia_id, 'competitive', 'evening');

-- ============================================================
-- Summary Report
-- ============================================================
SELECT 
    'Users Created' as Metric, 
    COUNT(*) as Count 
FROM users 
WHERE email LIKE '%@test.com'

UNION ALL

SELECT 
    'User Games Added' as Metric, 
    COUNT(*) as Count 
FROM user_games ug
JOIN users u ON ug.user_id = u.id
WHERE u.email LIKE '%@test.com'

UNION ALL

SELECT 
    'Regions Covered' as Metric, 
    COUNT(DISTINCT region) as Count 
FROM user_profiles up
JOIN users u ON up.user_id = u.id
WHERE u.email LIKE '%@test.com';

-- ============================================================
-- Show potential matches (users with common games)
-- ============================================================
SELECT 
    u1.username as User1,
    u2.username as User2,
    GROUP_CONCAT(DISTINCT g.name) as CommonGames,
    COUNT(DISTINCT g.id) as CommonGameCount
FROM user_games ug1
JOIN user_games ug2 ON ug1.game_id = ug2.game_id AND ug1.user_id < ug2.user_id
JOIN users u1 ON ug1.user_id = u1.id
JOIN users u2 ON ug2.user_id = u2.id
JOIN games g ON ug1.game_id = g.id
WHERE u1.email LIKE '%@test.com' AND u2.email LIKE '%@test.com'
GROUP BY u1.id, u2.id
HAVING CommonGameCount > 0
ORDER BY CommonGameCount DESC
LIMIT 10;