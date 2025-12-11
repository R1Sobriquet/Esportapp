"""
Activity monitoring service.
Tracks user activity and detects inactive accounts.
"""

import asyncio
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from enum import Enum

import MySQLdb
from MySQLdb.cursors import DictCursor

from ..config import settings


class AccountStatus(Enum):
    """Enum for account status values."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class ActivityMonitor:
    """
    Service for monitoring and tracking user activity.
    Handles activity logging and inactive account detection.
    """

    def __init__(self, db_connection):
        """
        Initialize the activity monitor.

        Args:
            db_connection: MySQL database connection
        """
        self.db = db_connection
        self.inactive_threshold_days = 30  # Account inactive after 30 days
        self.warning_threshold_days = 21  # Warning after 21 days

    def log_activity(
        self,
        user_id: int,
        activity_type: str,
        ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> None:
        """
        Log user activity.

        Args:
            user_id: The user's ID
            activity_type: Type of activity (e.g., 'login', 'api_call')
            ip: IP address of the request
            user_agent: User agent string
        """
        cursor = self.db.cursor()
        try:
            # Update last activity timestamp
            cursor.execute(
                """
                UPDATE users
                SET last_activity_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """,
                (user_id,),
            )

            # Log activity
            cursor.execute(
                """
                INSERT INTO user_activity_logs (user_id, activity_type, ip_address, user_agent)
                VALUES (%s, %s, %s, %s)
                """,
                (user_id, activity_type, ip, user_agent),
            )

            self.db.commit()
        finally:
            cursor.close()

    def check_inactive_accounts(self) -> List[Dict]:
        """
        Find and process inactive accounts.

        Returns:
            List of accounts that need warning
        """
        cursor = self.db.cursor(DictCursor)
        try:
            inactive_date = datetime.now() - timedelta(days=self.inactive_threshold_days)
            warning_date = datetime.now() - timedelta(days=self.warning_threshold_days)

            # Find accounts that need warning
            cursor.execute(
                """
                SELECT
                    u.id, u.email, u.username,
                    u.last_activity_at,
                    DATEDIFF(NOW(), COALESCE(u.last_activity_at, u.created_at)) as days_inactive
                FROM users u
                WHERE u.account_status = 'active'
                AND (
                    u.last_activity_at IS NULL AND u.created_at < %s
                    OR u.last_activity_at < %s
                )
                ORDER BY days_inactive DESC
                """,
                (warning_date, warning_date),
            )

            accounts_to_warn = cursor.fetchall()

            # Mark accounts as inactive
            cursor.execute(
                """
                UPDATE users
                SET account_status = 'inactive'
                WHERE account_status = 'active'
                AND (
                    last_activity_at IS NULL AND created_at < %s
                    OR last_activity_at < %s
                )
                """,
                (inactive_date, inactive_date),
            )

            self.db.commit()

            return accounts_to_warn

        finally:
            cursor.close()

    def get_activity_stats(self, user_id: int) -> Dict:
        """
        Get user activity statistics.

        Args:
            user_id: The user's ID

        Returns:
            Dictionary containing activity statistics
        """
        cursor = self.db.cursor(DictCursor)
        try:
            cursor.execute(
                """
                SELECT
                    COUNT(*) as total_activities,
                    MAX(created_at) as last_activity,
                    COUNT(DISTINCT DATE(created_at)) as active_days,
                    COUNT(CASE WHEN activity_type = 'login' THEN 1 END) as login_count,
                    COUNT(CASE WHEN activity_type = 'message_sent' THEN 1 END) as messages_sent,
                    COUNT(CASE WHEN activity_type = 'match_action' THEN 1 END) as match_actions
                FROM user_activity_logs
                WHERE user_id = %s
                AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                """,
                (user_id,),
            )

            return cursor.fetchone()

        finally:
            cursor.close()

    def reactivate_account(self, user_id: int) -> None:
        """
        Reactivate an inactive account.

        Args:
            user_id: The user's ID to reactivate
        """
        cursor = self.db.cursor()
        try:
            cursor.execute(
                """
                UPDATE users
                SET account_status = 'active',
                    last_activity_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """,
                (user_id,),
            )

            self.db.commit()
        finally:
            cursor.close()


async def check_inactive_accounts_task():
    """
    Background task to check for inactive accounts daily.
    Runs continuously with 24-hour intervals.
    """
    while True:
        try:
            db = MySQLdb.connect(
                host=settings.DB_HOST,
                user=settings.DB_USER,
                passwd=settings.DB_PASS,
                db=settings.DB_NAME,
            )

            monitor = ActivityMonitor(db)
            inactive_accounts = monitor.check_inactive_accounts()

            if inactive_accounts:
                print(f"Found {len(inactive_accounts)} inactive accounts")
                # Here we could send reactivation emails
                for account in inactive_accounts:
                    print(f"- {account['username']}: {account['days_inactive']} days inactive")

            db.close()

        except Exception as e:
            print(f"Error checking inactive accounts: {e}")

        # Wait 24 hours
        await asyncio.sleep(86400)
