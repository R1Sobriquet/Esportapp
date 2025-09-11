#!/usr/bin/env python3
"""
Script de test pour l'API FastAPI E-Sport Social Platform
Usage: python test_api.py
"""

import requests
import json
import random
import string
import time
from datetime import datetime

# Configuration
API_URL = "http://localhost:8000"
TEST_USER = None
TOKEN = None

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*50}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*50}{Colors.ENDC}")

def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")

def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def test_api_status():
    """Test if API is running"""
    print_header("Testing API Status")
    try:
        response = requests.get(f"{API_URL}/")
        if response.status_code == 200:
            data = response.json()
            print_success(f"API is running: {data['name']} v{data['version']}")
            print_info(f"Documentation available at: {API_URL}/docs")
            return True
        else:
            print_error(f"API returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error(f"Cannot connect to API at {API_URL}")
        print_info("Make sure the API is running: python main.py")
        return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_register():
    """Test user registration"""
    global TEST_USER, TOKEN
    print_header("Testing User Registration")
    
    # Generate unique user data
    username = f"testuser_{generate_random_string()}"
    email = f"{username}@test.com"
    password = "TestPassword123!"
    
    TEST_USER = {
        "email": email,
        "username": username,
        "password": password
    }
    
    payload = {
        "email": email,
        "username": username,
        "password": password,
        "profile": {
            "region": "Europe",
            "bio": "Test user created by API test script",
            "skill_level": "intermediate",
            "looking_for": "teammates",
            "discord_username": f"{username}#1234"
        }
    }
    
    try:
        response = requests.post(f"{API_URL}/register", json=payload)
        if response.status_code == 200:
            data = response.json()
            TOKEN = data.get("token")
            print_success(f"User registered successfully: {username}")
            print_info(f"User ID: {data['user']['id']}")
            print_info(f"Token received: {TOKEN[:20]}...")
            return True
        else:
            print_error(f"Registration failed: {response.status_code}")
            print_error(response.text)
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_login():
    """Test user login"""
    global TOKEN
    print_header("Testing User Login")
    
    if not TEST_USER:
        print_error("No test user available. Skipping login test.")
        return False
    
    payload = {
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    }
    
    try:
        response = requests.post(f"{API_URL}/login", json=payload)
        if response.status_code == 200:
            data = response.json()
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
    """Test getting user profile"""
    print_header("Testing Get Profile")
    
    if not TOKEN:
        print_error("No token available. Skipping profile test.")
        return False
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    try:
        response = requests.get(f"{API_URL}/profile", headers=headers)
        if response.status_code == 200:
            data = response.json()
            profile = data.get("profile", {})
            print_success("Profile retrieved successfully")
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
    """Test updating user profile"""
    print_header("Testing Update Profile")
    
    if not TOKEN:
        print_error("No token available. Skipping profile update test.")
        return False
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    payload = {
        "region": "North America",
        "bio": "Updated bio from test script",
        "skill_level": "advanced",
        "timezone": "America/New_York",
        "show_stats": True
    }
    
    try:
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
    """Test getting all games"""
    print_header("Testing Get Games")
    
    try:
        response = requests.get(f"{API_URL}/games")
        if response.status_code == 200:
            games = response.json()
            print_success(f"Retrieved {len(games)} games")
            if games:
                # Show first 5 games
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
    """Test adding a game to user profile"""
    print_header("Testing Add User Game")
    
    if not TOKEN:
        print_error("No token available. Skipping add game test.")
        return False
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    # First, get available games
    try:
        games_response = requests.get(f"{API_URL}/games")
        if games_response.status_code != 200:
            print_error("Cannot get games list")
            return False
        
        games = games_response.json()
        if not games:
            print_error("No games available in database")
            return False
        
        # Add first game from list
        game = games[0]
        payload = {
            "game_id": game["id"],
            "skill_level": "intermediate",
            "rank": "Gold III",
            "hours_played": 150,
            "is_favorite": True
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
    """Test finding matches"""
    print_header("Testing Find Matches")
    
    if not TOKEN:
        print_error("No token available. Skipping matches test.")
        return False
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    try:
        response = requests.post(f"{API_URL}/matches", headers=headers)
        if response.status_code == 200:
            data = response.json()
            matches = data.get("matches", [])
            if matches:
                print_success(f"Found {len(matches)} potential matches")
                for match in matches[:3]:
                    print_info(f"  - {match.get('username')} ({match.get('match_score')}% match)")
            else:
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
    """Run all tests"""
    print(f"\n{Colors.BOLD}{Colors.HEADER}")
    print("╔══════════════════════════════════════════════╗")
    print("║   E-SPORT SOCIAL PLATFORM - API TEST SUITE   ║")
    print("╚══════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")
    
    print(f"\n{Colors.OKCYAN}Starting tests at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.ENDC}")
    print(f"{Colors.OKCYAN}API URL: {API_URL}{Colors.ENDC}")
    
    tests = [
        ("API Status", test_api_status),
        ("User Registration", test_register),
        ("User Login", test_login),
        ("Get Profile", test_get_profile),
        ("Update Profile", test_update_profile),
        ("Get Games", test_get_games),
        ("Add User Game", test_add_user_game),
        ("Find Matches", test_find_matches),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
            time.sleep(0.5)  # Small delay between tests
        except Exception as e:
            print_error(f"Test {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Print summary
    print_header("Test Summary")
    passed = sum(1 for _, result in results if result)
    failed = len(results) - passed
    
    for test_name, result in results:
        status = f"{Colors.OKGREEN}PASSED{Colors.ENDC}" if result else f"{Colors.FAIL}FAILED{Colors.ENDC}"
        print(f"  {test_name}: {status}")
    
    print(f"\n{Colors.BOLD}Total: {passed}/{len(results)} tests passed{Colors.ENDC}")
    
    if failed == 0:
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}✨ All tests passed successfully! ✨{Colors.ENDC}")
    else:
        print(f"\n{Colors.WARNING}{Colors.BOLD}⚠ {failed} test(s) failed{Colors.ENDC}")
    
    # Cleanup info
    if TEST_USER:
        print(f"\n{Colors.OKCYAN}Test user created:{Colors.ENDC}")
        print(f"  Email: {TEST_USER['email']}")
        print(f"  Password: {TEST_USER['password']}")
        print(f"  You can use this account to test the frontend")

if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Tests interrupted by user{Colors.ENDC}")
    except Exception as e:
        print(f"\n{Colors.FAIL}Fatal error: {e}{Colors.ENDC}")