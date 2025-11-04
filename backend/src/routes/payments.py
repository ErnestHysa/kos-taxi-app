"""Stripe payment routes including webhook processing."""
from __future__ import annotations

from typing import Any, Dict

import stripe
from flask import Blueprint, current_app, jsonify, request

from src.models import Payment, db
from src.models.ride import Ride

payments_bp = Blueprint('payments', __name__)


def _configure_stripe() -> None:
    secret_key = current_app.config.get('STRIPE_SECRET_KEY')
    if secret_key:
        stripe.api_key = secret_key
    else:
        stripe.api_key = None
        current_app.logger.warning('STRIPE_SECRET_KEY missing; Stripe operations disabled.')


@payments_bp.route('/payments/config', methods=['GET'])
def get_payment_config():
    """Expose Stripe publishable key for the frontend."""

    publishable_key = current_app.config.get('STRIPE_PUBLISHABLE_KEY')
    configured = bool(current_app.config.get('STRIPE_SECRET_KEY') and publishable_key)
    return jsonify({
        'publishableKey': publishable_key,
        'configured': configured,
    }), 200


def _handle_payment_intent_event(intent_payload: Dict[str, Any]) -> None:
    payment_intent_id = intent_payload.get('id')
    if not payment_intent_id:
        current_app.logger.error('Received webhook without payment intent id')
        return

    payment = Payment.query.filter_by(stripe_payment_intent_id=payment_intent_id).first()
    if not payment:
        current_app.logger.warning('No payment record found for intent %s', payment_intent_id)
        return

    payment.update_from_intent(intent_payload)
    payment.status = intent_payload.get('status', payment.status)
    payment.client_secret = intent_payload.get('client_secret', payment.client_secret)
    ride = Ride.query.get(payment.ride_id)
    if ride:
        ride.payment_status = payment.status
        ride.payment_intent_id = payment.stripe_payment_intent_id
    db.session.commit()


@payments_bp.route('/payments/webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook callbacks to update payment state."""

    webhook_secret = current_app.config.get('STRIPE_WEBHOOK_SECRET')
    if not webhook_secret:
        current_app.logger.error('Stripe webhook secret not configured')
        return 'Webhook secret not configured', 400

    payload = request.data
    sig_header = request.headers.get('Stripe-Signature', '')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except ValueError:
        current_app.logger.error('Invalid payload received from Stripe webhook')
        return 'Invalid payload', 400
    except stripe.error.SignatureVerificationError:
        current_app.logger.error('Invalid Stripe webhook signature')
        return 'Invalid signature', 400

    event_type = event.get('type')
    intent_payload = event.get('data', {}).get('object', {})

    if event_type in {'payment_intent.succeeded', 'payment_intent.processing', 'payment_intent.payment_failed', 'payment_intent.canceled'}:
        _handle_payment_intent_event(intent_payload)
    else:
        current_app.logger.debug('Unhandled Stripe event type: %s', event_type)

    return jsonify({'received': True}), 200


@payments_bp.route('/payments/<int:ride_id>', methods=['GET'])
def get_payment_for_ride(ride_id: int):
    """Return payment information for a ride."""

    ride = Ride.query.get(ride_id)
    if not ride:
        return jsonify({'error': 'Ride not found'}), 404

    if not ride.payment:
        return jsonify({'payment': None, 'payment_status': ride.payment_status or 'pending'}), 200

    _configure_stripe()
    payment = ride.payment

    if stripe.api_key and (not payment.metadata_json or payment.metadata_json.get('provider') != 'placeholder'):
        try:
            intent = stripe.PaymentIntent.retrieve(payment.stripe_payment_intent_id)
            payment.update_from_intent(intent)
            payment.client_secret = intent.get('client_secret') or payment.client_secret
            ride.payment_status = payment.status
            ride.payment_intent_id = payment.stripe_payment_intent_id
            db.session.commit()
        except stripe.error.StripeError as exc:
            current_app.logger.exception('Unable to refresh payment intent %s', payment.stripe_payment_intent_id)
            return jsonify({'error': getattr(exc, 'user_message', str(exc))}), 502

    return jsonify({
        'payment': payment.to_dict(include_client_secret=True),
        'payment_status': payment.status,
    }), 200


__all__ = ['payments_bp']
