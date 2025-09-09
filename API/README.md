# API FastAPI - Plateforme eSport

Ce projet est une API REST complète pour interagir avec la base de données `esport_social`.

## Prérequis

- Python 3.10+
- MySQL (service `MySQL80` actif sous Windows)
- Base de données créée à partir du fichier `database.sql`

## Installation

pip install -r requirements.txt

## Lancer l'API

uvicorn main:app --reload

Ouvrir dans le navigateur :

http://127.0.0.1:8000/docs

L'interface Swagger vous permet de tester directement toutes les routes disponibles.

## Initialisation de la base de données

1. Lancer le serveur MySQL (Windows) :

net start MySQL80

2. Ouvrir la console MySQL :

mysql -u root -p

3. Importer le fichier SQL :

SOURCE C:/chemin/vers/database.sql;

## Structure du projet

projet/
│
├── main.py             ← Code principal de l’API
├── requirements.txt    ← Dépendances Python
├── database.sql        ← Script de création de la BDD
└── README.md           ← Ce fichier

## Endpoints principaux

### /users

- GET /users  
  ➤ Retourne tous les utilisateurs

- POST /users  
  ➤ Ajoute un nouvel utilisateur  
  Exemple JSON :
  {
    "email": "test@example.com",
    "username": "joueur1",
    "password_hash": "motdepassehashé"
  }

- DELETE /users/{id}  
  ➤ Supprime un utilisateur par ID

### /profiles

- GET /profiles  
  ➤ Retourne tous les profils

- POST /profiles  
  ➤ Crée un profil utilisateur  
  Exemple JSON :
  {
    "user_id": 1,
    "region": "Europe",
    "date_of_birth": "2000-01-01",
    "bio": "Joueur compétitif",
    "skill_level": "advanced",
    "looking_for": "teammates"
  }

- DELETE /profiles/{user_id}  
  ➤ Supprime le profil associé à un utilisateur

### /games

- GET /games  
  ➤ Liste tous les jeux

- POST /games  
  ➤ Ajoute un jeu  
  Exemple JSON :
  {
    "name": "Valorant",
    "category": "FPS",
    "icon_url": "https://example.com/icon.png",
    "api_id": "val123"
  }

- DELETE /games/{id}  
  ➤ Supprime un jeu

## Tester les routes via curl (exemples)

### Ajouter un utilisateur

curl -X POST http://127.0.0.1:8000/users -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"username\":\"testuser\",\"password_hash\":\"abc123\"}"

### Voir les utilisateurs

curl http://127.0.0.1:8000/users

## Remarques

- Vous pouvez modifier les identifiants MySQL dans main.py si nécessaire (user, passwd, etc.).
- Si vous déplacez le projet, vérifiez le chemin du fichier database.sql lors de l’import.
- L'API ne contient pas d'authentification pour le moment (dev uniquement).
- Vous trouverez plus de documentation dans /docs