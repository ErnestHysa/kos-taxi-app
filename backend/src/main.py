"""Entrypoint for running the Kos Taxi Flask application."""

import os
import sys

# Ensure the src package is importable when running as a script.
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.app import create_app

app = create_app()


if __name__ == '__main__':
    host = os.environ.get('FLASK_RUN_HOST', '0.0.0.0')
    port = int(os.environ.get('FLASK_RUN_PORT', 5000))
    debug = app.config.get('DEBUG', False)
    app.run(host=host, port=port, debug=debug)
