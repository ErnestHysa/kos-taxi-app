import pytest

from src.app import create_app, db
from src.config import Config


@pytest.fixture
def app(tmp_path):
    """Create a Flask app instance configured for testing."""

    database_path = tmp_path / "test.db"

    class TestConfig(Config):
        TESTING = True
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{database_path}"
        STRIPE_SECRET_KEY = None
        STRIPE_PUBLISHABLE_KEY = None
        LOG_LEVEL = "DEBUG"
        SENTRY_DSN = None

    app = create_app(TestConfig)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()
