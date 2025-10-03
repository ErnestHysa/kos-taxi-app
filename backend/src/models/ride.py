from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Ride(db.Model):
    __tablename__ = 'rides'
    
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), nullable=False)
    user_phone = db.Column(db.String(20), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'), nullable=True)
    
    pickup_lat = db.Column(db.Float, nullable=False)
    pickup_lon = db.Column(db.Float, nullable=False)
    pickup_address = db.Column(db.String(200), nullable=False)
    
    dest_lat = db.Column(db.Float, nullable=False)
    dest_lon = db.Column(db.Float, nullable=False)
    dest_address = db.Column(db.String(200), nullable=False)
    
    status = db.Column(db.String(20), default='pending')  # pending, accepted, in_progress, completed, cancelled
    fare = db.Column(db.Float, nullable=False)
    distance_km = db.Column(db.Float, nullable=False)
    
    payment_intent_id = db.Column(db.String(100), nullable=True)
    payment_status = db.Column(db.String(20), default='pending')  # pending, succeeded, failed
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_email': self.user_email,
            'user_phone': self.user_phone,
            'driver_id': self.driver_id,
            'pickup_lat': self.pickup_lat,
            'pickup_lon': self.pickup_lon,
            'pickup_address': self.pickup_address,
            'dest_lat': self.dest_lat,
            'dest_lon': self.dest_lon,
            'dest_address': self.dest_address,
            'status': self.status,
            'fare': self.fare,
            'distance_km': self.distance_km,
            'payment_intent_id': self.payment_intent_id,
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Driver(db.Model):
    __tablename__ = 'drivers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    vehicle_model = db.Column(db.String(100), nullable=False)
    vehicle_plate = db.Column(db.String(20), nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    current_lat = db.Column(db.Float, nullable=True)
    current_lon = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    rides = db.relationship('Ride', backref='driver', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'vehicle_model': self.vehicle_model,
            'vehicle_plate': self.vehicle_plate,
            'is_available': self.is_available,
            'current_lat': self.current_lat,
            'current_lon': self.current_lon,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


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
