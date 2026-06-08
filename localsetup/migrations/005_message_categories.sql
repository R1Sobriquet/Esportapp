-- =====================================================================
-- GC-EVOL-T1 : Migration 005 — Catégories de messages
-- =====================================================================
-- Besoin 2 (Messagerie) : catégoriser les messages.
-- On utilise une TABLE DE RÉFÉRENCE `message_categories` (PAS un ENUM)
-- afin de pouvoir ajouter de nouvelles catégories sans modifier la
-- structure de la base (simple INSERT). La FK `messages.category_id`
-- est en ON DELETE SET NULL : supprimer une catégorie n'efface pas les
-- messages, ils repassent simplement « sans catégorie » (NULL).
-- Même logique que notifications.from_user_id (cf. migration 002).
-- =====================================================================

-- ---------------------------------------------------------------------
-- GC-EVOL-T1.a : Table de référence des catégories
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,            -- libellé affiché (ex: "Stratégie / Conseils")
    slug VARCHAR(50) UNIQUE NOT NULL,      -- identifiant URL/filtre (ex: "strategie")
    color VARCHAR(7) DEFAULT '#AD2831',    -- couleur du badge (hex, thème bordeaux)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- GC-EVOL-T1.b : Catégories de base (extensibles par simple INSERT)
-- ---------------------------------------------------------------------
INSERT INTO message_categories (name, slug, color) VALUES
    ('Stratégie / Conseils', 'strategie', '#640D14'),
    ('Échanges / Commerce',  'commerce',  '#800E13'),
    ('Général',              'general',   '#AD2831'),
    ('Humour / Mèmes',       'humour',    '#38040E');

-- ---------------------------------------------------------------------
-- GC-EVOL-T1.c : Colonne category_id sur messages + contrainte FK
-- ---------------------------------------------------------------------
ALTER TABLE messages
  ADD COLUMN category_id INT NULL AFTER content;

ALTER TABLE messages
  ADD CONSTRAINT fk_messages_category
  FOREIGN KEY (category_id) REFERENCES message_categories(id)
  ON DELETE SET NULL;
