#!/usr/bin/env python3
"""
Security configuration validator
Run this before starting the application
"""
#  Vulnérabilité Critique JWT_SECRET
import os
import sys
import secrets
from dotenv import load_dotenv

load_dotenv()

def check_security_config():
    """Validate security configuration"""
    issues = []
    warnings = []
    
    # Check JWT_SECRET
    jwt_secret = os.getenv("JWT_SECRET", "")
    if not jwt_secret:
        issues.append("JWT_SECRET not configured")
    elif jwt_secret in ["your-secret-key-change-this", "your_secret_key_here"]:
        issues.append("JWT_SECRET using default value - CRITICAL SECURITY RISK!")
    elif len(jwt_secret) < 32:
        warnings.append("JWT_SECRET should be at least 32 characters")
    
    # Check database password
    db_pass = os.getenv("DB_PASS", "")
    if not db_pass:
        warnings.append("Database password is empty")
    
    # Check environment
    env = os.getenv("ENV", "development")
    if env == "production" and issues:
        print("🔴 CRITICAL SECURITY ISSUES FOUND IN PRODUCTION:")
        for issue in issues:
            print(f"   ❌ {issue}")
        sys.exit(1)
    
    if issues:
        print("⚠️  Security Issues Found:")
        for issue in issues:
            print(f"   ⚠️  {issue}")
    
    if warnings:
        print("📋 Security Warnings:")
        for warning in warnings:
            print(f"   📝 {warning}")
    
    if not issues and not warnings:
        print("✅ Security configuration OK")
    
    return len(issues) == 0

def generate_secure_config():
    """Generate secure configuration template"""
    print("\n🔐 Generating secure configuration...")
    
    jwt_secret = secrets.token_urlsafe(32)
    
    config = f"""# Secure Configuration Template
# Generated JWT Secret (use this or generate your own)
JWT_SECRET={jwt_secret}

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=YOUR_SECURE_PASSWORD_HERE
DB_NAME=esport_social

# Environment
ENV=development
"""
    
    with open(".env.secure.example", "w") as f:
        f.write(config)
    
    print(f"✅ Secure config template saved to .env.secure.example")
    print(f"🔑 Generated JWT Secret: {jwt_secret}")
    print("⚠️  Copy this to your .env file and keep it secret!")

if __name__ == "__main__":
    if "--generate" in sys.argv:
        generate_secure_config()
    else:
        if not check_security_config():
            print("\n💡 Run with --generate to create secure config template")
            sys.exit(1)