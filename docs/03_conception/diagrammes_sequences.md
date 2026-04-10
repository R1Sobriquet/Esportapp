# Diagrammes de séquence — GameConnect

## Séquence 1 : Inscription d'un nouvel utilisateur

```mermaid
sequenceDiagram
    actor Utilisateur
    participant Register as Register.jsx
    participant AuthCtx as AuthContext
    participant API as FastAPI /register
    participant DB as MySQL

    Utilisateur->>Register: Remplit le formulaire (email, username, password, profil)
    Register->>Register: Validation côté client (FormInput)
    Register->>AuthCtx: register(userData)
    AuthCtx->>API: POST /register {email, username, password, profile}

    API->>API: Valider avec Pydantic (email, username, password)
    API->>DB: SELECT email WHERE email = ?
    DB-->>API: Résultat (vide = email disponible)

    alt Email déjà utilisé
        API-->>AuthCtx: 409 Conflict {detail: "Email already registered"}
        AuthCtx-->>Register: {success: false, error: "..."}
        Register-->>Utilisateur: Affiche message d'erreur
    else Données valides
        API->>API: bcrypt.hashpw(password)
        API->>DB: INSERT INTO users (email, username, password_hash...)
        DB-->>API: user_id = LAST_INSERT_ID()
        API->>DB: INSERT INTO user_profiles (user_id, region, bio...)
        API->>API: jwt.encode({user_id, exp: +7j})
        API-->>AuthCtx: 200 {success: true, token, user}
        AuthCtx->>AuthCtx: localStorage.setItem('token', token)
        AuthCtx->>AuthCtx: localStorage.setItem('user', user)
        AuthCtx-->>Register: {success: true}
        Register->>Register: navigate('/')
        Register-->>Utilisateur: Redirigé vers l'accueil
    end
```

---

## Séquence 2 : Envoi d'un message (avec mise à jour optimiste)

```mermaid
sequenceDiagram
    actor Alice
    participant MsgPage as Messages.jsx
    participant API as FastAPI /messages
    participant DB as MySQL

    Alice->>MsgPage: Saisit "Hey !" et clique Envoyer
    MsgPage->>MsgPage: Crée message optimiste {id: Date.now(), content: "Hey !", pending: true}
    MsgPage->>MsgPage: setMessages([...messages, optimisticMsg])
    MsgPage-->>Alice: Message "Hey !" visible immédiatement (bulle grisée)

    MsgPage->>API: POST /messages {receiver_id: Bob_id, content: "Hey !"}
    API->>API: Vérifier token JWT → user = Alice

    API->>DB: SELECT id FROM matches WHERE (user1_id=Alice AND user2_id=Bob AND status='accepted') OR (...)
    DB-->>API: match trouvé

    API->>DB: INSERT INTO messages (sender_id, receiver_id, content, is_read, deleted_at)
    DB-->>API: message_id = 42
    API-->>MsgPage: 200 {success: true, message: {id:42, sender_id:1, content:"Hey !", ...}}

    MsgPage->>MsgPage: Remplace message optimiste par le vrai message (id: 42)
    MsgPage-->>Alice: Bulle confirmée (sans indicateur pending)

    alt Erreur réseau ou 403
        API-->>MsgPage: 403 ou erreur réseau
        MsgPage->>MsgPage: setMessages(messages.filter(m => m.id !== tempId))
        MsgPage-->>Alice: Message retiré + toast d'erreur
    end
```

---

## Séquence 3 : Suppression logique d'un message (soft-delete)

```mermaid
sequenceDiagram
    actor Alice
    participant MsgPage as Messages.jsx
    participant API as FastAPI DELETE /messages/{id}
    participant DB as MySQL

    Alice->>MsgPage: Survole son message → icône 🗑 apparaît
    Alice->>MsgPage: Clique sur 🗑 (message id=42)
    MsgPage->>API: DELETE /messages/42
    API->>API: Vérifier token JWT → user = Alice

    API->>DB: SELECT id, sender_id, receiver_id, deleted_at FROM messages WHERE id = 42
    DB-->>API: {id:42, sender_id:1, receiver_id:2, deleted_at: NULL}

    alt Message déjà supprimé
        API-->>MsgPage: 404 {detail: "Message not found or already deleted"}
        MsgPage-->>Alice: Toast erreur
    else Utilisateur non autorisé
        API-->>MsgPage: 403 {detail: "Not authorized"}
        MsgPage-->>Alice: Toast erreur
    else Suppression autorisée
        API->>DB: UPDATE messages SET deleted_at = NOW() WHERE id = 42
        DB-->>API: 1 row affected
        API-->>MsgPage: 200 {success: true, message: "Message deleted"}
        MsgPage->>MsgPage: setMessages(messages.filter(m => m.id !== 42))
        MsgPage->>MsgPage: loadConversations() — rafraîchit last_message
        MsgPage-->>Alice: Message disparu de l'interface
    end

    note over DB: Le message reste physiquement en base<br/>deleted_at IS NOT NULL → filtré dans tous les SELECT
```

---

## Séquence 4 : Algorithme de matching

```mermaid
sequenceDiagram
    actor Joueur
    participant MatchPage as Matching.jsx
    participant API as FastAPI POST /matches
    participant DB as MySQL

    Joueur->>MatchPage: Clique "Trouver des partenaires"
    MatchPage->>API: POST /matches?limit=10
    API->>API: Vérifier token JWT → current_user

    API->>DB: SELECT * FROM user_games WHERE user_id = current_user
    DB-->>API: Liste des jeux du joueur courant

    API->>DB: SELECT DISTINCT u.id FROM users u<br/>JOIN user_games ug ON u.id = ug.user_id<br/>WHERE u.id != current_user<br/>AND u.id NOT IN (matchs existants)
    DB-->>API: Liste des joueurs candidats

    loop Pour chaque joueur candidat
        API->>DB: SELECT * FROM user_profiles WHERE user_id = candidat
        API->>DB: SELECT * FROM user_games WHERE user_id = candidat
        API->>DB: SELECT * FROM user_preferences WHERE user_id = candidat
        DB-->>API: Données du candidat

        API->>API: Calcul score :
        note right of API: Jeux communs × 30 pts (max 60)<br/>Compatibilité niveaux (max 30)<br/>Niveau global (max 20)<br/>Même région : +15<br/>Timezone ±2h (max 10)<br/>Mode de jeu (max 15)

        API->>DB: INSERT OR IGNORE INTO matches<br/>(user1_id, user2_id, match_score, status='pending')
        DB-->>API: Match enregistré
    end

    API->>DB: SELECT m.*, u.username, up.* FROM matches m<br/>JOIN users u JOIN user_profiles up<br/>WHERE (user1_id=current OR user2_id=current)<br/>AND status='pending'<br/>ORDER BY match_score DESC LIMIT 10
    DB-->>API: 10 meilleurs matchs

    API-->>MatchPage: 200 {matches: [...]}
    MatchPage-->>Joueur: Affiche les profils triés par score de compatibilité
```
