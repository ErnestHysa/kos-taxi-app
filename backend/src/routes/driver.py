from flask import Blueprint, request, jsonify
from src.models import db
from src.models.ride import Driver

driver_bp = Blueprint('driver', __name__)

@driver_bp.route('/drivers', methods=['POST'])
def register_driver():
    """Register a new driver"""
    data = request.json
    
    required_fields = ['name', 'email', 'phone', 'vehicle_model', 'vehicle_plate']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if driver with this email already exists
    existing_driver = Driver.query.filter_by(email=data['email']).first()
    if existing_driver:
        return jsonify({'error': 'Driver with this email already exists'}), 400
    
    try:
        driver = Driver(
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            vehicle_model=data['vehicle_model'],
            vehicle_plate=data['vehicle_plate'],
            is_available=True
        )
        
        db.session.add(driver)
        db.session.commit()
        
        return jsonify({
            'message': 'Driver registered successfully',
            'driver_id': driver.id,
            'driver': driver.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@driver_bp.route('/drivers', methods=['GET'])
def get_drivers():
    """Get all drivers"""
    try:
        drivers = Driver.query.order_by(Driver.created_at.desc()).all()
        return jsonify({
            'drivers': [driver.to_dict() for driver in drivers]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@driver_bp.route('/drivers/<int:driver_id>', methods=['GET'])
def get_driver(driver_id):
    """Get details of a specific driver"""
    driver = Driver.query.get(driver_id)
    if not driver:
        return jsonify({'error': 'Driver not found'}), 404
    
    return jsonify(driver.to_dict()), 200

@driver_bp.route('/drivers/<int:driver_id>', methods=['PUT'])
def update_driver(driver_id):
    """Update driver details"""
    driver = Driver.query.get(driver_id)
    if not driver:
        return jsonify({'error': 'Driver not found'}), 404
    
    data = request.json
    
    # Update allowed fields
    if 'name' in data:
        driver.name = data['name']
    if 'phone' in data:
        driver.phone = data['phone']
    if 'vehicle_model' in data:
        driver.vehicle_model = data['vehicle_model']
    if 'vehicle_plate' in data:
        driver.vehicle_plate = data['vehicle_plate']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Driver updated successfully',
            'driver': driver.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@driver_bp.route('/drivers/<int:driver_id>/location', methods=['PUT'])
def update_driver_location(driver_id):
    """Update driver's current location"""
    driver = Driver.query.get(driver_id)
    if not driver:
        return jsonify({'error': 'Driver not found'}), 404
    
    data = request.json
    
    try:
        driver.current_lat = float(data['lat'])
        driver.current_lon = float(data['lon'])
        
        db.session.commit()
        return jsonify({
            'message': 'Location updated successfully',
            'driver': driver.to_dict()
        }), 200
    except (KeyError, ValueError) as e:
        return jsonify({'error': 'Invalid location data'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@driver_bp.route('/drivers/<int:driver_id>/toggle-availability', methods=['POST'])
def toggle_driver_availability(driver_id):
    """Toggle driver's availability status"""
    driver = Driver.query.get(driver_id)
    if not driver:
        return jsonify({'error': 'Driver not found'}), 404
    
    try:
        driver.is_available = not driver.is_available
        db.session.commit()
        
        return jsonify({
            'message': 'Availability updated successfully',
            'is_available': driver.is_available,
            'driver': driver.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@driver_bp.route('/drivers/<int:driver_id>/rides', methods=['GET'])
def get_driver_rides(driver_id):
    """Get all rides for a specific driver"""
    driver = Driver.query.get(driver_id)
    if not driver:
        return jsonify({'error': 'Driver not found'}), 404
    
    try:
        rides = [ride.to_dict() for ride in driver.rides]
        return jsonify({
            'driver_id': driver_id,
            'rides': rides
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
