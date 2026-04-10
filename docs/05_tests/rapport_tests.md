# Rapport de tests — GameConnect

## 1. Résultat global

```
Test Suites: 6 passed, 6 total
Tests:       89 passed, 89 total
Snapshots:   0 total
Time:        ~4.6 s
```

**Statut** : ✅ Tous les tests passent  
**Commande** : `cd frontend && npm test`

---

## 2. Résultats par suite

```
 PASS  src/__tests__/Avatar.test.jsx
   Avatar Component
     ✓ renders without crashing (47 ms)
     ✓ renders with custom src (12 ms)
     ✓ shows fallback to ui-avatars when no src (8 ms)
     ✓ uses User as alt text when no username (6 ms)
     ✓ uses username as alt text (5 ms)
     ✓ handles image error (9 ms)
     ✓ applies default size (7 ms)
     ✓ applies custom size (6 ms)
     ✓ encodes special characters in username (8 ms)
     ✓ applies custom className (6 ms)
     ✓ renders with null src (5 ms)

 PASS  src/__tests__/FormInput.test.jsx
   FormInput Component
     Rendering
       ✓ renders with label (34 ms)
       ✓ shows required indicator ... (8 ms)
       ✓ renders textarea mode (9 ms)
       ✓ applies disabled state (7 ms)
       ✓ shows hint text (6 ms)
       ✓ shows character counter (7 ms)
       ✓ applies custom className (5 ms)
     Validation - No Error Before Blur
       ✓ does not show error before blur (6 ms)
     Required Rule
       ✓ shows error for empty required field (12 ms)
       ✓ does not show error for filled field (7 ms)
     Email Rule
       ✓ validates correct email (9 ms)
       ✓ shows error for invalid email (8 ms)
     Password Rule
       ✓ shows error for short password (7 ms)
       ✓ shows error without number (6 ms)
       ✓ shows error without letter (6 ms)
       ✓ validates correct password (8 ms)
     MinLength Rule
       ✓ shows error below minLength (6 ms)
       ✓ passes at minLength (5 ms)
     MaxLength Rule
       ✓ shows error above maxLength (6 ms)
       ✓ passes at maxLength (5 ms)
     Match Rule
       ✓ shows error when values don't match (7 ms)
       ✓ passes when values match (6 ms)
     URL Rule
       ✓ validates correct URL (5 ms)
       ✓ shows error for invalid URL (5 ms)
     OnValidationChange Callback
       ✓ calls onValidationChange when invalid (8 ms)
       ✓ calls onValidationChange when valid (7 ms)

 PASS  src/__tests__/Toast.test.jsx
   Toast Component
     ✓ renders message (31 ms)
     ✓ renders success icon (9 ms)
     ✓ renders error icon (8 ms)
     ✓ renders info icon (7 ms)
     ✓ renders warning icon (6 ms)
     ✓ applies default style for unknown type (6 ms)
     ✓ shows initial visibility (6 ms)
     ✓ calls onClose after duration + transition (14 ms)
     ✓ transitions to opacity-0 (8 ms)
     ✓ calls onClose when close button clicked (9 ms)
   ToastContainer
     ✓ renders multiple toasts (12 ms)
     ✓ calls removeToast with correct id (9 ms)
     ✓ renders empty container (5 ms)

 PASS  src/__tests__/AuthContext.test.jsx
   AuthContext
     ✓ provides null user by default (41 ms)
     ✓ restores user from localStorage (15 ms)
     ✓ sets loading state correctly (12 ms)
     ✓ login success (24 ms)
     ✓ login failure (18 ms)
     ✓ login returns detail message (14 ms)
     ✓ register success (22 ms)
     ✓ register failure (16 ms)
     ✓ logout clears state and localStorage (11 ms)
     ✓ updateUser updates state (9 ms)
     ✓ updateUser merges with existing data (10 ms)
     ✓ useAuth throws outside provider (8 ms)
     ✓ loading is false after initialization (11 ms)

 PASS  src/__tests__/ThemeContext.test.jsx
   ThemeContext
     ✓ defaults to dark theme (prefers-color-scheme: dark) (38 ms)
     ✓ defaults to light theme (prefers-color-scheme: light) (12 ms)
     ✓ restores theme from localStorage (10 ms)
     ✓ toggleTheme switches dark to light (9 ms)
     ✓ toggleTheme switches light to dark (8 ms)
     ✓ applies dark class to documentElement (9 ms)
     ✓ removes dark class for light theme (7 ms)
     ✓ isDark is true in dark mode (6 ms)
     ✓ isLight is true in light mode (6 ms)
     ✓ setDarkTheme forces dark (7 ms)
     ✓ useTheme throws outside provider (6 ms)

 PASS  src/__tests__/Messages.test.jsx
   Groupe 1 — Envoi de messages
     ✓ 1.1 — sendMessage appelle l'API avec les bons paramètres (156 ms)
     ✓ 1.2 — Le bouton envoyer est désactivé quand l'input est vide (89 ms)
     ✓ 1.3 — La mise à jour optimiste affiche le message immédiatement (102 ms)
   Groupe 2 — Récupération des conversations et informations
     ✓ 2.1 — getConversations est appelé au montage du composant (67 ms)
     ✓ 2.2 — Les données des conversations s'affichent (78 ms)
     ✓ 2.3 — Plusieurs conversations sont toutes rendues (71 ms)
     ✓ 2.4 — L'état vide s'affiche quand il n'y a aucune conversation (64 ms)
     ✓ 2.5 — Cliquer sur une conversation déclenche le chargement (82 ms)
     ✓ 2.6 — Les messages s'affichent dans l'ordre chronologique (91 ms)
     ✓ 2.7 — Mes messages ont justify-end, les reçus ont justify-start (94 ms)
     ✓ 2.8 — Une conversation vide affiche le texte d'accueil (73 ms)
   Groupe 3 — Suppression logique des messages (soft-delete)
     ✓ 3.1 — deleteMessage appelle le bon endpoint API (18 ms)
     ✓ 3.2 — Les messages supprimés ne s'affichent plus après rafraîchissement (87 ms)
     ✓ 3.3 — La liste des conversations reflète le dernier message non supprimé (71 ms)
```

