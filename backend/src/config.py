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

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 15 * 60))
    JWT_REFRESH_TOKEN_EXPIRES = int(
        os.environ.get("JWT_REFRESH_TOKEN_EXPIRES", 7 * 24 * 60 * 60)
    )

    # Logging & observability
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    SENTRY_DSN = os.environ.get("SENTRY_DSN")
    SENTRY_TRACES_SAMPLE_RATE = float(os.environ.get("SENTRY_TRACES_SAMPLE_RATE", 0.1))
    SENTRY_PROFILES_SAMPLE_RATE = float(os.environ.get("SENTRY_PROFILES_SAMPLE_RATE", 0.0))
    METRICS_NAMESPACE = os.environ.get("METRICS_NAMESPACE", "kos_taxi")

    # Stripe configuration - values must be supplied via environment variables
    STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY")
    STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")

    # Notification providers configuration
    NOTIFICATIONS_EMAIL_PROVIDER = os.environ.get(
        "NOTIFICATIONS_EMAIL_PROVIDER", "console"
    )
    NOTIFICATIONS_SMS_PROVIDER = os.environ.get(
        "NOTIFICATIONS_SMS_PROVIDER", "console"
    )
    NOTIFICATIONS_FROM_EMAIL = os.environ.get("NOTIFICATIONS_FROM_EMAIL")
    SMTP_HOST = os.environ.get("SMTP_HOST")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
    SMTP_USERNAME = os.environ.get("SMTP_USERNAME")
    SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
    NOTIFICATIONS_SMS_WEBHOOK_URL = os.environ.get("NOTIFICATIONS_SMS_WEBHOOK_URL")
    NOTIFICATIONS_SMS_WEBHOOK_TOKEN = os.environ.get("NOTIFICATIONS_SMS_WEBHOOK_TOKEN")
    NOTIFICATIONS_DEFAULT_SMS_SENDER = os.environ.get(
        "NOTIFICATIONS_DEFAULT_SMS_SENDER", "KosTaxi"
    )


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
