-- ============================================================
-- GameConnect — Utilisateurs de test
-- Mot de passe pour tous les comptes : "password123"
-- Hash bcrypt généré avec : bcrypt.hashpw(b"password123", bcrypt.gensalt())
-- Usage : mysql -u root -p esport_social < localsetup/seeds/02_utilisateurs_test.sql
-- ============================================================

USE esport_social;

-- Hash commun pour tous les utilisateurs de test
SET @pwd = '$2b$12$STne7AQ3I5IjcfVdkS796O45v6V533ianf0t7LTZR1Md8mTYNvGhi';

-- ============================================================
-- Utilisateur 1 : Alice — FPS Expert, Europe
-- ============================================================
INSERT INTO users (email, username, password_hash, email_verified, account_status) VALUES
('alice@test.com', 'AliceShooter', @pwd, TRUE, 'active');
SET @alice = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone, riot_id) VALUES
(@alice, 'Europe',
 'Joueuse compétitive FPS, main Valorant et CS2. Cherche coéquipiers sérieux pour le ranked.',
 'expert', 'competitive_team', 'Alice#1234', 'Europe/Paris', 'AliceShooter#EUW');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@alice, 1, 'expert',        'Immortal 3',    1500, TRUE),   -- Valorant
(@alice, 3, 'advanced',      'Global Elite',  2000, FALSE),  -- CS2
(@alice, 4, 'intermediate',  'Diamond',        300, FALSE);  -- Overwatch 2

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@alice, 'competitive', 'evening'),
(@alice, 'competitive', 'night');

-- ============================================================
-- Utilisateur 2 : Bob — Casual, North America
-- ============================================================
INSERT INTO users (email, username, password_hash, email_verified, account_status) VALUES
('bob@test.com', 'BobTheGamer', @pwd, TRUE, 'active');
SET @bob = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone) VALUES
(@bob, 'North America',
 'Gamer casual, j''aime les jeux en équipe et faire de nouvelles rencontres.',
 'intermediate', 'casual_friends', 'Bob#5678', 'America/New_York');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@bob, 5, 'intermediate', 'Platinum 2',  400, TRUE),   -- Rocket League
(@bob, 8, 'beginner',     NULL,          100, FALSE),  -- Fortnite
(@bob, 4, 'intermediate', 'Gold',        200, FALSE);  -- Overwatch 2

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@bob, 'casual', 'afternoon'),
(@bob, 'casual', 'evening');

-- ============================================================
-- Utilisateur 3 : Charlie — MOBA Expert, Asie
-- ============================================================
INSERT INTO users (email, username, password_hash, email_verified, account_status) VALUES
('charlie@test.com', 'CharlieCarry', @pwd, TRUE, 'active');
SET @charlie = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone) VALUES
(@charlie, 'Asia',
 'Main MOBA, ex-semi-pro. Cherche équipe compétitive ou opportunités de coaching.',
 'expert', 'competitive_team', 'Charlie#9012', 'Asia/Tokyo');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@charlie, 2, 'expert',       'Challenger', 3000, TRUE),   -- LoL
(@charlie, 6, 'expert',       'Divine 5',   2500, FALSE),  -- Dota 2
(@charlie, 1, 'intermediate', 'Platinum',    200, FALSE);  -- Valorant

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@charlie, 'competitive', 'evening'),
(@charlie, 'competitive', 'night');

-- ============================================================
-- Utilisateur 4 : Diana — FPS Avancé, Europe (bon match pour Alice)
-- ============================================================
INSERT INTO users (email, username, password_hash, email_verified, account_status) VALUES
('diana@test.com', 'DianaAim', @pwd, TRUE, 'active');
SET @diana = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username, timezone, riot_id) VALUES
(@diana, 'Europe',
 'Main Valorant, cherche duo ou équipe. Peut jouer entry ou support.',
 'advanced', 'teammates', 'Diana#3456', 'Europe/Berlin', 'DianaAim#EUW');

INSERT INTO user_games (user_id, game_id, skill_level, game_rank, hours_played, is_favorite) VALUES
(@diana, 1, 'advanced',      'Ascendant 2', 800, TRUE),   -- Valorant
(@diana, 3, 'intermediate',  'DMG',         400, FALSE),  -- CS2
(@diana, 7, 'intermediate',  'Platinum',    300, FALSE);  -- Apex

INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(@diana, 'competitive', 'evening'),
(@diana, 'competitive', 'night');

-- ============================================================
-- Match entre Alice et Bob (pour tester la messagerie)
-- ============================================================
INSERT INTO matches (user1_id, user2_id, match_score, status) VALUES
(@alice, @bob, 45.0, 'accepted');

-- ============================================================
-- Vérification
-- ============================================================
SELECT u.id, u.username, u.email, up.region, up.skill_level
FROM users u
JOIN user_profiles up ON u.id = up.user_id
WHERE u.email LIKE '%@test.com'
ORDER BY u.id;
