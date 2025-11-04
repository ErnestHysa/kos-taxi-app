"""Application configuration for the Kos Taxi backend."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Type

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
DATABASE_DIR = BASE_DIR / "database"

load_dotenv(BASE_DIR.parent.parent / ".env")


class Config:
    """Base configuration shared across environments."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "kos-taxi-secret-key-2025")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", f"sqlite:///{DATABASE_DIR / 'app.db'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Stripe configuration - values must be supplied via environment variables
    STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY")
    STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


def get_config() -> Type[Config]:
    """Return the configuration class based on the FLASK_ENV value."""

    env = os.environ.get("FLASK_ENV", "development").lower()
    if env == "production":
        return ProductionConfig
    return DevelopmentConfig
