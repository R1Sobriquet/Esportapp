#!/usr/bin/env python3
"""
Script de test pour l'API FastAPI E-Sport Social Platform
Usage: python test_api.py

Ce script automatise les tests de l'API pour vérifier que tous les endpoints
fonctionnent correctement. Il simule un utilisateur complet de l'application.
"""

import requests  # Pour effectuer les requêtes HTTP vers l'API
import json      # Pour manipuler les données JSON (bien que requests le fasse automatiquement)
import random    # Pour générer des données aléatoires (noms d'utilisateur, etc.)
import string    # Pour accéder aux caractères alphabétiques et numériques
import time      # Pour ajouter des délais entre les tests
from datetime import datetime  # Pour afficher les horodatages

# Configuration globale du script
API_URL = "http://localhost:8000"  # URL de base de l'API à tester
TEST_USER = None  # Variable globale pour stocker les infos de l'utilisateur de test
TOKEN = None      # Variable globale pour stocker le token d'authentification JWT

# Classe pour gérer les couleurs dans le terminal
# Intérêt : Améliore la lisibilité des résultats de test en console
class Colors:
    """Codes ANSI pour colorer la sortie terminal et améliorer l'expérience utilisateur"""
    HEADER = '\033[95m'    # Violet pour les en-têtes
    OKBLUE = '\033[94m'    # Bleu pour l'information
    OKCYAN = '\033[96m'    # Cyan pour l'information secondaire
    OKGREEN = '\033[92m'   # Vert pour les succès
    WARNING = '\033[93m'   # Jaune pour les avertissements
    FAIL = '\033[91m'      # Rouge pour les erreurs
    ENDC = '\033[0m'       # Reset de la couleur
    BOLD = '\033[1m'       # Texte en gras
    UNDERLINE = '\033[4m'  # Texte souligné

def print_header(text):
    """
    Affiche un en-tête formaté pour séparer visuellement les sections de test
    Intérêt : Structure visuelle claire pour suivre la progression des tests
    """
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*50}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*50}{Colors.ENDC}")

def print_success(text):
    """Affiche un message de succès avec une icône et une couleur verte"""
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    """Affiche un message d'erreur avec une icône et une couleur rouge"""
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_info(text):
    """Affiche un message informatif avec une icône et une couleur cyan"""
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")

