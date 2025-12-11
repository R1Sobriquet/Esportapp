"""
Activity tracking middleware.
Logs user activity for all authenticated requests.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from ..services.activity_monitor import ActivityMonitor
from ..database import get_db_connection


class ActivityMiddleware(BaseHTTPMiddleware):
    """
    Middleware that tracks user activity on each request.
    Logs activity if the user is authenticated.
    """

    async def dispatch(self, request: Request, call_next):
        """
        Process the request and log activity if authenticated.

        Args:
            request: The incoming request
            call_next: The next middleware/handler in the chain

        Returns:
            The response from the next handler
        """
        response = await call_next(request)

        # If the user is authenticated, log the activity
        if hasattr(request.state, "user_id"):
            try:
                db = get_db_connection()
                monitor = ActivityMonitor(db)
                monitor.log_activity(
                    user_id=request.state.user_id,
                    activity_type="api_call",
                    ip=request.client.host if request.client else None,
                    user_agent=request.headers.get("User-Agent"),
                )
                db.close()
            except Exception:
                pass  # Don't block the request if logging fails

        return response
