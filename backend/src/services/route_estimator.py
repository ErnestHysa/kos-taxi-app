"""Utilities for estimating ride distances and travel durations."""

from __future__ import annotations

import hashlib
import math
from datetime import datetime

_MIN_DISTANCE_KM = 1.2
_MAX_DISTANCE_KM = 65.0
_AVERAGE_SPEED_KMH = 35.0
_RUSH_HOURS = {(7, 9), (16, 19)}


def _normalise_address(value: str) -> str:
    return ''.join(ch for ch in value.lower() if ch.isalnum())


def _address_signature(address: str) -> int:
    normalised = _normalise_address(address)
    if not normalised:
        return 0

    digest = hashlib.sha1(normalised.encode('utf-8')).hexdigest()
    return int(digest[:12], 16)


def estimate_distance_km(pickup_address: str, dropoff_address: str) -> float:
    """Estimate a deterministic pseudo-distance in kilometres between two addresses."""
    if not pickup_address or not dropoff_address:
        raise ValueError('Pickup and drop-off addresses are required for estimation.')

    if pickup_address.strip().lower() == dropoff_address.strip().lower():
        return _MIN_DISTANCE_KM

    signature_delta = abs(_address_signature(pickup_address) - _address_signature(dropoff_address))
    scaled = (signature_delta % 50000) / 900  # keep the range compact and deterministic
    distance = _MIN_DISTANCE_KM + scaled
    return round(min(_MAX_DISTANCE_KM, max(_MIN_DISTANCE_KM, distance)), 2)


def _traffic_multiplier(scheduled_time: datetime | None) -> float:
    if not scheduled_time:
        return 1.0

    hour = scheduled_time.hour
    for start, end in _RUSH_HOURS:
        if start <= hour <= end:
            return 1.25
    return 1.0


def estimate_duration_minutes(
    distance_km: float,
    *,
    scheduled_time: datetime | None = None,
    passenger_count: int = 1,
) -> int:
    """Estimate travel duration in minutes, adjusting for traffic and passenger loading."""
    if distance_km <= 0:
        distance_km = _MIN_DISTANCE_KM

    base_minutes = (distance_km / _AVERAGE_SPEED_KMH) * 60
    traffic_minutes = base_minutes * _traffic_multiplier(scheduled_time)
    passenger_buffer = max(0, passenger_count - 1) * 2

    total_minutes = traffic_minutes + passenger_buffer + 5  # loading/unloading buffer
    return max(10, int(math.ceil(total_minutes)))

