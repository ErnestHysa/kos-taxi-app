"""Application factory and bootstrap logic for the Kos Taxi backend."""

from __future__ import annotations

from pathlib import Path
from typing import Optional, Type

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate, init as migrations_init

from .config import Config, DATABASE_DIR, BASE_DIR, get_config
from .models import db
from .routes.driver import driver_bp
from .routes.ride import ride_bp
from .routes.user import user_bp

STATIC_DIR = BASE_DIR / "static"
MIGRATIONS_DIR = BASE_DIR / "migrations"

migrate = Migrate()


def create_app(config_class: Optional[Type[Config]] = None) -> Flask:
    """Create and configure the Flask application."""

    app = Flask(__name__, static_folder=str(STATIC_DIR))
    config_obj = config_class or get_config()
    app.config.from_object(config_obj)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    migrate.init_app(app, db, directory=str(MIGRATIONS_DIR))

    _bootstrap_filesystem(app)

    app.register_blueprint(ride_bp, url_prefix='/api')
    app.register_blueprint(driver_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')

    _register_static_routes(app)

    return app


def _bootstrap_filesystem(app: Flask) -> None:
    """Ensure required directories and database migrations are initialised."""

    STATIC_DIR.mkdir(parents=True, exist_ok=True)
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)

    with app.app_context():
        if not MIGRATIONS_DIR.exists():
            try:
                migrations_init(directory=str(MIGRATIONS_DIR))
            except RuntimeError as exc:  # Directory may already exist from another process
                app.logger.warning("Skipping migrations init: %s", exc)

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
