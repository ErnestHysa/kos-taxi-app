"""Driver model definition with authentication helpers."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from passlib.context import CryptContext

from . import db

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Driver(db.Model):
    """Represents a driver that can accept ride requests."""

    __tablename__ = "drivers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    vehicle_model = db.Column(db.String(100), nullable=False)
    vehicle_plate = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    current_lat = db.Column(db.Float, nullable=True)
    current_lon = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = db.Column(db.DateTime, nullable=True)

    rides = db.relationship("Ride", backref="driver", lazy=True)

    def set_password(self, password: str) -> None:
        """Hash and store the provided password."""

        self.password_hash = _pwd_context.hash(password)

    def check_password(self, password: str) -> bool:
        """Verify the provided password against the stored hash."""

        if not self.password_hash:
            return False
        return _pwd_context.verify(password, self.password_hash)

    def to_dict(self) -> Dict[str, Any]:
        """Serialise the driver to a dictionary, excluding sensitive fields."""

        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "vehicle_model": self.vehicle_model,
            "vehicle_plate": self.vehicle_plate,
            "is_available": self.is_available,
            "current_lat": self.current_lat,
            "current_lon": self.current_lon,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
        }


__all__ = ["Driver"]
