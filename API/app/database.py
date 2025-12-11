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
        host=settings.db_host,
        user=settings.db_user,
        passwd=settings.db_password,
        db=settings.db_name,
        charset=settings.db_charset
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
        self.__dict_cursor = dict_cursor
        self.__db = None
        self.__cursor = None

    def __enter__(self):
        self.__db = get_db_connection()
        cursor_class = DictCursor if self.__dict_cursor else None
        self.__cursor = self.__db.cursor(cursor_class) if cursor_class else self.__db.cursor()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.__db.rollback()
        else:
            self.__db.commit()

        self.__cursor.close()
        self.__db.close()
        return False

    def execute(self, query: str, params: tuple = None):
        """Execute a query with optional parameters."""
        if params:
            self.__cursor.execute(query, params)
        else:
            self.__cursor.execute(query)
        return self.__cursor

    def fetchone(self):
        """Fetch one result."""
        return self.__cursor.fetchone()

    def fetchall(self):
        """Fetch all results."""
        return self.__cursor.fetchall()

    @property
    def lastrowid(self):
        """Get the last inserted row ID."""
        return self.__cursor.lastrowid

    @property
    def rowcount(self):
        """Get the number of affected rows."""
        return self.__cursor.rowcount
