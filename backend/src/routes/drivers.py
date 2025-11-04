"""Driver related routes including authenticated operations."""
from __future__ import annotations

from datetime import datetime
from typing import List

from flask import Blueprint, jsonify, request, g
from sqlalchemy.exc import IntegrityError

from src.auth.decorators import jwt_required
from src.models import db
from src.models.driver import Driver
from src.models.ride import Ride


driver_bp = Blueprint("driver", __name__)


@driver_bp.route("/drivers", methods=["POST"])
def register_driver() -> tuple:
    """Register a new driver profile."""

    data = request.json or {}
    required_fields = [
        "name",
        "email",
        "password",
        "phone",
        "vehicle_model",
        "vehicle_plate",
    ]
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return (
            jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}),
            400,
        )

    existing_driver = Driver.query.filter_by(email=data["email"].strip().lower()).first()
    if existing_driver:
        return jsonify({"error": "Driver with this email already exists"}), 400

    driver = Driver(
        name=data["name"].strip(),
        email=data["email"].strip().lower(),
        phone=data["phone"].strip(),
        vehicle_model=data["vehicle_model"].strip(),
        vehicle_plate=data["vehicle_plate"].strip(),
        is_available=True,
    )
    driver.set_password(data["password"])

    try:
        db.session.add(driver)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Driver with this email already exists"}), 400
    except Exception as exc:  # pragma: no cover - defensive
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500

    return (
        jsonify({
            "message": "Driver registered successfully",
            "driver_id": driver.id,
            "driver": driver.to_dict(),
        }),
        201,
    )


@driver_bp.route("/drivers", methods=["GET"])
def get_drivers() -> tuple:
    """Return all registered drivers."""

    drivers = Driver.query.order_by(Driver.created_at.desc()).all()
    return jsonify({"drivers": [driver.to_dict() for driver in drivers]}), 200


@driver_bp.route("/drivers/<int:driver_id>", methods=["GET"])
def get_driver(driver_id: int) -> tuple:
    """Return a specific driver."""

    driver = Driver.query.get(driver_id)
    if not driver:
        return jsonify({"error": "Driver not found"}), 404

    return jsonify(driver.to_dict()), 200


@driver_bp.route("/drivers/<int:driver_id>", methods=["PUT"])
def update_driver(driver_id: int) -> tuple:
    """Update mutable driver fields."""

    driver = Driver.query.get(driver_id)
    if not driver:
        return jsonify({"error": "Driver not found"}), 404

    data = request.json or {}

    if "name" in data:
        driver.name = data["name"].strip()
    if "phone" in data:
        driver.phone = data["phone"].strip()
    if "vehicle_model" in data:
        driver.vehicle_model = data["vehicle_model"].strip()
    if "vehicle_plate" in data:
        driver.vehicle_plate = data["vehicle_plate"].strip()
    if "password" in data and data["password"]:
        driver.set_password(data["password"])

    try:
        db.session.commit()
    except Exception as exc:  # pragma: no cover - defensive
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500

    return (
        jsonify({"message": "Driver updated successfully", "driver": driver.to_dict()}),
        200,
    )


@driver_bp.route("/drivers/<int:driver_id>/location", methods=["PUT"])
def update_driver_location(driver_id: int) -> tuple:
    """Update the driver's current location."""

    driver = Driver.query.get(driver_id)
    if not driver:
        return jsonify({"error": "Driver not found"}), 404

    data = request.json or {}
    try:
        driver.current_lat = float(data["lat"])
        driver.current_lon = float(data["lon"])
        db.session.commit()
    except (KeyError, TypeError, ValueError):
        db.session.rollback()
        return jsonify({"error": "Invalid location data"}), 400
    except Exception as exc:  # pragma: no cover - defensive
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500

    return (
        jsonify(
            {
                "message": "Location updated successfully",
                "driver": driver.to_dict(),
            }
        ),
        200,
    )


