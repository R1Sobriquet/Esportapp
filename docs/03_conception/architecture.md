# Architecture applicative — GameConnect

## 1. Architecture générale (3-tiers)

```mermaid
flowchart TD
    subgraph Client ["🌐 Client (Navigateur)"]
        React["React 18 + Vite 5\nPort 5173"]
        Tailwind["Tailwind CSS 3.4"]
        Axios["Axios (HTTP Client)"]
        localStorage["localStorage\n(Token JWT + User)"]
        React --> Tailwind
        React --> Axios
        React --> localStorage
    end

    subgraph API ["⚙️ API (FastAPI)"]
        Uvicorn["Uvicorn ASGI\nPort 8000"]
        Router["8 Routeurs\n/auth /profile /games\n/matches /messages\n/notifications /search /stats"]
        Pydantic["Pydantic v2\n(Validation + Sérialisation)"]
        PyJWT["PyJWT (HS256)\n7 jours d'expiration"]
        Bcrypt["bcrypt\n(Hash mots de passe)"]
        CORS["CORSMiddleware\nlocalhost:5173"]
        Activity["ActivityMiddleware\n(Audit trail)"]

        Uvicorn --> Router
        Router --> Pydantic
        Router --> PyJWT
        Router --> Bcrypt
        Uvicorn --> CORS
        Uvicorn --> Activity
    end

    subgraph DB ["🗄️ Base de données (MySQL 8)"]
        MySQL["MySQL 8.0\nesport_social"]
        Tables["9 tables\nusers, user_profiles, games\nuser_games, user_preferences\nmatches, messages\nnotifications, user_activity_logs"]
        MySQL --> Tables
    end

    Axios -->|"HTTP/REST\nAuthorization: Bearer"| Uvicorn
    Router -->|"MySQLdb\nRequêtes paramétrées"| MySQL
```

---

## 2. Pattern architectural côté API (inspiré MVC)

```mermaid
flowchart LR
    subgraph Requete ["HTTP Request"]
        R["POST /messages\n{receiver_id, content}"]
    end

    subgraph Middleware ["Middleware"]
        CORS2["CORS\nCheck"]
        Auth["JWT\nDecode"]
        Activity2["Activity\nLog"]
    end

    subgraph Controller ["Contrôleur (routes/)"]
        Route["send_message()\nmessages.py"]
    end

    subgraph Model ["Modèle (models.py)"]
        Schema["Message\nPydantic Schema"]
    end

    subgraph DAO ["Accès données (database.py)"]
        DB2["get_cursor()\nSQL paramétré"]
    end

    subgraph Response ["HTTP Response"]
        Rep["200 {success:true\nmessage:{...}}"]
    end

    R --> CORS2 --> Auth --> Activity2 --> Route
    Route --> Schema
    Route --> DB2
    DB2 --> Rep
```

---

## 3. Hiérarchie des providers React

```mermaid
flowchart TD
    ThemeP["ThemeProvider\n(dark/light, localStorage)"]
    AuthP["AuthProvider\n(user, token, login/logout)"]
    ToastP["ToastProvider\n(notifications UI)"]
    Router["BrowserRouter"]
    Nav["Navigation.jsx\n(SearchBar, NotificationBell)"]
    Routes["Routes\n/ /login /register /profile\n/games /matching /messages /forum"]
    Footer["Footer.jsx"]

    ThemeP --> AuthP --> ToastP --> Router
    Router --> Nav
    Router --> Routes
    Router --> Footer
```

---

## 4. Flux d'authentification JWT

```mermaid
flowchart TD
    Login["POST /login\n{email, password}"]
    Hash["bcrypt.checkpw\n(password, hash)"]
    JWT["jwt.encode\n{user_id, exp: +7j}"]
    Store["localStorage\n.setItem('token', jwt)"]
    Request["Requête authentifiée\nAuthorization: Bearer TOKEN"]
    Decode["jwt.decode\n(token, secret, HS256)"]
    User["current_user = user_id"]

    Login --> Hash
    Hash -->|"OK"| JWT --> Store
    Store --> Request --> Decode --> User

    Hash -->|"Échec"| Error["401 Unauthorized"]
    Decode -->|"Expiré/Invalide"| Error401["401 → logout + redirect /login\n(intercepteur Axios)"]
```

---

## 5. Pattern API REST

| Ressource | GET | POST | PUT | DELETE |
|---|---|---|---|---|
| `/messages` | Liste conversations | Envoyer un message | — | — |
| `/messages/{id}` | Fil de messages | — | — | Soft-delete |
| `/user/games` | Mes jeux | Ajouter un jeu | — | — |
| `/user/games/{id}` | — | — | Modifier un jeu | Supprimer un jeu |
| `/matches` | Mes matchs | Trouver des matchs | — | — |
| `/matches/{id}/accept` | — | Accepter | — | — |
| `/notifications` | Mes notifications | — | — | Supprimer tout |
| `/notifications/{id}` | — | — | — | Supprimer |

**Codes HTTP utilisés** :
- `200 OK` — Succès général
- `201 Created` — Ressource créée (ajout de jeu)
- `400 Bad Request` — Données invalides
- `401 Unauthorized` — Token manquant ou expiré
- `403 Forbidden` — Action non autorisée (ex: message sans match)
- `404 Not Found` — Ressource introuvable
- `409 Conflict` — Doublon (email, jeu déjà ajouté)

---

## 6. Gestion de l'état frontend

```mermaid
flowchart LR
    subgraph Global ["État global (Context API)"]
        AuthState["AuthContext\nuser, loading\nlogin() logout() updateUser()"]
        ThemeState["ThemeContext\ntheme, isDark\ntoggleTheme()"]
        ToastState["ToastContext\ntoasts[]\nsuccess() error() info()"]
    end

    subgraph Local ["État local (useState)"]
        FormState["Formulaires\nformData, error, loading"]
        UIState["UI\nshowSidebar, activeTab\nselectedConversation"]
        DataState["Données\nmessages[], conversations[]\nmatches[], games[]"]
    end

    subgraph Persist ["Persistance (localStorage)"]
        Token["token"]
        UserLS["user"]
        ThemeLS["theme"]
    end

    AuthState <--> Token
    AuthState <--> UserLS
    ThemeState <--> ThemeLS
```
