"""
Database module for MySQL connections.
Provides connection management and utilities.
"""

import MySQLdb
from MySQLdb.cursors import DictCursor
from contextlib import contextmanager
from typing import Generator, Any

from .config import settings


def get_db_connection():
    """
    Create a new database connection.

    Returns:
        MySQLdb.Connection: A new database connection
    """
    return MySQLdb.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        passwd=settings.DB_PASS,
        db=settings.DB_NAME,
        charset=settings.DB_CHARSET
    )


@contextmanager
def get_db() -> Generator[MySQLdb.Connection, None, None]:
    """
    Context manager for database connections.
    Automatically closes the connection when done.

    Yields:
        MySQLdb.Connection: Database connection
    """
    db = get_db_connection()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_cursor(dict_cursor: bool = False) -> Generator[Any, None, None]:
    """
    Context manager for database cursor.
    Handles connection and cursor lifecycle.

    Args:
        dict_cursor: If True, returns results as dictionaries

    Yields:
        Cursor: Database cursor
    """
    db = get_db_connection()
    cursor_class = DictCursor if dict_cursor else None
    cursor = db.cursor(cursor_class) if cursor_class else db.cursor()

    try:
        yield cursor
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        cursor.close()
        db.close()


class DatabaseSession:
    """
    Database session class for more complex operations.
    Provides both connection and cursor management.
    """

    def __init__(self, dict_cursor: bool = False):
        self.dict_cursor = dict_cursor
        self.db = None
        self.cursor = None

    def __enter__(self):
        self.db = get_db_connection()
        cursor_class = DictCursor if self.dict_cursor else None
        self.cursor = self.db.cursor(cursor_class) if cursor_class else self.db.cursor()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.db.rollback()
        else:
            self.db.commit()

        self.cursor.close()
        self.db.close()
        return False

    def execute(self, query: str, params: tuple = None):
        """Execute a query with optional parameters."""
        if params:
            self.cursor.execute(query, params)
        else:
            self.cursor.execute(query)
        return self.cursor

    def fetchone(self):
        """Fetch one result."""
        return self.cursor.fetchone()

    def fetchall(self):
        """Fetch all results."""
        return self.cursor.fetchall()

    @property
    def lastrowid(self):
        """Get the last inserted row ID."""
        return self.cursor.lastrowid

    @property
    def rowcount(self):
        """Get the number of affected rows."""
        return self.cursor.rowcount
