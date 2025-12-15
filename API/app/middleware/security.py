"""
Security middleware.
Provides rate limiting, security headers, and request validation.
"""

import time
from collections import defaultdict
from typing import Callable, Dict, Optional
from functools import wraps

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimiter:
    """
    Simple in-memory rate limiter.
    For production, use Redis-based solution.
    """

    def __init__(self):
        self._requests: Dict[str, list] = defaultdict(list)
        self._blocked: Dict[str, float] = {}

    def is_allowed(
        self,
        key: str,
        max_requests: int = 100,
        window_seconds: int = 60,
        block_seconds: int = 300,
    ) -> tuple[bool, Optional[int]]:
        """
        Check if request is allowed based on rate limits.

        Args:
            key: Unique identifier (IP or user ID)
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds
            block_seconds: How long to block after limit exceeded

        Returns:
            Tuple of (is_allowed, retry_after_seconds)
        """
        now = time.time()

        # Check if blocked
        if key in self._blocked:
            if now < self._blocked[key]:
                return False, int(self._blocked[key] - now)
            else:
                del self._blocked[key]

        # Clean old requests
        self._requests[key] = [
            req_time for req_time in self._requests[key]
            if now - req_time < window_seconds
        ]

        # Check rate limit
        if len(self._requests[key]) >= max_requests:
            self._blocked[key] = now + block_seconds
            return False, block_seconds

        # Record request
        self._requests[key].append(now)
        return True, None

    def clear(self, key: str):
        """Clear rate limit data for a key."""
        if key in self._requests:
            del self._requests[key]
        if key in self._blocked:
            del self._blocked[key]


# Global rate limiter instance
rate_limiter = RateLimiter()


class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Security middleware that adds headers and rate limiting.
    """

    async def dispatch(self, request: Request, call_next: Callable):
        # Get client identifier
        client_ip = request.client.host if request.client else "unknown"
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()

        # Apply rate limiting
        endpoint = request.url.path
        rate_key = f"{client_ip}:{endpoint}"

        # Different limits for different endpoints
        if endpoint.startswith("/login") or endpoint.startswith("/register"):
            # Stricter limits for auth endpoints
            allowed, retry_after = rate_limiter.is_allowed(
                rate_key, max_requests=10, window_seconds=60, block_seconds=600
            )
        elif endpoint.startswith("/matches"):
            # Moderate limits for matching
            allowed, retry_after = rate_limiter.is_allowed(
                rate_key, max_requests=30, window_seconds=60, block_seconds=300
            )
        else:
            # General limits
            allowed, retry_after = rate_limiter.is_allowed(
                rate_key, max_requests=100, window_seconds=60, block_seconds=300
            )

        if not allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Trop de requêtes. Veuillez réessayer plus tard.",
                    "retry_after": retry_after,
                },
                headers={"Retry-After": str(retry_after)},
            )

        # Process request
        response = await call_next(request)

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        # Add CORS headers for preflight
        if request.method == "OPTIONS":
            response.headers["Access-Control-Max-Age"] = "86400"

        # Rate limit headers
        response.headers["X-RateLimit-Limit"] = "100"
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, 100 - len(rate_limiter._requests.get(rate_key, [])))
        )

        return response


def rate_limit(max_requests: int = 10, window_seconds: int = 60):
    """
    Decorator for endpoint-specific rate limiting.

    Usage:
        @router.post("/sensitive-action")
        @rate_limit(max_requests=5, window_seconds=300)
        def sensitive_action(request: Request):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request = kwargs.get("request")
            if not request:
                # Try to find request in args
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break

            if request:
                client_ip = request.client.host if request.client else "unknown"
                rate_key = f"{client_ip}:{func.__name__}"

                allowed, retry_after = rate_limiter.is_allowed(
                    rate_key,
                    max_requests=max_requests,
                    window_seconds=window_seconds,
                )

                if not allowed:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Rate limit exceeded. Try again in {retry_after} seconds.",
                        headers={"Retry-After": str(retry_after)},
                    )

            return await func(*args, **kwargs)

        return wrapper

    return decorator


def sanitize_input(value: str, max_length: int = 1000) -> str:
    """
    Sanitize user input to prevent XSS and injection attacks.

    Args:
        value: Input string to sanitize
        max_length: Maximum allowed length

    Returns:
        Sanitized string
    """
    if not value:
        return value

    # Truncate to max length
    value = value[:max_length]

    # Remove null bytes
    value = value.replace("\x00", "")

    # Basic HTML entity encoding for display
    html_entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
    }

    for char, entity in html_entities.items():
        value = value.replace(char, entity)

    return value.strip()


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password meets security requirements.

    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Le mot de passe doit contenir au moins 8 caractères"

    if not any(c.isupper() for c in password):
        return False, "Le mot de passe doit contenir au moins une majuscule"

    if not any(c.islower() for c in password):
        return False, "Le mot de passe doit contenir au moins une minuscule"

    if not any(c.isdigit() for c in password):
        return False, "Le mot de passe doit contenir au moins un chiffre"

    # Check for common weak passwords
    weak_passwords = [
        "password", "12345678", "qwerty123", "azerty123",
        "password123", "admin123", "user1234",
    ]
    if password.lower() in weak_passwords:
        return False, "Ce mot de passe est trop commun"

    return True, ""
