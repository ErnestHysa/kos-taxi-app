"""Payment model representing Stripe transactions for rides."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from . import db


class Payment(db.Model):
    """Persisted record of a Stripe payment intent linked to a ride."""

    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    ride_id = db.Column(db.Integer, db.ForeignKey("rides.id"), nullable=False, unique=True)
    stripe_payment_intent_id = db.Column(db.String(120), nullable=False, index=True)
    client_secret = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), nullable=False, default="requires_payment_method")
    amount = db.Column(db.Integer, nullable=False)  # Stored in the smallest currency unit (e.g. cents)
    currency = db.Column(db.String(10), nullable=False, default="eur")
    metadata_json = db.Column("metadata", db.JSON, nullable=True)
    customer_email = db.Column(db.String(120), nullable=True)
    customer_phone = db.Column(db.String(30), nullable=True)
    last_error = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    ride = db.relationship("Ride", back_populates="payment")

    @property
    def amount_eur(self) -> float:
        """Return the amount in major currency units rounded to two decimals."""

        return round(self.amount / 100, 2)

    def update_from_intent(self, intent: Dict[str, Any]) -> None:
        """Synchronise the payment record with the latest Stripe intent payload."""

        self.status = intent.get("status", self.status)
        self.metadata_json = intent.get("metadata") or self.metadata_json
        charges = intent.get("charges", {})
        if isinstance(charges, dict):
            last_charge = (charges.get("data") or [])[-1] if charges.get("data") else None
            if isinstance(last_charge, dict):
                failure_message = last_charge.get("failure_message")
                self.last_error = failure_message or self.last_error
        self.customer_email = intent.get("receipt_email") or self.customer_email
        self.customer_phone = intent.get("shipping", {}).get("phone") if intent.get("shipping") else self.customer_phone

    def to_dict(self, include_client_secret: bool = False) -> Dict[str, Any]:
        """Serialise the payment for API responses."""

        payload: Dict[str, Any] = {
            "id": self.id,
            "ride_id": self.ride_id,
            "payment_intent_id": self.stripe_payment_intent_id,
            "status": self.status,
            "amount": self.amount,
            "amount_eur": self.amount_eur,
            "currency": self.currency,
            "metadata": self.metadata_json or {},
            "customer_email": self.customer_email,
            "customer_phone": self.customer_phone,
            "last_error": self.last_error,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_client_secret:
            payload["client_secret"] = self.client_secret
        return payload

    @classmethod
    def from_intent(
        cls,
        ride_id: int,
        intent: Dict[str, Any],
        *,
        client_secret: Optional[str],
        email: Optional[str],
        phone: Optional[str],
    ) -> "Payment":
        """Create a payment model instance from a Stripe intent payload."""

        return cls(
            ride_id=ride_id,
            stripe_payment_intent_id=intent["id"],
            client_secret=client_secret,
            status=intent.get("status", "requires_payment_method"),
            amount=int(intent.get("amount", 0)),
            currency=intent.get("currency", "eur"),
            metadata_json=intent.get("metadata"),
            customer_email=email,
            customer_phone=phone,
        )


__all__ = ["Payment"]
