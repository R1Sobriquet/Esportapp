-- ============================================================
-- Données de test pour la plateforme E-Sport Social
-- ============================================================

USE esport_social;

-- ============================================================
-- Insertion des jeux populaires
-- ============================================================
INSERT INTO games (name, category, icon_url, api_id) VALUES
('Valorant', 'FPS', 'https://cdn.jsdelivr.net/gh/xNocken/valorant-api-assets/agents/icons/displayicon.png', 'valorant'),
('League of Legends', 'MOBA', 'https://cdn.iconscout.com/icon/free/png-256/league-of-legends-2-569244.png', 'lol'),
('Counter-Strike 2', 'FPS', 'https://cdn.akamai.steamstatic.com/apps/csgo/images/csgo_react//cs2/CS2_logo.svg', 'cs2'),
('Overwatch 2', 'FPS', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Overwatch_circle_logo.svg/1200px-Overwatch_circle_logo.svg.png', 'ow2'),
('Rocket League', 'Sports', 'https://cdn2.steamgriddb.com/file/sgdb-cdn/icon/d0b6b6e1e55f31a47e088e1e98a59a3b.png', 'rocket-league'),
('Dota 2', 'MOBA', 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/logos/dota2_logo.png', 'dota2'),
('Apex Legends', 'Battle Royale', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Apex_legends_logo.svg/1200px-Apex_legends_logo.svg.png', 'apex'),
('Fortnite', 'Battle Royale', 'https://cdn2.epicgames.com/static/fonts/joystix/JOYSTIX-v1.0/joystix-monospace.ttf', 'fortnite'),
('Rainbow Six Siege', 'FPS', 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/449BBgnc3Q1ha2IN9rh3bR/e1fce39cfe3470fd49c36a4938c6b7d0/r6s-logo.png', 'r6s'),
('Call of Duty: Warzone', 'Battle Royale', 'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/warzone/common/social-share/social-share-image.jpg', 'cod-warzone'),
('Minecraft', 'Sandbox', 'https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png', 'minecraft'),
('FIFA 24', 'Sports', 'https://cdn.sofifa.net/meta/fifa24.png', 'fifa24'),
('Street Fighter 6', 'Fighting', 'https://www.streetfighter.com/6/assets/images/common/logo.png', 'sf6'),
('Tekken 8', 'Fighting', 'https://cdn.bandainamcoent.eu/production/tekken-8-logo-1696863865097.png', 'tekken8'),
('World of Warcraft', 'MMORPG', 'https://upload.wikimedia.org/wikipedia/en/9/91/WoW_icon.png', 'wow'),
('Final Fantasy XIV', 'MMORPG', 'https://img.finalfantasyxiv.com/lds/h/i/cR5q5k6kfHvRJ0lP8uDqfKxMfU.png', 'ffxiv'),
('Genshin Impact', 'Action RPG', 'https://upload.wikimedia.org/wikipedia/en/5/5e/Genshin_Impact_logo.svg', 'genshin'),
('Among Us', 'Social Deduction', 'https://www.innersloth.com/wp-content/uploads/2023/10/AU_Logo-300x300.png', 'among-us'),
('Fall Guys', 'Battle Royale', 'https://cdn2.steamgriddb.com/file/sgdb-cdn/icon/5a08e49c3a8cc3fa7b90c93a9a9b0e39.png', 'fall-guys'),
('Halo Infinite', 'FPS', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Halo_Infinite_logo.svg/2560px-Halo_Infinite_logo.svg.png', 'halo-infinite');

-- ============================================================
-- Note: Les utilisateurs doivent être créés via l'API pour 
-- avoir des mots de passe correctement hachés
-- ============================================================

-- Pour tester l'application :
-- 1. Créez des comptes via l'interface web ou l'API
-- 2. Ajoutez des jeux à vos profils
-- 3. Testez le système de matching
-- 4. Échangez des messages avec les utilisateurs matchés

-- ============================================================
-- Données d'exemple pour tester rapidement (optionnel)
-- Note: Ces comptes utilisent bcrypt pour le hash du mot de passe
-- Le mot de passe pour tous ces comptes est: "password123"
-- ============================================================

-- Hash pour "password123" avec bcrypt: $2b$12$LQdV7XkwPxGTgvfpK8FTEu0KNvmGCFkVpRYK2YJwrm9bWcGpXHNyu
-- ATTENTION: Ce hash peut varier selon votre installation, il est préférable de créer les comptes via l'API

/*
-- Décommentez ces lignes si vous voulez insérer des utilisateurs de test
-- (après avoir vérifié le hash bcrypt correct pour votre système)

INSERT INTO users (email, username, password_hash, email_verified) VALUES
('alice@example.com', 'AliceGamer', '$2b$12$LQdV7XkwPxGTgvfpK8FTEu0KNvmGCFkVpRYK2YJwrm9bWcGpXHNyu', TRUE),
('bob@example.com', 'BobTheBuilder', '$2b$12$LQdV7XkwPxGTgvfpK8FTEu0KNvmGCFkVpRYK2YJwrm9bWcGpXHNyu', TRUE),
('charlie@example.com', 'CharliePlay', '$2b$12$LQdV7XkwPxGTgvfpK8FTEu0KNvmGCFkVpRYK2YJwrm9bWcGpXHNyu', TRUE);

-- Profils pour les utilisateurs de test
INSERT INTO user_profiles (user_id, region, bio, skill_level, looking_for, discord_username) VALUES
(1, 'Europe', 'Joueuse passionnée de FPS, principalement Valorant et CS2', 'advanced', 'teammates', 'Alice#1234'),
(2, 'NA', 'Casual gamer, j''aime les jeux coop et les MMO', 'intermediate', 'casual_friends', 'Bob#5678'),
(3, 'Asia', 'Joueur compétitif cherchant une équipe pour tournois', 'expert', 'competitive_team', 'Charlie#9012');

-- Jeux des utilisateurs
INSERT INTO user_games (user_id, game_id, skill_level, rank, hours_played, is_favorite) VALUES
(1, 1, 'advanced', 'Diamond 2', 500, TRUE),  -- Alice joue à Valorant
(1, 3, 'intermediate', 'Master Guardian', 300, FALSE),  -- Alice joue à CS2
(2, 15, 'intermediate', 'Level 60', 1000, TRUE),  -- Bob joue à WoW
(2, 11, 'beginner', NULL, 50, FALSE),  -- Bob joue à Minecraft
(3, 2, 'expert', 'Challenger', 2000, TRUE),  -- Charlie joue à LoL
(3, 1, 'advanced', 'Immortal', 800, FALSE);  -- Charlie joue à Valorant

-- Préférences des utilisateurs
INSERT INTO user_preferences (user_id, preferred_game_mode, preferred_playtime) VALUES
(1, 'competitive', 'evening'),
(1, 'competitive', 'night'),
(2, 'casual', 'afternoon'),
(2, 'any', 'evening'),
(3, 'competitive', 'night');
*/

-- ============================================================
-- Requêtes utiles pour vérifier les données
-- ============================================================

-- Voir tous les jeux disponibles
SELECT * FROM games ORDER BY category, name;

-- Voir les utilisateurs et leurs jeux (après création des comptes)
-- SELECT u.username, g.name as game, ug.skill_level, ug.rank 
-- FROM users u 
-- JOIN user_games ug ON u.id = ug.user_id 
-- JOIN games g ON ug.game_id = g.id 
-- ORDER BY u.username, g.name;

-- Compter les utilisateurs par région
-- SELECT region, COUNT(*) as count 
-- FROM user_profiles 
-- WHERE region IS NOT NULL 
-- GROUP BY region;