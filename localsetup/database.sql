-- ============================================================
-- Base de données pour la plateforme sociale e-sport
-- ============================================================

-- Création de la base si elle n’existe pas
CREATE DATABASE IF NOT EXISTS esport_social 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- Sélection de la base
USE esport_social;

-- ============================================================
-- TABLE : users
-- Contient les informations essentielles d’authentification
-- ============================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT, -- identifiant unique
    email VARCHAR(255) UNIQUE NOT NULL, -- email unique
    username VARCHAR(50) UNIQUE NOT NULL, -- pseudo unique
    password_hash VARCHAR(255) NOT NULL, -- mot de passe chiffré
    email_verified BOOLEAN DEFAULT FALSE, -- email vérifié ou non
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- date de création
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- maj auto
);

-- ============================================================
-- TABLE : user_profiles
-- Étend les infos des utilisateurs avec profil social
-- ============================================================
CREATE TABLE user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT, 
    user_id INT UNIQUE NOT NULL, -- Relation 1-1 avec users : 
                                 -- Chaque utilisateur possède au maximum un profil, 
                                 -- et chaque profil correspond à un seul utilisateur.


    -- ===> Colonnes modifiées
    -- first_name et last_name supprimés
    -- location renommée en region
    region VARCHAR(255), -- région de l’utilisateur (ex: "Europe", "NA")

    -- date de naissance, mais seulement si utilisateur a +15 ans
    date_of_birth DATE,
    CONSTRAINT chk_minimum_age CHECK (date_of_birth IS NULL OR date_of_birth <= DATE_SUB(CURDATE(), INTERVAL 15 YEAR)),

    avatar_url VARCHAR(500), -- image de profil
    bio TEXT, -- description
    timezone VARCHAR(50), -- fuseau horaire

    -- Identifiants gaming/streaming
    discord_username VARCHAR(100),
    steam_id VARCHAR(100),
    twitch_username VARCHAR(100),

    -- Compétences et recherche
    skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
    looking_for ENUM('teammates', 'mentor', 'casual_friends', 'competitive_team') DEFAULT 'teammates',

    -- Confidentialité
    profile_visibility ENUM('public', 'friends', 'private') DEFAULT 'public',
    show_stats BOOLEAN DEFAULT TRUE,
    allow_friend_requests BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Relation avec users
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : games
-- Liste des jeux supportés
-- ============================================================
CREATE TABLE games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL, -- nom du jeu (ex: "Valorant")
    category VARCHAR(100), -- catégorie (FPS, MOBA, etc.)
    icon_url VARCHAR(500), -- icône du jeu
    api_id VARCHAR(100), -- identifiant externe API
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE : user_games
-- Relation N-N entre users et games (via cette table) : 
-- Un utilisateur peut jouer à plusieurs jeux 
-- et un jeu peut être joué par plusieurs utilisateurs.
-- ============================================================
CREATE TABLE user_games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_id INT NOT NULL,

    skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner', -- niveau du joueur sur ce jeu
    game_rank VARCHAR(100), -- rang/elo
    hours_played INT DEFAULT 0, -- temps de jeu cumulé
    is_favorite BOOLEAN DEFAULT FALSE, -- si c’est son jeu favori

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Relations
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,

    -- Contrainte : un utilisateur ne peut pas avoir le même jeu en double
    UNIQUE KEY unique_user_game (user_id, game_id)
);

-- ============================================================
-- TABLE : user_preferences
-- Stocke les préférences de jeu d’un utilisateur
-- Relation 1-1 (ou 1-N selon usage) avec users :
-- Chaque utilisateur peut avoir une ou plusieurs préférences, 
-- mais chaque préférence appartient à un seul utilisateur.
-- ============================================================
CREATE TABLE user_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,

    preferred_game_mode ENUM('competitive', 'casual', 'any') DEFAULT 'any', -- mode favori
    preferred_playtime ENUM('morning', 'afternoon', 'evening', 'night', 'any') DEFAULT 'any', -- créneau favori

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : matches
-- Gère les mises en relation entre deux utilisateurs
-- Relation N-N entre utilisateurs (via cette table) :
-- Un utilisateur peut être mis en relation avec plusieurs autres, 
-- et chaque relation concerne exactement deux utilisateurs.
-- ============================================================
CREATE TABLE matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,

    match_score FLOAT DEFAULT 0, -- score de compatibilité
    status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending', -- état du match

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Relations
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Un match entre deux joueurs doit être unique
    UNIQUE KEY unique_match (user1_id, user2_id)
);

-- ============================================================
-- TABLE : messages
-- Messagerie privée entre utilisateurs
-- Relation N-N entre utilisateurs (via cette table) :
-- Un utilisateur peut envoyer plusieurs messages à d’autres, 
-- et chaque message relie exactement un expéditeur et un destinataire.
-- ============================================================
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL, -- expéditeur
    receiver_id INT NOT NULL, -- destinataire
    content TEXT NOT NULL, -- contenu du message
    is_read BOOLEAN DEFAULT FALSE, -- lu ou non
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Relations
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
