# 🎮 GameConnect - Plateforme sociale de gaming e-sport

<div align="center">

![Logo GameConnect](https://media.istockphoto.com/id/1560833158/fr/photo/contr%C3%B4leur-de-jeu-avec-clavier-%C3%A9clair%C3%A9-violet-au-milieu-de-divers-appareils-sans-fil.jpg?s=1024x1024\&w=is\&k=20\&c=CnoqqQkITt9i0rfHQDaR-x9078NzTnPn9zlgBqWt3wc=)

[![Version PHP](https://img.shields.io/badge/PHP-8.0%2B-777BB4?style=flat-square\&logo=php)](https://php.net/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square\&logo=react)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square\&logo=mysql)](https://mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=flat-square\&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/Licence-MIT-green.svg?style=flat-square)](LICENSE)

**Connecte-toi • Joue • Conquiers**

*La plateforme ultime pour les gamers : trouve des coéquipiers, crée ta communauté et dominez ensemble la compétition.*

[🚀 Démo en ligne](#demo) • [📖 Documentation](#documentation) • [🐛 Signaler un bug](../../issues) • [💡 Suggérer une fonctionnalité](../../issues)

</div>

---

## 🌟 **Fonctionnalités**

### 🔐 **Gestion des utilisateurs**

* **Authentification sécurisée** — Système de connexion basé sur JWT avec chiffrement des mots de passe
* **Profils riches** — Profils détaillés avec statistiques, préférences et liens sociaux
* **Contrôle de la vie privée** — Réglages précis de visibilité des profils

### 🎮 **Intégration des jeux**

* **Support multi-jeux** — Prise en charge des jeux populaires (FPS, MOBA, Battle Royale, etc.)
* **Suivi des compétences** — Statistiques, rangs et temps de jeu par titre
* **Bibliothèque de jeux** — Organise et présente ton identité de gamer

### 🤝 **Système de mise en relation intelligent**

* **Appariement basé sur l’IA** — Algorithme avancé prenant en compte :

  * Jeux en commun et niveaux de compétence
  * Préférences et disponibilités
  * Localisation géographique et fuseau horaire
  * Préférences de communication
* **Score de compatibilité** — Pourcentage de correspondance avec explications détaillées
* **Notifications en temps réel** — Alertes instantanées pour nouveaux matchs et messages

### 💬 **Espace de communication**

* **Messagerie directe** — Chat sécurisé en temps réel entre joueurs associés
* **Forums communautaires** — Discussions spécifiques à chaque jeu et sujets généraux
* **Formation d’équipes** — Crée ou rejoins des équipes avec des outils intégrés

### 📊 **Statistiques & analyses**

* **Statistiques de jeu** — Suivi et visualisation détaillés
* **Indicateurs de performance** — Suivi de ta progression au fil du temps
* **Tendances communautaires** — Découvre les jeux et joueurs les plus populaires

---

## 🏗️ **Architecture technique**

### **Backend**

* **PHP 8.0+** — Code moderne, typé et optimisé
* **MySQL 8.0** — Base de données relationnelle robuste
* **Authentification JWT** — Sécurisée et sans état
* **API RESTful** — Architecture claire et documentée
* **Composer** — Gestionnaire de dépendances PHP

### **Frontend**

* **React 18.2** — Version moderne avec hooks et fonctionnalités concurrentes
* **Vite** — Outil de build ultra rapide
* **Tailwind CSS 3.3** — Framework CSS utilitaire pour un développement rapide
* **Axios** — Client HTTP basé sur les promesses pour les appels API
* **Lucide React** — Icônes modernes et cohérentes

### **Base de données**

* **Conception normalisée** — Relations optimisées entre tables
* **Indexation efficace** — Requêtes rapides et performantes
* **Intégrité des données** — Contraintes et validations complètes

---

## 🚀 **Démarrage rapide**

### **Prérequis**

* PHP 8.0 ou supérieur
* MySQL 8.0 ou supérieur
* Node.js 16.0 ou supérieur
* Composer
* Git

### **Installation**

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/yourusername/gameconnect.git
   cd gameconnect
   ```

2. **Configuration du backend**

   ```bash
   cd backend
   composer install

   # Configuration de l’environnement
   cp .env.example .env
   # Modifier .env avec vos identifiants de base de données

   # Création de la base
   mysql -u root -p -e "CREATE DATABASE esport_social;"
   mysql -u root -p esport_social < ../database.sql

   # Lancer le serveur PHP
   php -S localhost:8000
   ```

3. **Configuration du frontend**

   ```bash
   cd frontend
   npm install

   # Lancer le serveur de développement
   npm run dev
   ```

4. **Accès à l’application**

   * Frontend : [http://localhost:5173](http://localhost:5173)
   * Backend API : [http://localhost:8000](http://localhost:8000)

---

## 🔧 **Configuration**

### **Variables d’environnement**

Créer un fichier `.env` dans le dossier `backend` :

```env
# Configuration base de données
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=your_password
DB_NAME=esport_social

# Sécurité
JWT_SECRET=ta_clef_secrète_ultra_sécurisée

# CORS
CORS_ORIGIN=http://localhost:5173
```

### **Structure de la base**

* `users` — Comptes et authentification
* `user_profiles` — Informations et préférences utilisateur
* `games` — Catalogue et métadonnées des jeux
* `matches` — Système de mise en relation
* `messages` — Communication entre utilisateurs
* `forum_*` — Discussion communautaire

---

## 📚 **Documentation API**

### **Authentification**

```http
POST /api/register    # Inscription utilisateur
POST /api/login       # Connexion utilisateur
```

### **Gestion des profils**

```http
GET  /api/profile     # Récupérer le profil utilisateur
PUT  /api/profile     # Mettre à jour le profil utilisateur
```

### **Gestion des jeux**

```http
GET  /api/games       # Obtenir tous les jeux disponibles
GET  /api/user/games  # Obtenir les jeux d’un utilisateur
POST /api/user/games  # Ajouter un jeu au profil
```

### **Système de matchmaking**

```http
POST /api/matches           # Trouver de nouveaux matchs
GET  /api/matches           # Obtenir les matchs d’un utilisateur
POST /api/matches/{id}/accept  # Accepter un match
```

### **Messagerie**

```http
GET  /api/messages          # Liste des conversations
GET  /api/messages/{userId} # Messages avec un utilisateur spécifique
POST /api/messages          # Envoyer un message
```

Documentation complète : [Docs API](docs/api.md)

---

## 🛣️ **Feuille de route**

### **Phase 1 : Fonctionnalités de base** ✅

* [x] Authentification et profils
* [x] Bibliothèque de jeux
* [x] Système de matchmaking simple
* [x] Messagerie directe

### **Phase 2 : Fonctionnalités sociales avancées** 🚧

* [ ] Notifications en temps réel
* [ ] Forums améliorés
* [ ] Gestion d’équipes
* [ ] Organisation de tournois

### **Phase 3 : Fonctionnalités avancées** 📋

* [ ] Chat vocal/vidéo
* [ ] Application mobile
* [ ] Intégration Twitch/YouTube
* [ ] Recommandations de jeux via IA
* [ ] Suivi des tournois e-sport

### **Phase 4 : Expansion de la plateforme** 🔮

* [ ] Intégration d’API tierces
* [ ] Événements et défis communautaires
* [ ] Marketplace de services gaming
* [ ] Tableau de bord analytique avancé

---

## 🤝 **Contribution**

Tu veux aider au projet ? Voici comment :

1. **Fork le dépôt**
2. **Crée ta branche** (`git checkout -b feature/NouvelleFonctionnalité`)
3. **Commit tes changements** (`git commit -m 'Ajout : Nouvelle fonctionnalité'`)
4. **Push la branche** (`git push origin feature/NouvelleFonctionnalité`)
5. **Ouvre une Pull Request**

### **Bonnes pratiques**

* Respecter le standard PSR-12 (PHP)
* Utiliser ESLint & Prettier (JS/React)
* Rédiger des messages de commit clairs
* Ajouter des tests pour les nouvelles fonctionnalités
* Mettre à jour la documentation si nécessaire

### **Code de conduite**

Ce projet suit le [Code de Conduite Contributor Covenant](CODE_OF_CONDUCT.md).

---

## 🧪 **Tests**

### **Backend**

```bash
cd backend
composer test
```

### **Frontend**

```bash
cd frontend
npm run test
```

### **End-to-End**

```bash
npm run test:e2e
```

---

## 📊 **Performance**

* **Temps de réponse API** : < 100 ms
* **Requêtes SQL** : optimisées
* **Taille du bundle frontend** : < 500 KB gzip
* **Score Lighthouse** : 95+

---

## 🔒 **Sécurité**

* **Mots de passe** : hachage bcrypt + salt
* **JWT** : authentification sécurisée
* **Prévention SQLi** : requêtes préparées
* **Protection XSS** : nettoyage des entrées + CSP
* **CORS** : politiques strictes

---

## 📱 **Navigateurs pris en charge**

| Navigateur | Version |
| ---------- | ------- |
| Chrome     | 88+     |
| Firefox    | 85+     |
| Safari     | 14+     |
| Edge       | 88+     |

---

## 📄 **Licence**

Ce projet est sous licence **MIT** — voir le fichier [LICENSE](LICENSE).

---

## 🙏 **Remerciements**

* [React](https://reactjs.org/) — Framework web utilisé
* [Tailwind CSS](https://tailwindcss.com/) — Pour un design moderne et responsive
* [Lucide](https://lucide.dev/) — Pour ses icônes élégantes
* [JWT](https://jwt.io/) — Pour l’authentification sécurisée
* La **communauté gaming** pour son inspiration et ses retours

---

## 📞 **Support**

* **Documentation** : [docs.gameconnect.com](https://docs.gameconnect.com)
* **Forum communautaire** : [forum.gameconnect.com](https://forum.gameconnect.com)
* **Serveur Discord** : [Rejoindre le Discord](https://discord.gg/gameconnect)
* **Support par mail** : [support@gameconnect.com](mailto:support@gameconnect.com)

---

<div align="center">

**⭐ Mets une étoile si ce projet t’a été utile !**

**Créé par des gamers, pour les gamers** 🎮

</div>