@driver_bp.route("/drivers/<int:driver_id>/toggle-availability", methods=["POST"])
def toggle_driver_availability(driver_id: int) -> tuple:
    """Toggle the availability state for a driver."""

    driver = Driver.query.get(driver_id)
    if not driver:
        return jsonify({"error": "Driver not found"}), 404

    driver.is_available = not driver.is_available
    try:
        db.session.commit()
    except Exception as exc:  # pragma: no cover
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500

    return (
        jsonify(
            {
                "message": "Availability updated successfully",
                "is_available": driver.is_available,
                "driver": driver.to_dict(),
            }
        ),
        200,
    )


@driver_bp.route("/drivers/<int:driver_id>/rides", methods=["GET"])
def get_driver_rides(driver_id: int) -> tuple:
    """Return rides for a given driver."""

    driver = Driver.query.get(driver_id)
    if not driver:
        return jsonify({"error": "Driver not found"}), 404

    rides = [ride.to_dict() for ride in driver.rides]
    return jsonify({"driver_id": driver_id, "rides": rides}), 200


@driver_bp.route("/drivers/me", methods=["GET"])
@jwt_required
def get_current_driver() -> tuple:
    """Return the currently authenticated driver."""

    driver: Driver = g.current_driver
    return jsonify({"driver": driver.to_dict()}), 200


@driver_bp.route("/drivers/me/assigned-rides", methods=["GET"])
@jwt_required
def get_assigned_rides() -> tuple:
    """Return rides assigned to the authenticated driver."""

    driver: Driver = g.current_driver
    status_filter: List[str] = request.args.get("status", "").split(",")
    query = Ride.query.filter(Ride.driver_id == driver.id)
    normalised_status = [status.strip() for status in status_filter if status.strip()]
    if normalised_status:
        query = query.filter(Ride.status.in_(normalised_status))
    rides = query.order_by(Ride.created_at.desc()).all()
    return jsonify({"rides": [ride.to_dict() for ride in rides]}), 200


@driver_bp.route("/drivers/me/rides/<int:ride_id>/accept", methods=["POST"])
@jwt_required
def accept_assigned_ride(ride_id: int) -> tuple:
    """Assign and accept a pending ride for the authenticated driver."""

    driver: Driver = g.current_driver
    ride = Ride.query.get(ride_id)
    if not ride:
        return jsonify({"error": "Ride not found"}), 404

    if ride.status != "pending":
        return jsonify({"error": "Ride is not available"}), 400

    ride.driver_id = driver.id
    ride.status = "accepted"
    driver.last_login_at = driver.last_login_at or datetime.utcnow()

    try:
        db.session.commit()
    except Exception as exc:  # pragma: no cover
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500

    return (
        jsonify({"message": "Ride accepted successfully", "ride": ride.to_dict()}),
        200,
    )


@driver_bp.route("/drivers/me/rides/<int:ride_id>/status", methods=["PATCH"])
@jwt_required
def update_ride_status(ride_id: int) -> tuple:
    """Update the status of an assigned ride."""

    driver: Driver = g.current_driver
    ride = Ride.query.get(ride_id)
    if not ride or ride.driver_id != driver.id:
        return jsonify({"error": "Ride not found"}), 404

    data = request.json or {}
    status = (data.get("status") or "").strip().lower()
    allowed_status = {"accepted", "in_progress", "completed", "cancelled"}
    if status not in allowed_status:
        return (
            jsonify({"error": "Invalid status", "allowed_status": sorted(allowed_status)}),
            400,
        )

    if status == "accepted" and ride.status != "pending":
        return jsonify({"error": "Ride cannot be re-accepted"}), 400

    ride.status = status
    ride.updated_at = datetime.utcnow()

    try:
        db.session.commit()
    except Exception as exc:  # pragma: no cover
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500

    return jsonify({"message": "Ride status updated", "ride": ride.to_dict()}), 200


__all__ = ["driver_bp"]
