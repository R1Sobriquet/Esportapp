-- =====================================================================
-- GC-EVOL-T1 : Migration 004 — Pays d'origine du joueur
-- =====================================================================
-- Besoin 1 (Page d'accueil) : afficher le pays d'origine de chaque joueur.
-- Ajoute une colonne `country` optionnelle (NULL) au profil utilisateur,
-- placée juste après `region` pour rester cohérent avec la localisation.
-- Colonne NULLable => n'impacte pas les profils existants.
-- =====================================================================

ALTER TABLE user_profiles
  ADD COLUMN country VARCHAR(100) NULL AFTER region;
