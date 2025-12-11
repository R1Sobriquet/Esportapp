"""
Configuration module for the API.
Handles environment variables and application settings.
"""

import os
import sys
import secrets
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Environment
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = ENV != "production"

    # Database
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASS: str = os.getenv("DB_PASS", "")
    DB_NAME: str = os.getenv("DB_NAME", "esport_social")
    DB_CHARSET: str = "utf8mb4"

    # JWT Settings
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    # API
    API_TITLE: str = "E-Sport Social Platform API"
    API_VERSION: str = "2.0"

    @classmethod
    def get_jwt_secret(cls) -> str:
        """
        Get JWT secret or generate one if not exists.
        In production, exits if no secret is configured.
        """
        secret = os.getenv("JWT_SECRET")

        if not secret or secret == "your-secret-key-change-this":
            if cls.ENV == "production":
                print("CRITICAL ERROR: JWT_SECRET not configured in production!")
                sys.exit(1)

            secret_file = ".jwt_secret"

            if os.path.exists(secret_file):
                with open(secret_file, "r") as f:
                    return f.read().strip()

            new_secret = secrets.token_urlsafe(64)

            with open(secret_file, "w") as f:
                f.write(new_secret)

            print("Warning: JWT_SECRET was missing, a new one has been generated in .jwt_secret")
            return new_secret

        return secret


# Global settings instance
settings = Settings()

# JWT Secret (loaded once at startup)
SECRET_KEY = settings.get_jwt_secret()
