"""Administrative data endpoints for internal dashboards."""
from __future__ import annotations

from typing import Optional

from flask import Blueprint, jsonify, request
from sqlalchemy import func

from src.models import Payment, db
from src.models.driver import Driver
from src.models.ride import Ride

admin_bp = Blueprint('admin', __name__)


def _apply_filters(query, ride_status: Optional[str], payment_status: Optional[str], driver_id: Optional[int]):
    if ride_status and ride_status.lower() != 'all':
        query = query.filter(Ride.status == ride_status)
    if payment_status and payment_status.lower() != 'all':
        if payment_status == 'unpaid':
            query = query.filter((Ride.payment == None) | (Payment.status != 'succeeded'))  # noqa: E711
        else:
            query = query.join(Payment, isouter=True).filter(Payment.status == payment_status)
    if driver_id and driver_id > 0:
        query = query.filter(Ride.driver_id == driver_id)
    return query


@admin_bp.route('/admin/overview', methods=['GET'])
def admin_overview():
    """Return ride, driver and payment summaries for admin dashboards."""

    ride_status = request.args.get('ride_status')
    payment_status = request.args.get('payment_status')
    driver_id = request.args.get('driver_id', type=int)

    ride_query = Ride.query
    ride_query = _apply_filters(ride_query, ride_status, payment_status, driver_id)
    rides = ride_query.order_by(Ride.created_at.desc()).limit(200).all()

    drivers = Driver.query.order_by(Driver.created_at.desc()).all()

    payment_query = Payment.query.join(Ride)
    if payment_status and payment_status.lower() != 'all':
        payment_query = payment_query.filter(Payment.status == payment_status)
    payments = payment_query.order_by(Payment.created_at.desc()).limit(200).all()

    totals = {
        'rides_total': Ride.query.count(),
        'rides_pending': Ride.query.filter_by(status='pending').count(),
        'rides_completed': Ride.query.filter_by(status='completed').count(),
        'payments_succeeded': Payment.query.filter_by(status='succeeded').count(),
        'payments_failed': Payment.query.filter(Payment.status != 'succeeded').count(),
        'drivers_total': Driver.query.count(),
    }

    revenue = (
        db.session.query(func.coalesce(func.sum(Payment.amount), 0)).filter(Payment.status == 'succeeded').scalar() or 0
    )
    totals['revenue_eur'] = round(revenue / 100, 2)

    response = {
        'filters': {
            'ride_status': ride_status or 'all',
            'payment_status': payment_status or 'all',
            'driver_id': driver_id or 0,
        },
        'rides': [ride.to_dict() for ride in rides],
        'drivers': [driver.to_dict() for driver in drivers],
        'payments': [payment.to_dict(include_client_secret=False) for payment in payments],
        'totals': totals,
    }
    return jsonify(response), 200


__all__ = ['admin_bp']
