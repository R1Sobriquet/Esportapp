#!/usr/bin/env python3
"""
Generate bcrypt password hash for test users
Place this file in the API/ folder and run it
"""

import bcrypt

def generate_password_hash(password="password123"):
    """Generate a bcrypt hash for the given password"""
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    # Return as string
    return hashed.decode('utf-8')

if __name__ == "__main__":
    print("=" * 60)
    print("Password Hash Generator for Test Users")
    print("=" * 60)
    
    # Generate hash for default password
    password = "password123"
    hash_value = generate_password_hash(password)
    
    print(f"\nPassword: {password}")
    print(f"Hash: {hash_value}")
    print("\n⚠️  IMPORTANT: Copy this hash and replace @password_hash in the SQL file!")
    print("\nTo use in SQL:")
    print(f"SET @password_hash = '{hash_value}';")
    print("\nAll test users will use this password for login.")
    print("=" * 60)