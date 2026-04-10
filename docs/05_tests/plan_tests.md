# Plan de tests — GameConnect

## 1. Stratégie de tests

| Type | Outil | Périmètre | Nb tests |
|---|---|---|---|
| **Tests unitaires** | Jest 30 + @testing-library/react | Composants React, contextes, services | 89 tests |
| **Tests d'intégration API** | Swagger UI / curl | Endpoints FastAPI | Manuel |
| **Tests E2E** | Non implémenté (prévu v3.0) | Cypress | — |

### Environnement de test

- **Environnement simulé** : `jest-environment-jsdom` (simule le DOM navigateur)
- **Transformation ESM→CJS** : `babel-jest` avec `@babel/preset-env` (modules: commonjs) — requis car Vite utilise ESM, incompatible avec Jest natif
- **Mocks** : `jest.fn()` pour isoler les services API, les contextes et react-router
- **Timers simulés** : `jest.useFakeTimers()` pour les composants avec animations (Toast)
- **Limitations jsdom** : `scrollIntoView` et `window.matchMedia` non supportés — ajout de mocks dans `beforeAll`

---

## 2. Fichiers de test

| Fichier | Composant testé | Nb tests |
|---|---|---|
| `Avatar.test.jsx` | `<Avatar />` | 11 |
| `FormInput.test.jsx` | `<FormInput />` | 26 |
| `Toast.test.jsx` | `<Toast />` + `<ToastContainer />` | 13 |
| `AuthContext.test.jsx` | `AuthContext` | 13 |
| `ThemeContext.test.jsx` | `ThemeContext` | 11 |
| `Messages.test.jsx` | `<Messages />` page | 14 |
| **Total** | **6 suites** | **89** |

---

## 3. Cas de test — Avatar

| # | Test | Assertion |
|---|---|---|
| A01 | Rendu sans props | L'image est présente dans le DOM |
| A02 | `src` fourni | L'attribut `src` est utilisé |
| A03 | Sans `src` | Fallback vers `ui-avatars.com` |
| A04 | Sans `username` | Alt text = "User" |
| A05 | Alt text avec username | Alt text = username |
| A06 | `onError` déclenché | Fallback activé si image cassée |
| A07 | Taille par défaut | `style` contient `width: 40px` |
| A08 | Taille personnalisée | `style` contient la valeur `size` |
| A09 | Caractères spéciaux dans username | URL encodée correctement |
| A10 | Classe CSS custom | Classe transmise au composant |
| A11 | Rendu avec src null | Fallback automatique |

---

## 4. Cas de test — FormInput

| # | Groupe | Test | Assertion |
|---|---|---|---|
| F01-F07 | Rendu | Label, required *, textarea, disabled, hint | Attributs HTML corrects |
| F08 | Validation | Pas d'erreur avant blur | Aucun message d'erreur visible |
| F09-F10 | Règle `required` | Champ vide → erreur | `"Ce champ est requis"` |
| F11-F12 | Règle `email` | Email valide/invalide | Validation RFC |
| F13-F16 | Règle `password` | < 8 chars, sans chiffre, sans lettre | Messages d'erreur spécifiques |
| F17-F18 | Règle `minLength` | Valeur < min | Erreur avec longueur requise |
| F19-F20 | Règle `maxLength` | Valeur > max | Erreur avec longueur max |
| F21-F22 | Règle `match` | Correspondance avec autre champ | Validation croisée |
| F23-F24 | Règle `url` | URL valide/invalide | http/https requis |
| F25-F26 | Callback | `onValidationChange` déclenché | Callback appelé avec status |

---

## 5. Cas de test — Toast

