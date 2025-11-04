"""Database initialization for the Kos Taxi backend models."""

from flask_sqlalchemy import SQLAlchemy

# Single shared SQLAlchemy instance used across the application.
db = SQLAlchemy()

__all__ = ["db"]
