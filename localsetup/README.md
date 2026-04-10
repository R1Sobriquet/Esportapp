# GameConnect — Configuration locale de la base de données

## Structure

```
localsetup/
├── schema/
│   ├── 00_schema_complet.sql    → Schéma complet (DROP + CREATE de toutes les tables)
│   └── 01_donnees_jeux.sql      → Catalogue des 20 jeux (données de référence)
├── seeds/
│   └── 02_utilisateurs_test.sql → 4 utilisateurs de test (mot de passe : password123)
└── migrations/                  → Migrations historiques (déjà incluses dans 00_schema_complet)
    ├── 001_add_indexes_and_banner.sql
    ├── 002_notifications_table.sql
    └── 003_soft_delete_messages.sql
```

## Installation complète (nouveau projet)

```bash
# 1. Créer la base et toutes les tables
mysql -u root -p < localsetup/schema/00_schema_complet.sql

# 2. Insérer le catalogue des jeux
mysql -u root -p esport_social < localsetup/schema/01_donnees_jeux.sql

# 3. (Optionnel) Insérer les utilisateurs de test
mysql -u root -p esport_social < localsetup/seeds/02_utilisateurs_test.sql
```

### Windows (XAMPP)
```cmd
E:\XAMPP\mysql\bin\mysql.exe -u root -p < localsetup\schema\00_schema_complet.sql
E:\XAMPP\mysql\bin\mysql.exe -u root -p esport_social < localsetup\schema\01_donnees_jeux.sql
```

Ou via **phpMyAdmin** (`http://localhost/phpmyadmin`) :
1. Créer la base `esport_social`
2. Onglet **Import** → importer `00_schema_complet.sql`
3. Importer `01_donnees_jeux.sql`

## Mise à jour d'un projet existant (migrations uniquement)

Si la base existe déjà et que vous avez besoin d'appliquer les évolutions :

```bash
# Migration 001 : Index de performance + colonnes banner_url, riot_id, last_active
mysql -u root -p esport_social < localsetup/migrations/001_add_indexes_and_banner.sql

# Migration 002 : Table notifications + colonnes notify_*
mysql -u root -p esport_social < localsetup/migrations/002_notifications_table.sql

# Migration 003 : Soft-delete messages (colonne deleted_at)
mysql -u root -p esport_social < localsetup/migrations/003_soft_delete_messages.sql
```

## Utilisateurs de test

| Identifiant | Mot de passe | Région | Niveau | Jeux principaux |
|---|---|---|---|---|
| `alice@test.com` | `password123` | Europe | Expert | Valorant, CS2 |
| `bob@test.com` | `password123` | NA | Intermédiaire | Rocket League, OW2 |
| `charlie@test.com` | `password123` | Asie | Expert | LoL, Dota 2 |
| `diana@test.com` | `password123` | Europe | Avancé | Valorant, CS2 |

Alice et Bob ont un **match accepté** entre eux → ils peuvent s'envoyer des messages.

## Vérification

```sql
-- Vérifier les tables créées
SHOW TABLES;

-- Vérifier les jeux
SELECT COUNT(*) FROM games;  -- doit retourner 20

-- Vérifier les utilisateurs de test
SELECT username, email FROM users WHERE email LIKE '%@test.com';
```

## Réinitialisation complète

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS esport_social;"
mysql -u root -p < localsetup/schema/00_schema_complet.sql
mysql -u root -p esport_social < localsetup/schema/01_donnees_jeux.sql
```
