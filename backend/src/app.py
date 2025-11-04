"""Application factory and bootstrap logic for the Kos Taxi backend."""

from __future__ import annotations

import logging
import time
from logging.config import dictConfig
from pathlib import Path
from typing import Optional, Type

from flask import Flask, Response, g, request, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from sentry_sdk import init as sentry_init
from sentry_sdk.integrations.flask import FlaskIntegration

from .config import BASE_DIR, Config, DATABASE_DIR, get_config
from .models import db
from .auth import auth_bp
from .routes.admin import admin_bp
from .routes.drivers import driver_bp
from .routes.payments import payments_bp
from .routes.ride import ride_bp
from .routes.user import user_bp

STATIC_DIR = BASE_DIR / "static"
MIGRATIONS_DIR = BASE_DIR / "migrations"

migrate = Migrate()

_REQUEST_LATENCY: Optional[Histogram] = None
_REQUEST_COUNT: Optional[Counter] = None


def create_app(config_class: Optional[Type[Config]] = None) -> Flask:
    """Create and configure the Flask application."""

    app = Flask(__name__, static_folder=str(STATIC_DIR))
    config_obj = config_class or get_config()
    app.config.from_object(config_obj)

    _init_observability(app)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    migrate.init_app(app, db, directory=str(MIGRATIONS_DIR))

    _bootstrap_filesystem(app)

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(ride_bp, url_prefix='/api')
    app.register_blueprint(driver_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(payments_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')

    _register_static_routes(app)

    return app


def _init_observability(app: Flask) -> None:
    """Configure logging, error tracking and metrics instrumentation."""

    _configure_logging(app)
    _init_sentry(app)
    _init_metrics(app)


def _configure_logging(app: Flask) -> None:
    """Initialise structured logging for the application."""

    log_level = app.config.get("LOG_LEVEL", "INFO").upper()
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "[%(asctime)s] %(levelname)s in %(name)s: %(message)s",
                }
            },
            "handlers": {
                "wsgi": {
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                    "formatter": "default",
                }
            },
            "root": {
                "level": log_level,
                "handlers": ["wsgi"],
            },
        }
    )
    logging.getLogger(__name__).debug("Logging configured with level %s", log_level)


def _init_sentry(app: Flask) -> None:
    """Attach Sentry error tracking if a DSN is configured."""

    dsn = app.config.get("SENTRY_DSN")
    if not dsn:
        app.logger.info("Sentry DSN not provided; skipping error tracking setup.")
        return

    environment = (
        app.config.get("ENV")
        or app.config.get("FLASK_ENV")
        or app.config.get("ENVIRONMENT")
        or "production"
    )

    sentry_init(
        dsn=dsn,
        integrations=[FlaskIntegration()],
        traces_sample_rate=app.config.get("SENTRY_TRACES_SAMPLE_RATE", 0.1),
        profiles_sample_rate=app.config.get("SENTRY_PROFILES_SAMPLE_RATE", 0.0),
        environment=environment,
    )
    suffix = dsn[-5:] if len(dsn) >= 5 else dsn
    app.logger.info("Sentry initialised with DSN ending in %s", suffix)


def _init_metrics(app: Flask) -> None:
    """Expose Prometheus metrics and instrument request lifecycle."""

    global _REQUEST_LATENCY, _REQUEST_COUNT
    if _REQUEST_LATENCY is not None and _REQUEST_COUNT is not None:
        return

    namespace = (app.config.get("METRICS_NAMESPACE") or "kos_taxi").replace("-", "_")

    _REQUEST_LATENCY = Histogram(
        "http_request_duration_seconds",
        "Time spent processing HTTP requests.",
        ("method", "endpoint"),
        namespace=namespace,
        buckets=(0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
    )
    _REQUEST_COUNT = Counter(
        "http_requests_total",
        "Total number of HTTP requests.",
        ("method", "endpoint", "http_status"),
        namespace=namespace,
    )

    @app.before_request
    def _metrics_before_request() -> None:  # pragma: no cover - flask hook
        g._metrics_request_started_at = time.perf_counter()

    @app.after_request
    def _metrics_after_request(response: Response) -> Response:  # pragma: no cover - flask hook
        if _REQUEST_LATENCY is not None and hasattr(g, "_metrics_request_started_at"):
            duration = time.perf_counter() - g._metrics_request_started_at
            endpoint = request.endpoint or "unknown"
            _REQUEST_LATENCY.labels(request.method, endpoint).observe(duration)
            if _REQUEST_COUNT is not None:
                _REQUEST_COUNT.labels(request.method, endpoint, str(response.status_code)).inc()
        return response

    @app.route("/metrics")
    def metrics() -> Response:
        payload = generate_latest()
        return Response(payload, mimetype=CONTENT_TYPE_LATEST)


def _bootstrap_filesystem(app: Flask) -> None:
    """Ensure required directories and database migrations are initialised."""

    STATIC_DIR.mkdir(parents=True, exist_ok=True)
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)

    with app.app_context():
        if not MIGRATIONS_DIR.exists():
            app.logger.info(
                "Migrations directory missing at %s. Run 'flask db init --directory %s' "
                "to initialise Alembic before creating migrations.",
                MIGRATIONS_DIR,
                MIGRATIONS_DIR,
            )

        db.create_all()


def _register_static_routes(app: Flask) -> None:
    """Register routes for serving the built frontend assets."""

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path: str):
        static_folder_path = Path(app.static_folder or STATIC_DIR)
        if not static_folder_path.exists():
            app.logger.error("Static assets directory missing: %s", static_folder_path)
            return "Static assets not found", 404

        requested_path = static_folder_path / path
        if path and requested_path.exists():
            return send_from_directory(static_folder_path, path)

        index_path = static_folder_path / 'index.html'
        if index_path.exists():
            return send_from_directory(static_folder_path, 'index.html')

        return "index.html not found", 404


__all__ = ["create_app", "migrate", "db"]
