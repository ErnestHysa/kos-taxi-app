from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional, Tuple
from uuid import uuid4

import stripe
from flask import Blueprint, current_app, jsonify, request

from src.models import Payment, db
from src.models.ride import PricingConfig, Ride
from src.services import (
    estimate_distance_km,
    estimate_duration_minutes,
    get_notification_service,
)

ride_bp = Blueprint('ride', __name__)


# Stripe configuration is sourced from the Flask app config at runtime.

def _configure_stripe() -> None:
    """Ensure the Stripe SDK is using the secret key from the app configuration."""

    secret_key = current_app.config.get('STRIPE_SECRET_KEY')
    if secret_key:
        stripe.api_key = secret_key
    else:
        stripe.api_key = None
        current_app.logger.warning('STRIPE_SECRET_KEY is not configured; payment routes may fail.')


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


def _parse_iso_datetime(value: str) -> datetime:
    if value.endswith('Z'):
        value = value[:-1] + '+00:00'
    return datetime.fromisoformat(value)


def _extract_string(data: Dict[str, Any], *keys: str) -> str:
    for key in keys:
        value = data.get(key)
        if isinstance(value, str):
            return value.strip()
    return ''


def _extract_passenger_count(data: Dict[str, Any]) -> int:
    raw_value = data.get('passenger_count', data.get('passengerCount', 1))
    try:
        count = int(raw_value)
    except (TypeError, ValueError):
        raise ValueError('Passenger count must be a whole number.') from None
    if count < 1:
        raise ValueError('Passenger count must be at least 1.')
    return count


def _prepare_ride_payload(data: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, str]]:
    errors: Dict[str, str] = {}

    pickup_address = _extract_string(data, 'pickup_address', 'pickupAddress')
    dropoff_address = _extract_string(data, 'dropoff_address', 'dropoffAddress', 'destination_address')
    scheduled_raw = _extract_string(data, 'scheduled_time', 'scheduledTime')
    rider_name = _extract_string(data, 'rider_name', 'riderName')
    rider_email = _extract_string(data, 'email', 'rider_email', 'riderEmail')
    rider_phone = _extract_string(data, 'phone', 'rider_phone', 'riderPhone')
    notes = _extract_string(data, 'notes')

    if not pickup_address:
        errors['pickup_address'] = 'Pickup address is required.'
    if not dropoff_address:
        errors['dropoff_address'] = 'Drop-off address is required.'

    try:
        passenger_count = _extract_passenger_count(data)
    except ValueError as exc:
        errors['passenger_count'] = str(exc)
        passenger_count = 1

    scheduled_time = None
    if scheduled_raw:
        try:
            scheduled_time = _parse_iso_datetime(scheduled_raw)
        except ValueError:
            errors['scheduled_time'] = 'Scheduled time must be an ISO formatted date string.'
    else:
        errors['scheduled_time'] = 'Scheduled time is required.'

    if not rider_email and not rider_phone:
        errors['contact'] = 'Provide at least an email or phone number so drivers can reach you.'

    payload = {
        'pickup_address': pickup_address,
        'dropoff_address': dropoff_address,
        'scheduled_time': scheduled_time,
        'passenger_count': passenger_count,
        'rider_name': rider_name or None,
        'rider_email': rider_email or None,
        'rider_phone': rider_phone or None,
        'notes': notes or None,
    }

    return payload, errors


def _create_ride(payload: Dict[str, Any]) -> Tuple[Ride, Dict[str, Any]]:
    distance_km = estimate_distance_km(payload['pickup_address'], payload['dropoff_address'])
    duration_minutes = estimate_duration_minutes(
        distance_km,
        scheduled_time=payload['scheduled_time'],
        passenger_count=payload['passenger_count'],
    )
    fare = calculate_fare(distance_km)

    ride = Ride(
        rider_name=payload['rider_name'],
        user_email=payload['rider_email'],
        user_phone=payload['rider_phone'],
        pickup_address=payload['pickup_address'],
        dest_address=payload['dropoff_address'],
        scheduled_time=payload['scheduled_time'],
        passenger_count=payload['passenger_count'],
        notes=payload['notes'],
        distance_km=round(distance_km, 2),
        estimated_duration_minutes=duration_minutes,
        fare=fare,
        status='pending',
    )

    db.session.add(ride)
    db.session.commit()

    estimate = {
        'distanceKm': round(distance_km, 2),
        'durationMinutes': duration_minutes,
        'fare': fare,
    }

    return ride, estimate


