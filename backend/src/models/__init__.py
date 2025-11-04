"""Database initialization for the Kos Taxi backend models."""
from __future__ import annotations

from flask_sqlalchemy import SQLAlchemy

# Single shared SQLAlchemy instance used across the application.
db = SQLAlchemy()

from .payment import Payment  # noqa: E402  # Import after db is defined

__all__ = ["db", "Payment"]