---

## 3. Configuration de l'environnement de test

### Fichiers de configuration

**`jest.config.cjs`** :
```js
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|ico|webp)$': '<rootDir>/__mocks__/fileMock.cjs',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/*.test.[jt]s?(x)'],
};
```

**`babel.config.cjs`** :
```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
```

### Mocks systèmes (dans les tests)

```js
// jsdom ne supporte pas scrollIntoView (Messages.jsx)
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

// jsdom ne supporte pas window.matchMedia (ThemeContext)
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});
```

---

## 4. Couverture des fonctionnalités

| Fonctionnalité | Testée | Méthode |
|---|---|---|
| Envoi de message | ✅ | Tests unitaires (M01-M03) |
| Mise à jour optimiste | ✅ | Test M03 (Promise suspendue) |
| Chargement conversations | ✅ | Tests M04-M08 |
| Ordre chronologique | ✅ | Test M09 |
| Alignement CSS own/other | ✅ | Test M10 |
| Soft-delete messages | ✅ | Tests M12-M14 |
| Authentification (login/register) | ✅ | Tests AC04-AC08 |
| Persistance JWT | ✅ | Tests AC02, AC09 |
| Thème dark/light | ✅ | Tests TH01-TH10 |
| Validation formulaires | ✅ | Tests F08-F26 |
| Composant Avatar | ✅ | Tests A01-A11 |
| Toast auto-close | ✅ | Test T08 (fake timers) |

---

## 5. Difficultés rencontrées et solutions

| Problème | Cause | Solution |
|---|---|---|
| Jest incompatible avec Vite/ESM | `package.json` → `"type": "module"` | `babel-jest` + `babel.config.cjs` + `jest.config.cjs` |
| `scrollIntoView` non disponible | jsdom ne l'implémente pas | `beforeAll(() => { window.HTMLElement.prototype.scrollIntoView = jest.fn(); })` |
| `window.matchMedia` non disponible | jsdom ne l'implémente pas | `Object.defineProperty(window, 'matchMedia', ...)` |
| Toast `userEvent.click` timeout | `userEvent` async + fake timers | Remplacé par `fireEvent.click` (synchrone) |
| `node_modules` dans git | `.gitignore` ignoré après commit initial | `git rm --cached -r frontend/node_modules/` |