| # | Test | Assertion |
|---|---|---|
| T01 | Message affiché | Texte visible dans le DOM |
| T02 | Type `success` | Icône ✓ présente |
| T03 | Type `error` | Icône ✕ présente |
| T04 | Type `info` | Icône ℹ présente |
| T05 | Type `warning` | Icône ⚠ présente |
| T06 | Type inconnu | Style par défaut appliqué |
| T07 | Visibilité initiale | opacity-100 |
| T08 | Auto-fermeture | `onClose` appelé après `duration + 300ms` |
| T09 | Transition | opacity-0 avant fermeture |
| T10 | Bouton fermeture | `fireEvent.click` → `onClose` appelé |
| T11 | Multiple toasts | Tous rendus dans ToastContainer |
| T12 | removeToast | Callback appelé avec le bon `id` |
| T13 | Container vide | Rendu sans erreur |

---

## 6. Cas de test — AuthContext

| # | Test | Assertion |
|---|---|---|
| AC01 | `user` = null par défaut | `user` est `null` au montage |
| AC02 | Restauration depuis localStorage | `user` chargé si token présent |
| AC03 | État `loading` | `loading: true` puis `false` |
| AC04 | Login réussi | `user` mis à jour, token en localStorage |
| AC05 | Login échoué (401) | `{success: false, error: "..."}` |
| AC06 | Login — message detail | Retourne `detail` de la réponse API |
| AC07 | Register réussi | Compte créé, token stocké |
| AC08 | Register échoué | `{success: false, error: "..."}` |
| AC09 | Logout | `user = null`, localStorage vidé |
| AC10 | `updateUser` | Met à jour state et localStorage |
| AC11 | `updateUser` partiel | Merge avec les données existantes |
| AC12 | useAuth hors Provider | `Error` levée |

---

## 7. Cas de test — ThemeContext

| # | Test | Assertion |
|---|---|---|
| TH01 | Thème sombre par défaut | `theme === 'dark'` si `prefers-color-scheme: dark` |
| TH02 | Thème clair par défaut | `theme === 'light'` si `prefers-color-scheme: light` |
| TH03 | Restauration localStorage | Thème persisté respecté |
| TH04 | `toggleTheme` dark→light | `theme === 'light'` |
| TH05 | `toggleTheme` light→dark | `theme === 'dark'` |
| TH06 | Classe CSS `dark` | `document.documentElement.classList` |
| TH07 | Classe CSS `light` | Classe `dark` absente |
| TH08 | `isDark` | `true` en mode sombre |
| TH09 | `isLight` | `true` en mode clair |
| TH10 | `setDarkTheme` | Force le thème sombre |
| TH11 | useTheme hors Provider | `Error` levée |

---

## 8. Cas de test — Messages (module messaging)

| # | Groupe | Test | Assertion |
|---|---|---|---|
| M01 | Envoi | `sendMessage` appelé avec bons params | `messagesAPI.sendMessage(2, 'Hello Bob')` |
| M02 | Envoi | Bouton désactivé si input vide | `button[type=submit]` disabled |
| M03 | Envoi | Mise à jour optimiste | Texte visible avant résolution API |
| M04 | Conversations | `getConversations` au montage | Appelé 1 fois |
| M05 | Conversations | Données affichées | Username, last_message, badge unread |
| M06 | Conversations | Plusieurs conversations rendues | Tous les usernames visibles |
| M07 | Conversations | État vide | "Pas encore de conversations" |
| M08 | Conversations | Clic → chargement messages | `getMessages(userId)` appelé |
| M09 | Conversations | Ordre chronologique | Ordre correct des bulles |
| M10 | Conversations | Alignement own/other | `justify-end` / `justify-start` |
| M11 | Conversations | Conv. vide | "Envoie ton premier message !" |
| M12 | Soft-delete | `deleteMessage` API | Appelé avec le bon `id` |
| M13 | Soft-delete | Message absent après refresh | Filtre `deleted_at IS NULL` |
| M14 | Soft-delete | `last_message` mis à jour | Reflète le dernier message actif |

---

## 9. Critères d'acceptation

- Tous les tests doivent passer sans avertissement
- Aucun test ne doit dépasser 5 secondes (timeout Jest)
- Les mocks doivent isoler complètement les appels API
- Les tests de composants React doivent utiliser `@testing-library/react` (pas de test d'implémentation interne)
