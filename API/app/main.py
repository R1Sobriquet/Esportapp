"""
Main FastAPI application entry point.
E-Sport Social Platform API
"""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routes import api_router
from .middleware.activity import ActivityMiddleware
from .services.activity_monitor import check_inactive_accounts_task


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    task = asyncio.create_task(check_inactive_accounts_task())
    yield
    # Shutdown
    task.cancel()


# Create FastAPI application
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="Backend API for the GameConnect e-sports social platform",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Activity tracking middleware
app.add_middleware(ActivityMiddleware)

# Include API routes
app.include_router(api_router)


@app.get("/")
def root():
    """
    Root endpoint.
    Returns API status and information.
    """
    return {
        "status": "API is running",
        "name": settings.API_TITLE,
        "version": settings.API_VERSION,
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint.
    Used for monitoring and load balancer health checks.
    """
    return {"status": "healthy"}
