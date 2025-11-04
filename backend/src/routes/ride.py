import math
import stripe
from flask import Blueprint, request, jsonify, current_app
from src.models import db
from src.models.ride import Ride, PricingConfig

ride_bp = Blueprint('ride', __name__)

# Stripe configuration is sourced from the Flask app config at runtime.


def _configure_stripe():
    """Ensure the Stripe SDK is using the secret key from the app configuration."""
    secret_key = current_app.config.get('STRIPE_SECRET_KEY')
    if secret_key:
        stripe.api_key = secret_key
    else:
        stripe.api_key = None
        current_app.logger.warning('STRIPE_SECRET_KEY is not configured; payment routes may fail.')

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in kilometers using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def calculate_fare(distance_km):
    """Calculate fare based on distance and pricing configuration"""
    pricing = PricingConfig.query.first()
    if not pricing:
        # Create default pricing if not exists
        pricing = PricingConfig(base_fare=3.0, price_per_km=1.5)
        db.session.add(pricing)
        db.session.commit()
    
    fare = pricing.base_fare + (distance_km * pricing.price_per_km)
    return round(fare, 2)

@ride_bp.route('/rides/estimate', methods=['POST'])
def estimate_ride():
    """Estimate fare for a ride"""
    data = request.json
    
    try:
        pickup_lat = float(data['pickup_lat'])
        pickup_lon = float(data['pickup_lon'])
        dest_lat = float(data['dest_lat'])
        dest_lon = float(data['dest_lon'])
    except (KeyError, ValueError) as e:
        return jsonify({'error': 'Invalid coordinates'}), 400
    
    distance_km = haversine_distance(pickup_lat, pickup_lon, dest_lat, dest_lon)
    estimated_fare = calculate_fare(distance_km)
    
    return jsonify({
        'distance_km': round(distance_km, 2),
        'estimated_fare': estimated_fare
    }), 200

