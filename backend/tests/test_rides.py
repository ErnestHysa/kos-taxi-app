from __future__ import annotations

from datetime import datetime, timedelta


def _future_time() -> str:
    return (datetime.utcnow() + timedelta(hours=1)).isoformat() + "Z"


def test_ride_estimate_validates_required_fields(client):
    response = client.post(
        "/api/rides/estimate",
        json={
            "pickup_address": "",
            "dropoff_address": "",
            "scheduled_time": "",
            "passenger_count": 0,
        },
    )

    assert response.status_code == 400
    body = response.get_json()
    assert body["error"] == "Invalid ride request"
    assert "pickup_address" in body["details"]
    assert "dropoff_address" in body["details"]
    assert "scheduled_time" in body["details"]
    assert "passenger_count" in body["details"]


def test_create_ride_returns_placeholder_payment_payload(client):
    response = client.post(
        "/api/rides",
        json={
            "pickup_address": "Kos Town Square",
            "dropoff_address": "Kos Airport",
            "scheduled_time": _future_time(),
            "passenger_count": 2,
            "rider_name": "Integration Tester",
            "rider_email": "test@example.com",
        },
    )

    assert response.status_code == 201
    payload = response.get_json()

    ride = payload["ride"]
    assert ride["pickup_address"] == "Kos Town Square"
    assert ride["dest_address"] == "Kos Airport"
    assert ride["status"] == "pending"

    payment = payload["payment"]
    assert payment is not None
    assert payment["placeholder"] is True
    assert payment["message"].startswith("Stripe not configured")
    assert payment["payment_intent_id"].startswith("pi_")
