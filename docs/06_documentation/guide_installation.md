# Guide d'installation technique — GameConnect

## Prérequis

| Logiciel | Version | Lien |
|---|---|---|
| Python | 3.10+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| MySQL | 8.0 | https://mysql.com ou XAMPP |
| Git | 2.30+ | https://git-scm.com |

---

## Étape 1 — Récupérer le code source

```bash
git clone https://github.com/R1Sobriquet/Esportapp.git
cd Esportapp
```

---

## Étape 2 — Configurer la base de données

### Linux / macOS

```bash
mysql -u root -p < localsetup/schema/00_schema_complet.sql
mysql -u root -p esport_social < localsetup/schema/01_donnees_jeux.sql
```

### Windows (XAMPP)

1. Ouvrir XAMPP Control Panel → Démarrer **Apache** et **MySQL**
2. Ouvrir un invité de commande :
```cmd
E:\XAMPP\mysql\bin\mysql.exe -u root -p < localsetup\schema\00_schema_complet.sql
E:\XAMPP\mysql\bin\mysql.exe -u root -p esport_social < localsetup\schema\01_donnees_jeux.sql
```

### Via phpMyAdmin

1. Aller sur `http://localhost/phpmyadmin`
2. Créer la base `esport_social` (charset: utf8mb4, collation: utf8mb4_unicode_ci)
3. Onglet **Import** → sélectionner `00_schema_complet.sql` → Exécuter
4. Même manipulation avec `01_donnees_jeux.sql`

---

## Étape 3 — Configurer et démarrer le backend

### Installation des dépendances Python

```bash
cd API

# Linux / macOS
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
```

### Fichier de configuration

Créer le fichier `API/.env` :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=esport_social
```

> Si votre MySQL a un mot de passe root, renseignez `DB_PASS=votre_mot_de_passe`

### Démarrage

```bash
uvicorn app.main:app --reload --port 8000
```

**Vérification** : Ouvrir `http://localhost:8000/docs` → Swagger UI doit s'afficher.

---

## Étape 4 — Configurer et démarrer le frontend

```bash
cd ../frontend
npm install
npm run dev
```

**Vérification** : Ouvrir `http://localhost:5173` → La page d'accueil GameConnect doit s'afficher.

---

## Étape 5 — (Optionnel) Ajouter des données de test

```bash
mysql -u root -p esport_social < localsetup/seeds/02_utilisateurs_test.sql
```

Comptes disponibles (mot de passe : `password123`) :

| Email | Pseudo | Profil |
|---|---|---|
| `alice@test.com` | AliceShooter | Europe / Expert / Valorant |
| `bob@test.com` | BobTheGamer | NA / Intermédiaire / Rocket League |
| `charlie@test.com` | CharlieCarry | Asie / Expert / LoL |
| `diana@test.com` | DianaAim | Europe / Avancé / Valorant |

Alice et Bob ont un **match accepté** → ils peuvent s'envoyer des messages.

---

## Résolution des problèmes courants

### Le backend ne démarre pas

```
Error: Can't connect to MySQL server
```
→ Vérifier que MySQL est démarré (XAMPP Control Panel ou `sudo service mysql start`)

```
ModuleNotFoundError: No module named 'MySQLdb'
```
→ Sur Ubuntu : `sudo apt-get install python3-dev default-libmysqlclient-dev` puis `pip install mysqlclient`  
→ Sur Windows : utiliser `pip install mysqlclient --find-links https://www.lfd.uci.edu/~gohlke/pythonlibs/`

### Le frontend ne peut pas joindre l'API (erreur CORS)

→ Vérifier que le backend tourne sur le port 8000  
→ Vérifier que l'URL dans `frontend/src/services/config.js` est `http://localhost:8000`

### Erreur 401 sur toutes les requêtes

→ Le token JWT a expiré ou localStorage est corrompu. Effacer le localStorage dans les DevTools navigateur → F12 → Application → Storage → Clear All.

### Erreur `npm install` échoue

→ Vérifier la version Node.js : `node --version` (doit être ≥ 18)  
→ Sur Windows, utiliser PowerShell en mode Administrateur

### Les tests Jest échouent

```bash
cd frontend
npm test -- --clearCache   # Vider le cache Jest
npm install                # Réinstaller les dépendances
npm test
```