@ride_bp.route('/rides/request', methods=['POST'])
def request_ride():
    """Request a new ride"""
    data = request.json
    
    required_fields = ['email', 'phone', 'pickup_lat', 'pickup_lon', 'pickup_address', 
                      'dest_lat', 'dest_lon', 'dest_address']
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        distance_km = haversine_distance(
            float(data['pickup_lat']), float(data['pickup_lon']),
            float(data['dest_lat']), float(data['dest_lon'])
        )
        fare = calculate_fare(distance_km)
        
        ride = Ride(
            user_email=data['email'],
            user_phone=data['phone'],
            pickup_lat=float(data['pickup_lat']),
            pickup_lon=float(data['pickup_lon']),
            pickup_address=data['pickup_address'],
            dest_lat=float(data['dest_lat']),
            dest_lon=float(data['dest_lon']),
            dest_address=data['dest_address'],
            distance_km=round(distance_km, 2),
            fare=fare,
            status='pending'
        )
        
        db.session.add(ride)
        db.session.commit()
        
        return jsonify({
            'message': 'Ride requested successfully',
            'ride_id': ride.id,
            'fare': fare,
            'distance_km': round(distance_km, 2)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides/pending', methods=['GET'])
def get_pending_rides():
    """Get all pending ride requests"""
    try:
        rides = Ride.query.filter_by(status='pending').order_by(Ride.created_at.desc()).all()
        return jsonify({
            'rides': [ride.to_dict() for ride in rides]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides/<int:ride_id>', methods=['GET'])
def get_ride(ride_id):
    """Get details of a specific ride"""
    ride = Ride.query.get(ride_id)
    if not ride:
        return jsonify({'error': 'Ride not found'}), 404
    
    return jsonify(ride.to_dict()), 200

@ride_bp.route('/rides/<int:ride_id>/accept', methods=['POST'])
def accept_ride(ride_id):
    """Driver accepts a ride"""
    data = request.json
    driver_id = data.get('driver_id')
    
    if not driver_id:
        return jsonify({'error': 'Driver ID is required'}), 400
    
    ride = Ride.query.get(ride_id)
    if not ride:
        return jsonify({'error': 'Ride not found'}), 404
    
    if ride.status != 'pending':
        return jsonify({'error': 'Ride is not available'}), 400
    
    try:
        ride.driver_id = driver_id
        ride.status = 'accepted'
        db.session.commit()
        
        return jsonify({
            'message': 'Ride accepted successfully',
            'ride': ride.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides/<int:ride_id>/complete', methods=['POST'])
def complete_ride(ride_id):
    """Mark a ride as completed"""
    ride = Ride.query.get(ride_id)
    if not ride:
        return jsonify({'error': 'Ride not found'}), 404
    
    if ride.status not in ['accepted', 'in_progress']:
        return jsonify({'error': 'Ride cannot be completed'}), 400
    
    try:
        ride.status = 'completed'
        db.session.commit()
        
        return jsonify({
            'message': 'Ride completed successfully',
            'ride': ride.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides/<int:ride_id>/cancel', methods=['POST'])
def cancel_ride(ride_id):
    """Cancel a ride"""
    ride = Ride.query.get(ride_id)
    if not ride:
        return jsonify({'error': 'Ride not found'}), 404
    
    if ride.status in ['completed', 'cancelled']:
        return jsonify({'error': 'Ride cannot be cancelled'}), 400
    
    try:
        ride.status = 'cancelled'
        db.session.commit()
        
        return jsonify({
            'message': 'Ride cancelled successfully',
            'ride': ride.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides/<int:ride_id>/payment-intent', methods=['POST'])
def create_payment_intent(ride_id):
    """Create a Stripe payment intent for a ride"""
    _configure_stripe()
    ride = Ride.query.get(ride_id)
    if not ride:
        return jsonify({'error': 'Ride not found'}), 404
    
    if ride.payment_intent_id:
        return jsonify({'error': 'Payment intent already exists'}), 400
    
    try:
        # Create a payment intent with Stripe
        intent = stripe.PaymentIntent.create(
            amount=int(ride.fare * 100),  # Amount in cents
            currency='eur',
            metadata={
                'ride_id': ride.id,
                'user_email': ride.user_email
            },
            description=f'Ride from {ride.pickup_address} to {ride.dest_address}'
        )
        
        ride.payment_intent_id = intent.id
        db.session.commit()
        
        return jsonify({
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id
        }), 200
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/rides/<int:ride_id>/payment-status', methods=['GET'])
def get_payment_status(ride_id):
    """Get payment status for a ride"""
    _configure_stripe()
    ride = Ride.query.get(ride_id)
    if not ride:
        return jsonify({'error': 'Ride not found'}), 404
    
    if not ride.payment_intent_id:
        return jsonify({'payment_status': 'pending'}), 200
    
    try:
        intent = stripe.PaymentIntent.retrieve(ride.payment_intent_id)
        ride.payment_status = intent.status
        db.session.commit()
        
        return jsonify({
            'payment_status': intent.status,
            'amount': intent.amount / 100
        }), 200
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/pricing', methods=['GET'])
def get_pricing():
    """Get current pricing configuration"""
    pricing = PricingConfig.query.first()
    if not pricing:
        pricing = PricingConfig(base_fare=3.0, price_per_km=1.5)
        db.session.add(pricing)
        db.session.commit()
    
    return jsonify(pricing.to_dict()), 200

@ride_bp.route('/pricing', methods=['PUT'])
def update_pricing():
    """Update pricing configuration"""
    data = request.json
    
    pricing = PricingConfig.query.first()
    if not pricing:
        pricing = PricingConfig()
        db.session.add(pricing)
    
    if 'base_fare' in data:
        pricing.base_fare = float(data['base_fare'])
    if 'price_per_km' in data:
        pricing.price_per_km = float(data['price_per_km'])
    
    try:
        db.session.commit()
        return jsonify(pricing.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
