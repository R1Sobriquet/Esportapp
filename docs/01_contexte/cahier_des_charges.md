# Cahier des charges — GameConnect

## 1. Présentation du projet

**Nom du projet** : GameConnect  
**Commanditaire** : Tomorrow's Day  
**Contexte** : Épreuve E6 — BTS SIO SLAM  
**Version** : 2.0  
**Date** : Avril 2026

### 1.1 Description

GameConnect est une plateforme sociale dédiée aux joueurs de jeux vidéo e-sport. Elle permet aux joueurs de créer un profil enrichi, de déclarer leurs jeux et niveaux, d'être mis en relation avec des partenaires compatibles grâce à un algorithme de matching, et de communiquer via une messagerie privée.

### 1.2 Objectif général

Créer un réseau social e-sport permettant à des joueurs isolés de trouver des coéquipiers, mentors ou amis de jeu compatibles, en se basant sur leurs jeux, niveaux, régions et disponibilités.

---

## 2. Acteurs du système

| Acteur | Description |
|---|---|
| **Visiteur** | Internaute non connecté. Peut consulter la page d'accueil, les statistiques publiques, rechercher des joueurs/jeux. |
| **Joueur** | Utilisateur inscrit et authentifié. Accède à toutes les fonctionnalités. |
| **Système** | Composant logiciel : génère les notifications, calcule les scores de matching, expire les matchs. |

---

## 3. User Stories

### Acteur : Visiteur

| ID | User Story | Priorité |
|---|---|---|
| VS01 | En tant que visiteur, je veux voir une page d'accueil présentant la plateforme afin de comprendre l'intérêt de m'inscrire. | Must Have |
| VS02 | En tant que visiteur, je veux créer un compte avec email, pseudo et mot de passe afin d'accéder à la plateforme. | Must Have |
| VS03 | En tant que visiteur, je veux me connecter avec mon email et mot de passe afin d'accéder à mon espace personnel. | Must Have |
| VS04 | En tant que visiteur, je veux consulter les statistiques globales (nb joueurs, matchs) afin d'évaluer l'activité de la communauté. | Should Have |
| VS05 | En tant que visiteur, je veux rechercher des joueurs par pseudo ou jeu afin de voir si des profils m'intéressent. | Should Have |
| VS06 | En tant que visiteur, je veux voir les joueurs populaires et récemment actifs afin de découvrir la communauté. | Could Have |

### Acteur : Joueur

#### Module Profil

| ID | User Story | Priorité |
|---|---|---|
| JP01 | En tant que joueur, je veux compléter mon profil (région, bio, réseaux gaming) afin de me présenter à la communauté. | Must Have |
| JP02 | En tant que joueur, je veux choisir un avatar parmi une galerie ou uploader le mien afin de personnaliser mon profil. | Should Have |
| JP03 | En tant que joueur, je veux choisir une bannière de profil afin de personnaliser l'apparence de ma page. | Could Have |
| JP04 | En tant que joueur, je veux définir la visibilité de mon profil (public/amis/privé) afin de contrôler ma confidentialité. | Must Have |
| JP05 | En tant que joueur, je veux renseigner mes identifiants gaming (Discord, Steam, Riot ID) afin de faciliter la mise en contact. | Should Have |

#### Module Jeux

| ID | User Story | Priorité |
|---|---|---|
| JJ01 | En tant que joueur, je veux ajouter des jeux à mon profil avec mon niveau et rang afin de montrer mon expérience. | Must Have |
| JJ02 | En tant que joueur, je veux modifier les informations d'un jeu déjà ajouté afin de maintenir mon profil à jour. | Must Have |
| JJ03 | En tant que joueur, je veux supprimer un jeu de mon profil afin de retirer un jeu que je ne pratique plus. | Must Have |
| JJ04 | En tant que joueur, je veux marquer un jeu comme favori afin de mettre en avant mon jeu principal. | Should Have |
| JJ05 | En tant que joueur, je veux rechercher un jeu dans le catalogue afin de le trouver rapidement. | Should Have |

#### Module Matching

| ID | User Story | Priorité |
|---|---|---|
| JM01 | En tant que joueur, je veux que le système me propose des partenaires compatibles afin de trouver des coéquipiers pertinents. | Must Have |
| JM02 | En tant que joueur, je veux voir le score de compatibilité avec chaque proposition afin de comprendre pourquoi ce joueur m'est suggéré. | Should Have |
| JM03 | En tant que joueur, je veux accepter ou refuser une proposition de match afin de contrôler mes mises en relation. | Must Have |
| JM04 | En tant que joueur, je veux voir la liste de mes matchs acceptés afin de retrouver mes partenaires confirmés. | Must Have |

#### Module Messagerie

| ID | User Story | Priorité |
|---|---|---|
| JG01 | En tant que joueur, je veux envoyer un message privé à un joueur avec qui j'ai un match accepté afin de communiquer directement. | Must Have |
| JG02 | En tant que joueur, je veux voir toutes mes conversations avec le dernier message afin de naviguer rapidement. | Must Have |
| JG03 | En tant que joueur, je veux voir le nombre de messages non lus afin de ne rien manquer. | Must Have |
| JG04 | En tant que joueur, je veux supprimer un de mes messages afin de corriger une erreur sans perte définitive de données. | Must Have |
| JG05 | En tant que joueur, je veux voir mes messages dans l'ordre chronologique afin de suivre le fil de la conversation. | Must Have |

#### Module Notifications

| ID | User Story | Priorité |
|---|---|---|
| JN01 | En tant que joueur, je veux être notifié d'un nouveau match proposé afin de ne pas manquer une mise en relation. | Should Have |
| JN02 | En tant que joueur, je veux être notifié quand un joueur accepte mon match afin de pouvoir lui écrire. | Should Have |
| JN03 | En tant que joueur, je veux marquer toutes mes notifications comme lues afin de nettoyer mon espace. | Could Have |
| JN04 | En tant que joueur, je veux supprimer une notification afin de gérer ma liste. | Could Have |

---

## 4. Backlog priorisé (MoSCoW)

### Must Have (livré en version 2.0)
- Inscription / Connexion / JWT
- Profil complet avec confidentialité
- Gestion des jeux (ajout, modification, suppression)
- Algorithme de matching avec score
- Messagerie privée avec soft-delete
- Notifications in-app

### Should Have (livré en version 2.0)
- Avatar / bannière personnalisés
- Identifiants gaming (Discord, Riot ID, Steam)
- Score de compatibilité visible
- Recherche de joueurs et jeux
- Statistiques plateforme

### Could Have (prévu v3.0)
- Forum communautaire
- Messagerie temps réel (WebSockets)
- OAuth2 (Google, Discord)

### Won't Have (hors périmètre)
- Application mobile native
- Tournois et brackets
- Streaming intégré
