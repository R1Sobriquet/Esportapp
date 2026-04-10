-- ============================================================
-- GameConnect — Schéma complet de la base de données
-- Version : 2.0 (inclut toutes les migrations 001, 002, 003)
-- Charset  : utf8mb4 / utf8mb4_unicode_ci
-- Usage    : mysql -u root -p < localsetup/schema/00_schema_complet.sql
-- ============================================================

DROP DATABASE IF EXISTS esport_social;

CREATE DATABASE esport_social
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE esport_social;

-- ============================================================
-- TABLE : users
-- Authentification et statut du compte
-- ============================================================
CREATE TABLE users (
    id               INT          NOT NULL AUTO_INCREMENT,
    email            VARCHAR(255) NOT NULL,
    username         VARCHAR(50)  NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    email_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    account_status   ENUM('active','inactive','suspended','deleted') NOT NULL DEFAULT 'active',
    last_login_at    TIMESTAMP    NULL,
    last_activity_at TIMESTAMP    NULL,
    last_active      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_email    (email),
    UNIQUE KEY uq_username (username),
    INDEX idx_last_activity  (last_activity_at),
    INDEX idx_account_status (account_status),
    INDEX idx_created_at     (created_at),
    INDEX idx_email_verified (email_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : user_profiles
-- Informations étendues du profil social
-- Relation 1-1 avec users (un utilisateur = un profil)
-- ============================================================
CREATE TABLE user_profiles (
    id                   INT          NOT NULL AUTO_INCREMENT,
    user_id              INT          NOT NULL,
    region               VARCHAR(255) NULL,
    date_of_birth        DATE         NULL,
    avatar_url           VARCHAR(500) NULL,
    banner_url           VARCHAR(500) NULL,
    bio                  TEXT         NULL,
    timezone             VARCHAR(50)  NULL,
    discord_username     VARCHAR(100) NULL,
    steam_id             VARCHAR(100) NULL,
    twitch_username      VARCHAR(100) NULL,
    riot_id              VARCHAR(100) NULL,
    skill_level          ENUM('beginner','intermediate','advanced','expert') NOT NULL DEFAULT 'beginner',
    looking_for          ENUM('teammates','mentor','casual_friends','competitive_team') NOT NULL DEFAULT 'teammates',
    profile_visibility   ENUM('public','friends','private') NOT NULL DEFAULT 'public',
    show_stats           BOOLEAN      NOT NULL DEFAULT TRUE,
    allow_friend_requests BOOLEAN     NOT NULL DEFAULT TRUE,
    notify_matches       BOOLEAN      NOT NULL DEFAULT TRUE,
    notify_messages      BOOLEAN      NOT NULL DEFAULT TRUE,
    notify_system        BOOLEAN      NOT NULL DEFAULT TRUE,
    email_notifications  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_user_profile (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_region             (region),
    INDEX idx_profiles_visibility (profile_visibility)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : games
-- Catalogue des jeux supportés (20 jeux à l'initialisation)
-- ============================================================
CREATE TABLE games (
    id         INT          NOT NULL AUTO_INCREMENT,
    name       VARCHAR(255) NOT NULL,
    category   VARCHAR(100) NULL,
    icon_url   VARCHAR(500) NULL,
    api_id     VARCHAR(100) NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_games_category (category),
    INDEX idx_games_name     (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : user_games
-- Relation N-N entre users et games
-- Contrainte : un joueur ne peut pas avoir le même jeu deux fois
-- ============================================================
CREATE TABLE user_games (
    id           INT          NOT NULL AUTO_INCREMENT,
    user_id      INT          NOT NULL,
    game_id      INT          NOT NULL,
    skill_level  ENUM('beginner','intermediate','advanced','expert') NOT NULL DEFAULT 'beginner',
    game_rank    VARCHAR(100) NULL,
    hours_played INT          NOT NULL DEFAULT 0,
    is_favorite  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_user_game (user_id, game_id),
    FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id)  REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_user_games_user_id (user_id),
    INDEX idx_user_games_game_id (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : user_preferences
-- Préférences de jeu (mode, créneau horaire)
-- ============================================================
CREATE TABLE user_preferences (
    id                   INT  NOT NULL AUTO_INCREMENT,
    user_id              INT  NOT NULL,
    preferred_game_mode  ENUM('competitive','casual','any') NOT NULL DEFAULT 'any',
    preferred_playtime   ENUM('morning','afternoon','evening','night','any') NOT NULL DEFAULT 'any',
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : matches
-- Mise en relation entre deux joueurs
-- Contrainte : une paire (user1, user2) est unique
-- Score de compatibilité : 0 à 150 points
-- ============================================================
CREATE TABLE matches (
    id          INT   NOT NULL AUTO_INCREMENT,
    user1_id    INT   NOT NULL,
    user2_id    INT   NOT NULL,
    match_score FLOAT NOT NULL DEFAULT 0,
    status      ENUM('pending','accepted','rejected','expired') NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_match (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_matches_user1        (user1_id),
    INDEX idx_matches_user2        (user2_id),
    INDEX idx_matches_status       (status),
    INDEX idx_matches_user1_status (user1_id, status),
    INDEX idx_matches_user2_status (user2_id, status),
    INDEX idx_matches_created_at   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : messages
-- Messagerie privée entre joueurs matchés
-- Soft-delete : deleted_at NULL = actif, non-NULL = supprimé
-- ============================================================
CREATE TABLE messages (
    id          INT  NOT NULL AUTO_INCREMENT,
    sender_id   INT  NOT NULL,
    receiver_id INT  NOT NULL,
    content     TEXT NOT NULL,
    is_read     BOOLEAN   NOT NULL DEFAULT FALSE,
    deleted_at  TIMESTAMP NULL     DEFAULT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_messages_sender       (sender_id),
    INDEX idx_messages_receiver     (receiver_id),
    INDEX idx_messages_conversation (sender_id, receiver_id, created_at),
    INDEX idx_messages_unread       (receiver_id, is_read),
    INDEX idx_messages_created_at   (created_at),
    INDEX idx_messages_deleted_at   (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : notifications
-- Système de notifications in-app
-- Types : match_new, match_accepted, match_rejected,
--         message_new, system, profile_view
-- ============================================================
CREATE TABLE notifications (
    id           INT          NOT NULL AUTO_INCREMENT,
    user_id      INT          NOT NULL,
    from_user_id INT          NULL,
    type         VARCHAR(50)  NOT NULL DEFAULT 'system',
    title        VARCHAR(255) NOT NULL,
    message      TEXT         NOT NULL,
    data         JSON         NULL,
    is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
    read_at      DATETIME     NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id)      REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_notifications_user    (user_id),
    INDEX idx_notifications_unread  (user_id, is_read),
    INDEX idx_notifications_type    (user_id, type),
    INDEX idx_notifications_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : user_activity_logs
-- Historique des actions utilisateur (audit trail)
-- ============================================================
CREATE TABLE user_activity_logs (
    id            INT NOT NULL AUTO_INCREMENT,
    user_id       INT NOT NULL,
    activity_type ENUM('login','logout','profile_update','message_sent','match_action','game_added') NOT NULL,
    ip_address    VARCHAR(45) NULL,
    user_agent    TEXT        NULL,
    created_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_activity (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- FIN DU SCHÉMA
-- Pour insérer les données de référence (jeux) :
--   mysql -u root -p esport_social < localsetup/schema/01_donnees_jeux.sql
-- Pour les utilisateurs de test :
--   mysql -u root -p esport_social < localsetup/seeds/02_utilisateurs_test.sql
-- ============================================================
