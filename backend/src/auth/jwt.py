"""Utility helpers for creating and validating JWTs."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict

import jwt
from flask import current_app


class TokenError(Exception):
    """Base class for token related errors."""


class InvalidTokenError(TokenError):
    """Raised when a token is invalid or malformed."""


class ExpiredTokenError(TokenError):
    """Raised when a token has expired."""


def _get_secret() -> str:
    secret = current_app.config.get("JWT_SECRET_KEY")
    if not secret:
        raise RuntimeError("JWT_SECRET_KEY is not configured")
    return secret


def _encode_token(payload: Dict[str, Any]) -> str:
    return jwt.encode(payload, _get_secret(), algorithm="HS256")


def _decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, _get_secret(), algorithms=["HS256"])
    except jwt.ExpiredSignatureError as exc:  # pragma: no cover - library detail
        raise ExpiredTokenError("Token has expired") from exc
    except jwt.PyJWTError as exc:  # pragma: no cover - library detail
        raise InvalidTokenError("Invalid token") from exc


def create_token(subject: int, token_type: str, expires_in: int) -> str:
    """Create a signed JWT for the given subject."""

    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "type": token_type,
        "iat": now,
        "exp": now + timedelta(seconds=expires_in),
    }
    return _encode_token(payload)


def create_access_token(subject: int) -> str:
    """Create an access token for the given subject."""

    expires_in = int(current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES", 15 * 60))
    return create_token(subject, "access", expires_in)


def create_refresh_token(subject: int) -> str:
    """Create a refresh token for the given subject."""

    expires_in = int(current_app.config.get("JWT_REFRESH_TOKEN_EXPIRES", 7 * 24 * 60 * 60))
    return create_token(subject, "refresh", expires_in)


def decode_token(token: str, expected_type: str | None = None) -> Dict[str, Any]:
    """Decode a token and optionally validate its type."""

    payload = _decode_token(token)
    if expected_type and payload.get("type") != expected_type:
        raise InvalidTokenError("Invalid token type")
    return payload


__all__ = [
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    "InvalidTokenError",
    "ExpiredTokenError",
]
