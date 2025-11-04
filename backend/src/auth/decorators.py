"""Authentication decorators for protecting routes."""
from __future__ import annotations

from functools import wraps
from typing import Any, Callable, TypeVar, cast

from flask import Response, g, jsonify, request

from src.models.driver import Driver

from .jwt import ExpiredTokenError, InvalidTokenError, decode_token

F = TypeVar("F", bound=Callable[..., Any])


class AuthenticationError(Exception):
    """Raised when authentication fails."""


def jwt_required(fn: F) -> F:
    """Ensure that the request carries a valid bearer token."""

    @wraps(fn)
    def wrapper(*args: Any, **kwargs: Any):  # type: ignore[misc]
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return jsonify({"error": "Authorization token missing"}), 401

        try:
            payload = decode_token(token, expected_type="access")
        except ExpiredTokenError:
            return jsonify({"error": "Access token expired"}), 401
        except InvalidTokenError:
            return jsonify({"error": "Invalid access token"}), 401

        driver_id = payload.get("sub")
        driver = Driver.query.get(int(driver_id)) if driver_id is not None else None
        if not driver:
            return jsonify({"error": "Driver not found"}), 401

        g.current_driver = driver
        return fn(*args, **kwargs)

    return cast(F, wrapper)


__all__ = ["jwt_required", "AuthenticationError"]