def _build_payment_metadata(ride: Ride) -> Dict[str, Any]:
    return {
        'ride_id': ride.id,
        'rider_name': ride.rider_name or '',
        'pickup_address': ride.pickup_address,
        'dropoff_address': ride.dest_address,
    }


def _create_payment_intent_for_ride(ride: Ride) -> Tuple[Optional[Payment], Optional[Dict[str, Any]], Optional[str]]:
    """Create (or reuse) a Stripe payment intent for the ride."""

    if ride.payment:
        return ride.payment, None, None

    _configure_stripe()
    amount_cents = int(round(ride.fare * 100))
    metadata = _build_payment_metadata(ride)

    if not stripe.api_key:
        placeholder_id = f"pi_{uuid4().hex[:20]}"
        client_secret = f"{placeholder_id}_secret_placeholder"
        metadata_with_provider = {**metadata, 'provider': 'placeholder'}
        payment = Payment(
            ride_id=ride.id,
            stripe_payment_intent_id=placeholder_id,
            client_secret=client_secret,
            status='requires_payment_method',
            amount=amount_cents,
            currency='eur',
            metadata=metadata_with_provider,
            customer_email=ride.user_email,
            customer_phone=ride.user_phone,
        )
        ride.payment = payment
        ride.payment_intent_id = placeholder_id
        ride.payment_status = payment.status
        db.session.add(payment)
        db.session.commit()
        return payment, {
            'placeholder': True,
            'message': 'Stripe not configured. Returning placeholder payment intent.',
        }, None

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='eur',
            metadata=metadata,
            automatic_payment_methods={'enabled': True},
            description=f'Ride from {ride.pickup_address} to {ride.dest_address}',
            receipt_email=ride.user_email,
        )
        payment = Payment.from_intent(
            ride_id=ride.id,
            intent=intent,
            client_secret=intent.get('client_secret'),
            email=ride.user_email,
            phone=ride.user_phone,
        )
        ride.payment = payment
        ride.payment_intent_id = payment.stripe_payment_intent_id
        ride.payment_status = payment.status
        db.session.add(payment)
        db.session.commit()
        return payment, None, None
    except stripe.error.StripeError as exc:
        db.session.rollback()
        current_app.logger.exception('Failed to create Stripe payment intent: %s', exc)
        return None, None, getattr(exc, 'user_message', str(exc))
    except Exception as exc:  # pragma: no cover - defensive
        db.session.rollback()
        current_app.logger.exception('Unexpected error creating payment intent')
        return None, None, str(exc)


@ride_bp.route('/rides/estimate', methods=['POST'])
def estimate_ride():
    """Estimate ride metrics based on pickup/drop-off addresses."""
    data = request.get_json(silent=True) or {}
    payload, errors = _prepare_ride_payload(data)

    # Only care about address/time/passenger validation here
    for key in ['rider_name', 'rider_email', 'rider_phone', 'notes', 'contact']:
        errors.pop(key, None)

    if errors:
        return jsonify({'error': 'Invalid ride request', 'details': errors}), 400

    distance_km = estimate_distance_km(payload['pickup_address'], payload['dropoff_address'])
    duration_minutes = estimate_duration_minutes(
        distance_km,
        scheduled_time=payload['scheduled_time'],
        passenger_count=payload['passenger_count'],
    )
    estimated_fare = calculate_fare(distance_km)

    return jsonify({
        'distanceKm': round(distance_km, 2),
        'durationMinutes': duration_minutes,
        'fare': estimated_fare,
    }), 200


