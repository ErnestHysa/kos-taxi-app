from datetime import datetime
from typing import TYPE_CHECKING, Optional

from . import db

if TYPE_CHECKING:  # pragma: no cover - import for typing only
    from .payment import Payment


class Ride(db.Model):
    __tablename__ = 'rides'

    id = db.Column(db.Integer, primary_key=True)
    rider_name = db.Column(db.String(120), nullable=True)
    user_email = db.Column(db.String(120), nullable=True)
    user_phone = db.Column(db.String(20), nullable=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'), nullable=True)

    pickup_lat = db.Column(db.Float, nullable=True)
    pickup_lon = db.Column(db.Float, nullable=True)
    pickup_address = db.Column(db.String(200), nullable=False)

    dest_lat = db.Column(db.Float, nullable=True)
    dest_lon = db.Column(db.Float, nullable=True)
    dest_address = db.Column(db.String(200), nullable=False)

    status = db.Column(db.String(20), default='pending')  # pending, accepted, in_progress, completed, cancelled
    fare = db.Column(db.Float, nullable=False)
    distance_km = db.Column(db.Float, nullable=False)
    estimated_duration_minutes = db.Column(db.Integer, nullable=False, default=10)
    passenger_count = db.Column(db.Integer, nullable=False, default=1)
    scheduled_time = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.String(500), nullable=True)

    payment_intent_id = db.Column(db.String(100), nullable=True)
    payment_status = db.Column(db.String(20), default='pending')  # pending, succeeded, failed

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payment = db.relationship(
        'Payment',
        back_populates='ride',
        uselist=False,
        cascade='all, delete-orphan',
        single_parent=True,
    )

    def to_dict(self, *, include_payment: bool = True) -> dict:
        payment: Optional['Payment'] = self.payment
        payment_status = payment.status if payment else self.payment_status
        payment_intent_id = payment.stripe_payment_intent_id if payment else self.payment_intent_id
        payload = {
            'id': self.id,
            'rider_name': self.rider_name,
            'user_email': self.user_email,
            'user_phone': self.user_phone,
            'driver_id': self.driver_id,
            'pickup_lat': self.pickup_lat,
            'pickup_lon': self.pickup_lon,
            'pickup_address': self.pickup_address,
            'dest_lat': self.dest_lat,
            'dest_lon': self.dest_lon,
            'dest_address': self.dest_address,
            'dropoff_address': self.dest_address,
            'destination_address': self.dest_address,
            'status': self.status,
            'fare': self.fare,
            'distance_km': self.distance_km,
            'estimated_duration_minutes': self.estimated_duration_minutes,
            'passenger_count': self.passenger_count,
            'scheduled_time': self.scheduled_time.isoformat() if self.scheduled_time else None,
            'notes': self.notes,
            'payment_intent_id': payment_intent_id,
            'payment_status': payment_status,
            'customer_phone': self.user_phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_payment:
            payload['payment'] = payment.to_dict(include_client_secret=False) if payment else None
        return payload


class PricingConfig(db.Model):
    __tablename__ = 'pricing_config'

    id = db.Column(db.Integer, primary_key=True)
    base_fare = db.Column(db.Float, default=3.0)  # Base fare in EUR
    price_per_km = db.Column(db.Float, default=1.5)  # Price per kilometer in EUR
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'base_fare': self.base_fare,
            'price_per_km': self.price_per_km,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
