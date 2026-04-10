# Expression des besoins — GameConnect

## 1. Périmètre fonctionnel

La plateforme GameConnect couvre 6 domaines fonctionnels :

| Domaine | Fonctionnalités incluses |
|---|---|
| **Authentification** | Inscription, connexion, gestion du token JWT, déconnexion |
| **Profil utilisateur** | Informations personnelles, avatar, bannière, réseaux gaming, confidentialité |
| **Bibliothèque de jeux** | Catalogue de 20 jeux, ajout/modification/suppression par l'utilisateur |
| **Matching** | Algorithme de compatibilité, acceptation/refus, liste des matchs |
| **Messagerie** | Conversations privées, suppression logique (soft-delete) |
| **Notifications** | Notifications in-app, compteur non-lus, marquage lu/suppression |

**Hors périmètre** : forum (UI présente, backend non implémenté), application mobile, tournois.

---

## 2. Contraintes techniques

### 2.1 Stack technologique imposée

| Couche | Technologie | Version |
|---|---|---|
| Backend | FastAPI (Python) | 0.104.1 |
| Serveur ASGI | Uvicorn | 0.24.0 |
| Base de données | MySQL | 8.0 |
| ORM / Driver | MySQLdb (mysqlclient) | 2.2.0 |
| Frontend | React | 18.2.0 |
| Build tool | Vite | 5.0.8 |
| CSS | Tailwind CSS | 3.4.17 |
| Client HTTP | Axios | 1.6.0 |
| Authentification | PyJWT + bcrypt | 2.8.0 / 4.1.1 |

### 2.2 Navigateurs supportés

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### 2.3 Responsive design

L'application doit être pleinement fonctionnelle sur :
- Desktop (≥1024px)
- Tablette (768px – 1023px)
- Mobile (< 768px) — sidebar messagerie masquée par défaut

### 2.4 Sécurité

- Mots de passe hashés avec **bcrypt** (12 rounds minimum)
- Authentification par **JWT** (HS256, expiration 7 jours)
- Protection contre les injections SQL (requêtes paramétrées)
- Headers CORS restreints aux origines autorisées
- Validation stricte des entrées côté backend (Pydantic)

---

## 3. Contraintes non-fonctionnelles

### 3.1 Performance
- Temps de réponse API : **< 100 ms** (médiane)
- Bundle frontend compressé : **< 500 KB** (gzip)
- Score Lighthouse cible : **95+**

### 3.2 Légal
- **COPPA** : âge minimum 13 ans vérifié à l'inscription (`date_of_birth`)
- Mentions légales, CGU et politique de confidentialité accessibles
- Conformité RGPD : droit de suppression, visibilité du profil paramétrable

### 3.3 Disponibilité
- Mode développement : démarrage local en < 30 secondes
- Pas de contrainte de disponibilité en production (périmètre BTS)

### 3.4 Maintenabilité
- Code Python conforme **PEP 8**
- Code JavaScript conforme **ESLint** (0 warning)
- Couverture de tests unitaires frontend : **89 tests, 6 suites**

---

## 4. Interfaces système

### 4.1 API REST

L'API expose **50+ endpoints** organisés en 8 routeurs :

| Routeur | Préfixe | Nb endpoints |
|---|---|---|
| auth | `/register`, `/login` | 2 |
| profile | `/profile`, `/user/activity-stats` | 3 |
| games | `/games`, `/user/games` | 7 |
| matching | `/matches` | 4 |
| messages | `/messages` | 4 |
| notifications | `/notifications` | 7 |
| search | `/search` | 3 |
| stats | `/stats` | 6 |

### 4.2 Documentation API automatique

Swagger UI disponible à `http://localhost:8000/docs`  
ReDoc disponible à `http://localhost:8000/redoc`

### 4.3 Base de données

9 tables MySQL reliées par clés étrangères avec cascade sur suppression.  
Voir `localsetup/schema/00_schema_complet.sql` pour le schéma complet.