@ride_bp.route('/rides', methods=['POST'])
def create_ride_request():
    """Create and persist a new ride booking."""
    data = request.get_json(silent=True) or {}
    payload, errors = _prepare_ride_payload(data)

    if errors:
        return jsonify({'error': 'Invalid ride request', 'details': errors}), 400

    try:
        ride, estimate = _create_ride(payload)
    except Exception as exc:  # pragma: no cover - handled generically
        db.session.rollback()
        current_app.logger.exception('Failed to create ride request')
        return jsonify({'error': 'Unable to create ride request', 'message': str(exc)}), 500

    payment_payload: Optional[Dict[str, Any]] = None
    payment_error: Optional[str] = None
    payment, additional_info, payment_error = _create_payment_intent_for_ride(ride)
    if payment:
        payment_payload = payment.to_dict(include_client_secret=True)
        if additional_info:
            payment_payload.update(additional_info)
    elif payment_error:
        current_app.logger.warning('Ride created without payment intent: %s', payment_error)

    response = {
        'message': 'Ride requested successfully',
        'ride': ride.to_dict(),
        'estimate': estimate,
        'payment': payment_payload,
        'payment_error': payment_error,
        'publishable_key': current_app.config.get('STRIPE_PUBLISHABLE_KEY'),
    }

    notification_context = {
        'estimate': estimate,
        'payment': payment_payload,
    }
    try:
        get_notification_service().notify_ride_status(ride, 'created', notification_context)
    except Exception as exc:  # pragma: no cover - notifications shouldn't fail the request
        current_app.logger.exception('Failed to dispatch ride creation notifications: %s', exc)

    return jsonify(response), 201


@ride_bp.route('/rides/request', methods=['POST'])
def request_ride():
    """Legacy endpoint that proxies to the new ride creation flow."""
    return create_ride_request()


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
        get_notification_service().notify_ride_status(ride, 'accepted')
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
        get_notification_service().notify_ride_status(ride, 'completed')

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
        get_notification_service().notify_ride_status(ride, 'cancelled')

        return jsonify({
            'message': 'Ride cancelled successfully',
            'ride': ride.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@ride_bp.route('/rides/<int:ride_id>/payment-intent', methods=['POST'])
def create_payment_intent(ride_id):
    """(Re)create a Stripe payment intent for a ride"""
    ride = Ride.query.get(ride_id)
    if not ride:
        return jsonify({'error': 'Ride not found'}), 404

    if ride.payment and ride.payment.client_secret:
        payload = ride.payment.to_dict(include_client_secret=True)
        return jsonify(payload), 200

    payment, additional_info, payment_error = _create_payment_intent_for_ride(ride)
    if payment:
        payload = payment.to_dict(include_client_secret=True)
        if additional_info:
            payload.update(additional_info)
        return jsonify(payload), 200

    return jsonify({'error': payment_error or 'Unable to create payment intent'}), 500


@ride_bp.route('/rides/<int:ride_id>/payment-status', methods=['GET'])
def get_payment_status(ride_id):
    """Get payment status for a ride"""
    ride = Ride.query.get(ride_id)
    if not ride:
        return jsonify({'error': 'Ride not found'}), 404

    payment = ride.payment
    if not payment:
        return jsonify({'payment_status': ride.payment_status or 'pending'}), 200

    _configure_stripe()
    if stripe.api_key and (not payment.metadata_json or payment.metadata_json.get('provider') != 'placeholder'):
        try:
            intent = stripe.PaymentIntent.retrieve(payment.stripe_payment_intent_id)
            payment.update_from_intent(intent)
            payment.client_secret = intent.get('client_secret') or payment.client_secret
            ride.payment_status = payment.status
            ride.payment_intent_id = payment.stripe_payment_intent_id
            db.session.commit()
        except stripe.error.StripeError as exc:
            current_app.logger.exception('Failed to refresh payment intent %s: %s', payment.stripe_payment_intent_id, exc)
            return jsonify({'error': getattr(exc, 'user_message', str(exc))}), 502

    return jsonify({
        'payment_status': payment.status,
        'payment': payment.to_dict(include_client_secret=False)
    }), 200


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