def generate_random_string(length=8):
    """
    Génère une chaîne aléatoire pour créer des noms d'utilisateur uniques
    
    Args:
        length (int): Longueur de la chaîne à générer
    
    Returns:
        str: Chaîne aléatoire composée de lettres minuscules et de chiffres
    
    Intérêt : Évite les conflits de noms d'utilisateur lors de tests répétés
    """
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def test_api_status():
    """
    Test de base pour vérifier si l'API est accessible et fonctionne
    
    Returns:
        bool: True si l'API répond correctement, False sinon
    
    Intérêt : Premier test critique - inutile de continuer si l'API est inaccessible
    """
    print_header("Testing API Status")
    try:
        # Tentative de connexion au endpoint racine de l'API
        response = requests.get(f"{API_URL}/")
        
        if response.status_code == 200:
            # L'API répond - on extrait les informations de version
            data = response.json()
            print_success(f"API is running: {data['name']} v{data['version']}")
            print_info(f"Documentation available at: {API_URL}/docs")
            return True
        else:
            print_error(f"API returned status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        # Erreur de connexion - l'API n'est probablement pas lancée
        print_error(f"Cannot connect to API at {API_URL}")
        print_info("Make sure the API is running: python main.py")
        return False
    except Exception as e:
        # Toute autre erreur inattendue
        print_error(f"Error: {e}")
        return False

def test_register():
    """
    Test d'inscription d'un nouvel utilisateur
    
    Returns:
        bool: True si l'inscription réussit, False sinon
    
    Intérêt : Valide le processus d'onboarding des nouveaux utilisateurs
    """
    global TEST_USER, TOKEN  # Modification des variables globales
    print_header("Testing User Registration")
    
    # Génération de données utilisateur uniques pour éviter les conflits
    username = f"testuser_{generate_random_string()}"
    email = f"{username}@test.com"
    password = "TestPassword123!"  # Mot de passe respectant les critères de sécurité
    
    # Stockage des informations de test pour les utiliser dans d'autres tests
    TEST_USER = {
        "email": email,
        "username": username,
        "password": password
    }
    
    # Construction du payload avec profil complet
    # Intérêt : Teste l'inscription avec toutes les données optionnelles
    payload = {
        "email": email,
        "username": username,
        "password": password,
        "profile": {
            "region": "Europe",
            "bio": "Test user created by API test script",
            "skill_level": "intermediate",
            "looking_for": "teammates",
            "discord_username": f"{username}#1234"  # Format Discord standard
        }
    }
    
    try:
        # Envoi de la requête d'inscription
        response = requests.post(f"{API_URL}/register", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            # Récupération du token JWT pour les requêtes authentifiées suivantes
            TOKEN = data.get("token")
            print_success(f"User registered successfully: {username}")
            print_info(f"User ID: {data['user']['id']}")
            print_info(f"Token received: {TOKEN[:20]}...")  # Affichage partiel du token pour la sécurité
            return True
        else:
            print_error(f"Registration failed: {response.status_code}")
            print_error(response.text)  # Affichage du message d'erreur détaillé
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_login():
    """
    Test de connexion avec les identifiants de l'utilisateur créé précédemment
    
    Returns:
        bool: True si la connexion réussit, False sinon
    
    Intérêt : Valide le processus d'authentification et la génération de tokens
    """
    global TOKEN
    print_header("Testing User Login")
    
    # Vérification de la disponibilité des données utilisateur
    if not TEST_USER:
        print_error("No test user available. Skipping login test.")
        return False
    
    # Payload minimal pour la connexion (email + mot de passe)
    payload = {
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    }
    
    try:
        response = requests.post(f"{API_URL}/login", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            # Mise à jour du token pour les tests suivants
            TOKEN = data.get("token")
            print_success("Login successful")
            print_info(f"Username: {data['user']['username']}")
            print_info(f"Email verified: {data['user']['email_verified']}")
            return True
        else:
            print_error(f"Login failed: {response.status_code}")
            print_error(response.text)
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_get_profile():
    """
    Test de récupération du profil utilisateur (requête authentifiée)
    
    Returns:
        bool: True si le profil est récupéré, False sinon
    
    Intérêt : Valide l'authentification JWT et la récupération des données utilisateur
    """
    print_header("Testing Get Profile")
    
    # Vérification de la disponibilité du token d'authentification
    if not TOKEN:
        print_error("No token available. Skipping profile test.")
        return False
    
    # En-tête Authorization avec Bearer token (standard JWT)
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    try:
        response = requests.get(f"{API_URL}/profile", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            profile = data.get("profile", {})
            print_success("Profile retrieved successfully")
            
            # Affichage des informations clés du profil
            print_info(f"Username: {profile.get('username')}")
            print_info(f"Region: {profile.get('region')}")
            print_info(f"Skill Level: {profile.get('skill_level')}")
            print_info(f"Looking For: {profile.get('looking_for')}")
            return True
        else:
            print_error(f"Failed to get profile: {response.status_code}")
            print_error(response.text)
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_update_profile():
    """
    Test de mise à jour du profil utilisateur
    
    Returns:
        bool: True si la mise à jour réussit, False sinon
    
    Intérêt : Valide les opérations CRUD sur les données utilisateur
    """
    print_header("Testing Update Profile")
    
    if not TOKEN:
        print_error("No token available. Skipping profile update test.")
        return False
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    # Données de mise à jour - mix de nouveaux champs et modifications
    payload = {
        "region": "North America",  # Changement de région
        "bio": "Updated bio from test script",
        "skill_level": "advanced",  # Progression du niveau
        "timezone": "America/New_York",  # Nouveau champ
        "show_stats": True  # Préférence de confidentialité
    }
    
    try:
        # Requête PUT pour une mise à jour complète
        response = requests.put(f"{API_URL}/profile", json=payload, headers=headers)
        
        if response.status_code == 200:
            print_success("Profile updated successfully")
            return True
        else:
            print_error(f"Failed to update profile: {response.status_code}")
            print_error(response.text)
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_get_games():
    """
    Test de récupération de la liste des jeux disponibles (endpoint public)
    
    Returns:
        bool: True si la liste est récupérée, False sinon
    
    Intérêt : Valide l'accès aux données de référence de la plateforme
    """
    print_header("Testing Get Games")
    
    try:
        # Pas besoin d'authentification pour les données publiques
        response = requests.get(f"{API_URL}/games")
        
        if response.status_code == 200:
            games = response.json()
            print_success(f"Retrieved {len(games)} games")
            
            # Affichage d'un échantillon des jeux disponibles
            if games:
                # Limitation à 5 jeux pour éviter une sortie trop longue
                for game in games[:5]:
                    print_info(f"  - {game.get('name')} ({game.get('category')})")
                if len(games) > 5:
                    print_info(f"  ... and {len(games) - 5} more")
            return True
        else:
            print_error(f"Failed to get games: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_add_user_game():
    """
    Test d'ajout d'un jeu au profil utilisateur avec ses statistiques
    
    Returns:
        bool: True si l'ajout réussit, False sinon
    
    Intérêt : Valide l'association utilisateur-jeu et la personnalisation du profil
    """
    print_header("Testing Add User Game")
    
    if not TOKEN:
        print_error("No token available. Skipping add game test.")
        return False
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    # Récupération de la liste des jeux pour en sélectionner un
    try:
        games_response = requests.get(f"{API_URL}/games")
        if games_response.status_code != 200:
            print_error("Cannot get games list")
            return False
        
        games = games_response.json()
        if not games:
            print_error("No games available in database")
            return False
        
        # Sélection du premier jeu de la liste pour le test
        game = games[0]
        
        # Payload complet avec statistiques de jeu
        payload = {
            "game_id": game["id"],
            "skill_level": "intermediate",  # Niveau de compétence dans ce jeu
            "rank": "Gold III",             # Rang actuel (spécifique au jeu)
            "hours_played": 150,            # Temps de jeu
            "is_favorite": True             # Jeu favori ou non
        }
        
        response = requests.post(f"{API_URL}/user/games", json=payload, headers=headers)
        
        if response.status_code == 200:
            print_success(f"Added game to profile: {game['name']}")
            return True
        else:
            print_error(f"Failed to add game: {response.status_code}")
            print_error(response.text)
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_find_matches():
    """
    Test du système de matching pour trouver des coéquipiers compatibles
    
    Returns:
        bool: True si la recherche fonctionne, False sinon
    
    Intérêt : Valide l'algorithme de recommandation et de matching de la plateforme
    """
    print_header("Testing Find Matches")
    
    if not TOKEN:
        print_error("No token available. Skipping matches test.")
        return False
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    try:
        # Requête de matching basée sur le profil de l'utilisateur connecté
        response = requests.post(f"{API_URL}/matches", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            matches = data.get("matches", [])
            
            if matches:
                print_success(f"Found {len(matches)} potential matches")
                # Affichage des 3 meilleurs matches avec leur score de compatibilité
                for match in matches[:3]:
                    print_info(f"  - {match.get('username')} ({match.get('match_score')}% match)")
            else:
                # Cas normal pour un nouvel utilisateur dans une base de données vide
                print_info("No matches found (this is normal for a new user)")
            return True
        else:
            print_error(f"Failed to find matches: {response.status_code}")
            print_error(response.text)
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def run_all_tests():
    """
    Fonction principale qui orchestre l'exécution de tous les tests
    
    Intérêt : 
    - Séquence logique des tests (statut → inscription → connexion → fonctionnalités)
    - Rapport de synthèse complet
    - Gestion des erreurs globales
    """
    # Affichage du banner principal avec formatage ASCII
    print(f"\n{Colors.BOLD}{Colors.HEADER}")
    print("╔══════════════════════════════════════════════╗")
    print("║   E-SPORT SOCIAL PLATFORM - API TEST SUITE   ║")
    print("╚══════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")
    
    # Informations de contexte pour le debugging
    print(f"\n{Colors.OKCYAN}Starting tests at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.ENDC}")
    print(f"{Colors.OKCYAN}API URL: {API_URL}{Colors.ENDC}")
    
    # Définition de la séquence de tests dans l'ordre logique
    # Chaque tuple contient (nom_affiché, fonction_de_test)
    tests = [
        ("API Status", test_api_status),           # Pré-requis : API accessible
        ("User Registration", test_register),      # Création d'un compte utilisateur
        ("User Login", test_login),               # Authentification
        ("Get Profile", test_get_profile),        # Lecture des données utilisateur
        ("Update Profile", test_update_profile),  # Modification des données
        ("Get Games", test_get_games),            # Accès aux données de référence
        ("Add User Game", test_add_user_game),    # Personnalisation du profil
        ("Find Matches", test_find_matches),      # Fonctionnalité de matching
    ]
    
    results = []  # Stockage des résultats pour le rapport final
    
    # Exécution séquentielle des tests
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
            # Délai entre les tests pour éviter de surcharger l'API
            time.sleep(0.5)
        except Exception as e:
            # Capture des erreurs non gérées dans les fonctions de test
            print_error(f"Test {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Génération du rapport de synthèse
    print_header("Test Summary")
    passed = sum(1 for _, result in results if result)
    failed = len(results) - passed
    
    # Affichage détaillé des résultats
    for test_name, result in results:
        status = f"{Colors.OKGREEN}PASSED{Colors.ENDC}" if result else f"{Colors.FAIL}FAILED{Colors.ENDC}"
        print(f"  {test_name}: {status}")
    
    print(f"\n{Colors.BOLD}Total: {passed}/{len(results)} tests passed{Colors.ENDC}")
    
    # Message final conditionnel
    if failed == 0:
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}✨ All tests passed successfully! ✨{Colors.ENDC}")
    else:
        print(f"\n{Colors.WARNING}{Colors.BOLD}⚠ {failed} test(s) failed{Colors.ENDC}")
    
    # Informations utiles pour les tests manuels ou le debugging
    if TEST_USER:
        print(f"\n{Colors.OKCYAN}Test user created:{Colors.ENDC}")
        print(f"  Email: {TEST_USER['email']}")
        print(f"  Password: {TEST_USER['password']}")
        print(f"  You can use this account to test the frontend")

# Point d'entrée du script
if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        # Gestion propre de l'interruption utilisateur (Ctrl+C)
        print(f"\n{Colors.WARNING}Tests interrupted by user{Colors.ENDC}")
    except Exception as e:
        # Capture des erreurs fatales non prévues
        print(f"\n{Colors.FAIL}Fatal error: {e}{Colors.ENDC}")