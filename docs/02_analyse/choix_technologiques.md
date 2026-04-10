# Justification des choix technologiques — GameConnect

## 1. Backend : FastAPI (Python)

| Critère | FastAPI | Django | Flask | Node.js/Express |
|---|---|---|---|---|
| Performance | ⭐⭐⭐⭐⭐ (async natif) | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Validation automatique | ⭐⭐⭐⭐⭐ (Pydantic) | ⭐⭐⭐ | ⭐ | ⭐⭐ |
| Documentation auto | ⭐⭐⭐⭐⭐ (Swagger/OpenAPI) | ⭐⭐ | ⭐ | ⭐⭐ |
| Courbe d'apprentissage | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Typage fort | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐ (TypeScript) |

**Choix retenu : FastAPI**  
Raisons : validation des données intégrée via Pydantic, génération automatique de la doc Swagger, performances asynchrones adaptées aux I/O multiples (DB, auth), et syntaxe Python familière dans le contexte BTS.

---

## 2. Frontend : React 18

| Critère | React | Vue 3 | Angular |
|---|---|---|---|
| Écosystème | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Popularité / Emploi | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Flexibilité | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Courbe d'apprentissage | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Context API / State | ⭐⭐⭐⭐ | ⭐⭐⭐ (Pinia) | ⭐⭐⭐⭐ (NgRx) |

**Choix retenu : React 18**  
Raisons : hooks modernes (`useState`, `useEffect`, `useContext`), gestion d'état globale via Context API sans dépendance externe (Redux/Zustand), large écosystème (React Router, RTL), et référence incontournable dans l'industrie.

---

## 3. Base de données : MySQL 8.0

| Critère | MySQL 8 | PostgreSQL | MongoDB |
|---|---|---|---|
| Données relationnelles | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Support JSON | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Transactions ACID | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Intégration XAMPP | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| Connaissance étudiante | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

**Choix retenu : MySQL 8.0**  
Raisons : données très structurées (utilisateurs, jeux, matchs) nécessitant des contraintes d'intégrité (FK, UNIQUE), intégration XAMPP native pour le développement local Windows, et maîtrise du SQL par les étudiants BTS. Le support JSON natif (MySQL 8) est utilisé pour le champ `data` des notifications.

---

## 4. Authentification : JWT

| Critère | JWT | Sessions serveur | OAuth2 seul |
|---|---|---|---|
| Stateless | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| Scalabilité | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Implémentation | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Révocation | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Adapté API REST | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

**Choix retenu : JWT (HS256)**  
Raisons : architecture REST stateless, pas de session côté serveur, facile à inclure dans le header `Authorization: Bearer`, bien supporté par PyJWT et Axios. L'expiration à 7 jours et la persistance dans localStorage offrent un bon compromis UX/sécurité.

---

## 5. CSS : Tailwind CSS 3

| Critère | Tailwind CSS | Bootstrap 5 | Styled-Components |
|---|---|---|---|
| Personnalisation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Bundle size | ⭐⭐⭐⭐⭐ (purge CSS) | ⭐⭐⭐ | ⭐⭐⭐ |
| Dark mode | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Courbe d'apprentissage | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Design gaming unique | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

**Choix retenu : Tailwind CSS 3.4**  
Raisons : palette de couleurs et animations entièrement personnalisées (thème rouge/bordeaux gaming), classes utilitaires permettant un développement rapide, dark mode natif par classe (`dark:`), et bundle minimal grâce au tree-shaking automatique.

---

## 6. Tests : Jest + React Testing Library

| Critère | Jest + RTL | Cypress | Vitest |
|---|---|---|---|
| Tests unitaires | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Tests E2E | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Vitesse d'exécution | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Mocking | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Compatibilité BTS | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

**Choix retenu : Jest 30 + @testing-library/react 16**  
Raisons : standard de l'industrie pour les tests unitaires React, API intuitive (`render`, `screen`, `fireEvent`), isolation complète via mocks, et support natif des timers simulés (`jest.useFakeTimers`) pour les composants avec animations.

> **Note technique** : Vite utilise les ES Modules (ESM), incompatibles avec Jest. La solution retenue est `babel-jest` avec `@babel/preset-env` (modules: commonjs) et des fichiers de configuration en `.cjs`.
