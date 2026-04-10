# Règles métier — GameConnect

## Tableau des règles métier

| ID | Domaine | Règle | Implémentation |
|---|---|---|---|
| RM01 | Auth | L'email doit être unique et valide (format RFC 5322) | `UNIQUE KEY` sur `users.email` + Pydantic `EmailStr` |
| RM02 | Auth | Le pseudo (username) doit être unique, 3-50 caractères, alphanumérique + underscores, ne peut pas commencer/terminer par `_` | `UNIQUE KEY` + validation regex FastAPI |
| RM03 | Auth | Le mot de passe doit contenir au minimum 8 caractères, dont au moins 1 lettre et 1 chiffre | Validation Pydantic côté backend |
| RM04 | Auth | Le token JWT expire après **7 jours** | `ACCESS_TOKEN_EXPIRE_DAYS = 7` dans `config.py` |
| RM05 | Profil | L'âge minimum est de **13 ans** (conformité COPPA) | Validation de `date_of_birth` dans `PUT /profile` |
| RM06 | Profil | La visibilité d'un profil est `public`, `friends` ou `private`. Les profils privés n'apparaissent pas dans la recherche. | `profile_visibility ENUM` + filtre dans `GET /search/players` |
| RM07 | Jeux | Un utilisateur ne peut avoir le même jeu en double dans son profil | `UNIQUE KEY unique_user_game (user_id, game_id)` |
| RM08 | Jeux | Les heures jouées sont comprises entre 0 et 100 000 | Validation Pydantic `hours_played: int = Field(ge=0, le=100000)` |
| RM09 | Matching | La paire (user1_id, user2_id) est unique (un seul match par duo) | `UNIQUE KEY unique_match (user1_id, user2_id)` |
| RM10 | Matching | **Algorithme de score** (0 à 150 points) : | Fonction Python dans `matches.py` |
| | | • Jeux en commun : **30 pts par jeu**, max 60 pts | |
| | | • Compatibilité de niveau sur les jeux communs : max **30 pts** | |
| | | • Niveau global similaire : max **20 pts** | |
| | | • Même région : **15 pts** | |
| | | • Même fuseau horaire (±2h) : max **10 pts** | |
| | | • Mode de jeu compatible : max **15 pts** | |
| RM11 | Matching | Un match peut avoir l'un des statuts : `pending`, `accepted`, `rejected`, `expired` | `status ENUM` dans la table `matches` |
| RM12 | Messagerie | Les messages privés ne sont autorisés qu'entre deux joueurs ayant un match avec status **`accepted`** | Vérification dans `POST /messages` et `GET /messages/{userId}` → erreur 403 sinon |
| RM13 | Messagerie | La suppression d'un message est **logique** (soft-delete) : le champ `deleted_at` est mis à `NOW()`. Le message reste en base. | `UPDATE messages SET deleted_at = NOW() WHERE id = %s` |
| RM14 | Messagerie | Les requêtes de lecture (liste conversations, fil de messages) filtrent `deleted_at IS NULL` | Clause `AND deleted_at IS NULL` dans toutes les requêtes `SELECT` |
| RM15 | Messagerie | Seul l'expéditeur ou le destinataire d'un message peut le supprimer | Vérification `sender_id = current_user OR receiver_id = current_user` avant soft-delete |
| RM16 | Messagerie | Le champ `last_message` d'une conversation reflète le dernier message **non supprimé** | Sous-requête avec `AND deleted_at IS NULL` dans `GET /messages` |
| RM17 | Notifications | Une notification peut être de type : `match_new`, `match_accepted`, `match_rejected`, `message_new`, `system`, `profile_view` | `type VARCHAR(50)` avec valeur par défaut `'system'` |
| RM18 | Profil | La bio est limitée à **1000 caractères** | `bio TEXT` + validation Pydantic `max_length=1000` |
| RM19 | Profil | Les URLs d'avatar/bannière doivent commencer par `http://` ou `https://`, max 500 caractères | Validation Pydantic custom validator |
| RM20 | Jeux | Les faveurs sont affichées en premier dans la liste des jeux du profil | `ORDER BY is_favorite DESC, name ASC` dans `GET /user/games` |
