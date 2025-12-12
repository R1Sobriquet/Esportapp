"""
API Routes module.
Contains all endpoint routers organized by domain.
"""

from fastapi import APIRouter

from .auth import router as auth_router
from .profile import router as profile_router
from .games import router as games_router
from .matching import router as matching_router
from .messages import router as messages_router
from .stats import router as stats_router
from .search import router as search_router
from .notifications import router as notifications_router

# Main API router
api_router = APIRouter()

# Include all domain routers
api_router.include_router(auth_router, tags=["Authentication"])
api_router.include_router(profile_router, tags=["Profile"])
api_router.include_router(games_router, tags=["Games"])
api_router.include_router(matching_router, tags=["Matching"])
api_router.include_router(messages_router, tags=["Messages"])
api_router.include_router(stats_router, tags=["Statistics"])
api_router.include_router(search_router, tags=["Search"])
api_router.include_router(notifications_router, tags=["Notifications"])

__all__ = ["api_router"]
