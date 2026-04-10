# Environnement de développement — GameConnect

## 1. Prérequis

| Outil | Version minimale | Téléchargement |
|---|---|---|
| Python | 3.10+ | python.org |
| Node.js | 18+ | nodejs.org |
| npm | 8+ | (inclus avec Node.js) |
| MySQL | 8.0 | mysql.com ou XAMPP |
| Git | 2.30+ | git-scm.com |

**Outils recommandés** :
- VS Code avec extensions : Python, ESLint, Tailwind CSS IntelliSense, REST Client
- Postman ou Swagger UI (`http://localhost:8000/docs`) pour tester l'API

---

## 2. Dépôt Git

- **URL** : `https://github.com/R1Sobriquet/Esportapp`
- **Branche principale** : `main`
- **Branche de développement** : `claude/update-readme-add-jest-tests-j1ztU`

```bash
git clone https://github.com/R1Sobriquet/Esportapp.git
cd Esportapp
git checkout claude/update-readme-add-jest-tests-j1ztU
```

---

## 3. Installation du backend (FastAPI)

### 3.1 Environnement virtuel Python

**Linux / macOS** :
```bash
cd API
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Windows** :
```cmd
cd API
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3.2 Dépendances Python

| Package | Version | Rôle |
|---|---|---|
| fastapi | 0.104.1 | Framework web asynchrone |
| uvicorn[standard] | 0.24.0 | Serveur ASGI |
| mysqlclient | 2.2.0 | Driver MySQL |
| bcrypt | 4.1.1 | Hash des mots de passe |
| PyJWT | 2.8.0 | Tokens JWT |
| python-dotenv | 1.0.0 | Variables d'environnement |
| pydantic[email] | 2.3.0 | Validation des données |
| email-validator | 2.1.0 | Validation email |

### 3.3 Fichier de configuration

Créer `API/.env` :
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=esport_social
```

> Le `JWT_SECRET` est auto-généré au premier démarrage et sauvegardé dans `API/.jwt_secret`.

### 3.4 Démarrage

```bash
cd API
uvicorn app.main:app --reload --port 8000
```

L'API est disponible à :
- **API** : `http://localhost:8000`
- **Swagger** : `http://localhost:8000/docs`
- **ReDoc** : `http://localhost:8000/redoc`

---

## 4. Installation du frontend (React)

```bash
cd frontend
npm install
npm run dev
```

L'application est disponible à : **`http://localhost:5173`**

### Scripts npm disponibles

| Commande | Action |
|---|---|
| `npm run dev` | Démarrage du serveur de développement Vite |
| `npm run build` | Build de production (optimisé) |
| `npm run preview` | Prévisualisation du build de production |
| `npm run lint` | Vérification ESLint (0 warning autorisé) |
| `npm test` | Exécution des tests Jest |
| `npm run test:watch` | Tests en mode watch (rechargement automatique) |
| `npm run test:coverage` | Tests avec rapport de couverture |

---

## 5. Installation de la base de données

### 5.1 Linux / macOS

```bash
# Créer la base et les tables
mysql -u root -p < localsetup/schema/00_schema_complet.sql

# Insérer le catalogue des jeux
mysql -u root -p esport_social < localsetup/schema/01_donnees_jeux.sql

# (Optionnel) Insérer des utilisateurs de test
mysql -u root -p esport_social < localsetup/seeds/02_utilisateurs_test.sql
```

### 5.2 Windows (XAMPP)

Démarrer XAMPP → lancer Apache + MySQL, puis :

```cmd
E:\XAMPP\mysql\bin\mysql.exe -u root -p < localsetup\schema\00_schema_complet.sql
E:\XAMPP\mysql\bin\mysql.exe -u root -p esport_social < localsetup\schema\01_donnees_jeux.sql
```

Ou via **phpMyAdmin** (`http://localhost/phpmyadmin`) : Import → sélectionner les fichiers SQL.

---

## 6. Vérification de l'installation

```bash
# Backend répond
curl http://localhost:8000/health
# → {"status": "ok"}

# Frontend charge
# Ouvrir http://localhost:5173 dans un navigateur

# Tests passent
cd frontend && npm test
# → 89 tests, 6 suites, all passing
```

---

## 7. Structure du projet

```
Esportapp/
├── API/                     # Backend FastAPI
│   ├── app/
│   │   ├── main.py          # Point d'entrée, CORS, lifespan
│   │   ├── config.py        # Paramètres JWT, DB, CORS
│   │   ├── database.py      # Connexion MySQL, context managers
│   │   ├── models.py        # Schémas Pydantic
│   │   └── routes/          # Routeurs par domaine
│   │       ├── auth.py
│   │       ├── profile.py
│   │       ├── games.py
│   │       ├── messages.py
│   │       ├── matches.py
│   │       ├── notifications.py
│   │       ├── search.py
│   │       └── stats.py
│   └── requirements.txt
├── frontend/                # Frontend React
│   ├── src/
│   │   ├── pages/           # Composants de page
│   │   ├── components/      # Composants réutilisables
│   │   ├── contexts/        # Context API (Auth, Theme, Toast)
│   │   ├── services/        # Couche API (Axios)
│   │   └── __tests__/       # Tests Jest
│   ├── jest.config.cjs
│   ├── babel.config.cjs
│   └── package.json
├── localsetup/              # Scripts de configuration BDD
├── docs/                    # Documentation (ce dossier)
└── README.md
```
