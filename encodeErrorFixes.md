# Si les tests d'API renvoient "module 'jwt' has no attribute 'encode'", voici la solution

### Le Problème Principal : **Mauvais emplacement du venv**

Vous avez **2 problèmes combinés** :

```
E:\XAMPP\htdocs\CodeSLAM\EsportappAPI\Esportapp\
├── venv/                          ← ANCIEN venv ici (MAUVAIS EMPLACEMENT)
└── api/
    ├── main.py                    ← Votre code ici
    ├── test_api.py
    └── .env
```

**Problème** : Quand vous lancez l'API depuis `Esportapp/api/`, elle n'utilise pas le bon venv !

---

## La Solution 

### ✅ Étape 1 : Aller dans le bon dossier
```powershell
cd api  # ← CRUCIAL !
```

### ✅ Étape 2 : Créer un nouveau venv propre DANS le dossier `api/`
```powershell
python -m venv venv
.\venv\Scripts\Activate
```

**Résultat** : Structure correcte
```
E:\XAMPP\htdocs\CodeSLAM\EsportappAPI\Esportapp\api\
├── venv/                          ← NOUVEAU venv (BON EMPLACEMENT)
├── main.py
├── test_api.py
└── .env
```

### ✅ Étape 3 : Installer PyJWT 2.8.0 (la bonne version)
```powershell
pip install --no-cache-dir PyJWT==2.8.0
```

**Note** : PyJWT 2.10.1 fonctionne aussi, mais 2.8.0 est stable et testé.

### ✅ Étape 4 : Installer les autres dépendances
```powershell
pip install requests  # Pour test_api.py
```

---

## Pourquoi ça ne marchait pas avant ?

### Problème 1 : Conflit de venv
- L'ancien venv dans `Esportapp/` avait peut-être le mauvais package `jwt` (obsolète)
- Quand vous lanciez l'API, Python cherchait les modules dans le mauvais venv

### Problème 2 : Cache corrompu
- Même après réinstallation de PyJWT, le cache Python gardait l'ancien module

---

## Ce que vous avez fait qui a résolu le problème

1. ✅ **Changé de dossier** : `cd api` (clé du succès)
2. ✅ **Créé un venv PROPRE** dans le bon dossier
3. ✅ **Installé PyJWT 2.8.0** sans cache (`--no-cache-dir`)
4. ✅ **Supprimé les fichiers .pyc** (cache Python)

---

## Résumé Simple

**Le vrai problème** : Vous aviez le venv au mauvais endroit.

**La vraie solution** : Créer un nouveau venv dans le dossier `api/` où se trouve `main.py`.

---

## Pour vérifier que tout est bien configuré

```powershell
cd E:\XAMPP\htdocs\CodeSLAM\EsportappAPI\Esportapp\api
.\venv\Scripts\Activate
python -c "import jwt; print('JWT Version:', jwt.__version__)"
# Devrait afficher : JWT Version: 2.8.0

python -c "import sys; print('Python:', sys.executable)"
# Devrait afficher le chemin vers api\venv\Scripts\python.exe
```

