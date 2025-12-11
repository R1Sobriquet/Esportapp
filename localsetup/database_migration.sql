-- Migration pour corriger les profils utilisateurs
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS first_name,
DROP COLUMN IF EXISTS last_name,
DROP COLUMN IF EXISTS location;

-- Ajouter la colonne region si elle n'existe pas
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS region VARCHAR(255) AFTER user_id;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_region ON user_profiles(region);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);