"""Authentication blueprint providing driver login and signup endpoints."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict

from flask import Blueprint, current_app, jsonify, request
from sqlalchemy.exc import IntegrityError

from src.models import db
from src.models.driver import Driver

from .jwt import (
    ExpiredTokenError,
    InvalidTokenError,
    create_access_token,
    create_refresh_token,
    decode_token,
)


auth_bp = Blueprint("auth", __name__)


def _normalise_email(value: str) -> str:
    return value.strip().lower()


def _serialise_driver(driver: Driver) -> Dict[str, object]:
    return driver.to_dict()


def _token_response(driver: Driver) -> Dict[str, object]:
    access_token = create_access_token(driver.id)
    refresh_token = create_refresh_token(driver.id)
    expires_in = int(current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES", 15 * 60))
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
        "expires_in": expires_in,
        "driver": _serialise_driver(driver),
    }


@auth_bp.route("/auth/driver/signup", methods=["POST"])
def driver_signup() -> tuple:
    """Register a driver account and issue tokens."""

    data = request.json or {}
    required_fields = [
        "name",
        "email",
        "password",
        "phone",
        "vehicle_model",
        "vehicle_plate",
    ]
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return (
            jsonify({"error": f"Missing required fields: {', '.join(missing)}"}),
            400,
        )

    driver = Driver(
        name=data["name"].strip(),
        email=_normalise_email(data["email"]),
        phone=data["phone"].strip(),
        vehicle_model=data["vehicle_model"].strip(),
        vehicle_plate=data["vehicle_plate"].strip(),
        is_available=True,
    )
    driver.set_password(data["password"])

    try:
        db.session.add(driver)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Driver with this email already exists"}), 400
    except Exception as exc:  # pragma: no cover - defensive
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500

    return jsonify(_token_response(driver)), 201


@auth_bp.route("/auth/driver/login", methods=["POST"])
def driver_login() -> tuple:
    """Authenticate a driver and return access credentials."""

    data = request.json or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    driver = Driver.query.filter_by(email=_normalise_email(email)).first()
    if not driver or not driver.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    driver.last_login_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify(_token_response(driver)), 200


@auth_bp.route("/auth/driver/refresh", methods=["POST"])
def refresh_token() -> tuple:
    """Refresh an access token using a valid refresh token."""

    data = request.json or {}
    refresh_token_value = data.get("refresh_token")
    if not refresh_token_value:
        return jsonify({"error": "Refresh token is required"}), 400

    try:
        payload = decode_token(refresh_token_value, expected_type="refresh")
    except ExpiredTokenError:
        return jsonify({"error": "Refresh token expired"}), 401
    except InvalidTokenError:
        return jsonify({"error": "Invalid refresh token"}), 401

    driver_id = payload.get("sub")
    driver = Driver.query.get(int(driver_id)) if driver_id is not None else None
    if not driver:
        return jsonify({"error": "Driver not found"}), 401

    access_token = create_access_token(driver.id)
    new_refresh_token = create_refresh_token(driver.id)
    expires_in = int(current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES", 15 * 60))

    return (
        jsonify(
            {
                "access_token": access_token,
                "refresh_token": new_refresh_token,
                "token_type": "Bearer",
                "expires_in": expires_in,
            }
        ),
        200,
    )


@auth_bp.route("/auth/driver/logout", methods=["POST"])
def driver_logout() -> tuple:
    """Stateless logout endpoint to allow clients to clear credentials."""

    return jsonify({"message": "Logged out"}), 200


__all__ = ["auth_bp"]
