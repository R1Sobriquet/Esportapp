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

    # Database - Private attributes for sensitive data
    __DB_HOST: str = os.getenv("DB_HOST", "localhost")
    __DB_USER: str = os.getenv("DB_USER", "root")
    __DB_PASS: str = os.getenv("DB_PASS", "")
    __DB_NAME: str = os.getenv("DB_NAME", "esport_social")
    __DB_CHARSET: str = "utf8mb4"

    # JWT Settings - Private
    __ALGORITHM: str = "HS256"
    __ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    __JWT_SECRET: str = None

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    # API
    API_TITLE: str = "E-Sport Social Platform API"
    API_VERSION: str = "2.0"

    # --- Properties for controlled access to sensitive data ---

    @property
    def db_host(self) -> str:
        """Get database host."""
        return self.__DB_HOST

    @property
    def db_user(self) -> str:
        """Get database user."""
        return self.__DB_USER

    @property
    def db_password(self) -> str:
        """Get database password."""
        return self.__DB_PASS

    @property
    def db_name(self) -> str:
        """Get database name."""
        return self.__DB_NAME

    @property
    def db_charset(self) -> str:
        """Get database charset."""
        return self.__DB_CHARSET

    @property
    def algorithm(self) -> str:
        """Get JWT algorithm."""
        return self.__ALGORITHM

    @property
    def access_token_expire_days(self) -> int:
        """Get token expiration in days."""
        return self.__ACCESS_TOKEN_EXPIRE_DAYS

    @property
    def jwt_secret(self) -> str:
        """
        Get JWT secret or generate one if not exists.
        In production, exits if no secret is configured.
        """
        if self.__JWT_SECRET is not None:
            return self.__JWT_SECRET

        secret = os.getenv("JWT_SECRET")

        if not secret or secret == "your-secret-key-change-this":
            if self.ENV == "production":
                print("CRITICAL ERROR: JWT_SECRET not configured in production!")
                sys.exit(1)

            secret_file = ".jwt_secret"

            if os.path.exists(secret_file):
                with open(secret_file, "r") as f:
                    self.__JWT_SECRET = f.read().strip()
                    return self.__JWT_SECRET

            new_secret = secrets.token_urlsafe(64)

            with open(secret_file, "w") as f:
                f.write(new_secret)

            print("Warning: JWT_SECRET was missing, a new one has been generated in .jwt_secret")
            self.__JWT_SECRET = new_secret
            return self.__JWT_SECRET

        self.__JWT_SECRET = secret
        return self.__JWT_SECRET


# Global settings instance
settings = Settings()

# JWT Secret (loaded once at startup) - accessed via property
SECRET_KEY = settings.jwt_secret
