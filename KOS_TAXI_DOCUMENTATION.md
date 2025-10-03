# Kos Taxi - Private Ride-Hailing Application

## Overview

**Kos Taxi** is a full-stack web application designed specifically for private taxi services on the Greek island of Kos. The application connects riders with private taxi drivers and includes integrated online payment processing through Stripe.

**Live Application URL:** https://60h5imcl10zo.manus.space

---

## Features

### For Riders

- **Contact Information Collection**: Email and phone number capture
- **Location Selection**: 
  - Text-based address input with geocoding
  - Interactive map-based location selection
  - Visual route display between pickup and destination
- **Fare Estimation**: Real-time fare calculation based on distance
- **Ride Request**: Submit ride requests with all necessary details
- **Payment Integration**: Secure online payment through Stripe

### For Drivers

- **Driver Registration**: Complete profile setup with vehicle information
- **Ride Management Dashboard**: View and manage incoming ride requests
- **Ride Acceptance**: Accept rides and update status
- **Ride History**: Track completed and ongoing rides
- **Location Updates**: Update current location for better dispatch
- **Availability Toggle**: Control when you're available for rides

---

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React
- **Maps**: Leaflet.js with OpenStreetMap
- **HTTP Client**: Axios

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Payment Processing**: Stripe API
- **Geocoding**: Nominatim (OpenStreetMap)
- **CORS**: Flask-CORS for cross-origin requests

---

## Application Structure

### Frontend Structure
```
kos-taxi-app/
├── src/
│   ├── components/
│   │   ├── RiderView.jsx       # Rider interface
│   │   ├── DriverView.jsx      # Driver dashboard
│   │   └── MapComponent.jsx    # Map display
│   ├── App.jsx                 # Main application
│   └── App.css                 # Styles
├── public/
└── package.json
```

### Backend Structure
```
kos_taxi_backend/
├── src/
│   ├── models/
│   │   └── ride.py            # Database models
│   ├── routes/
│   │   ├── ride.py            # Ride endpoints
│   │   └── driver.py          # Driver endpoints
│   ├── database/
│   │   └── app.db             # SQLite database
│   └── main.py                # Flask application
├── venv/                      # Python virtual environment
└── requirements.txt
```

---

## API Documentation

### Base URL
- **Production**: `https://60h5imcl10zo.manus.space/api`
- **Local Development**: `http://localhost:5000/api`

### Ride Endpoints

#### 1. Calculate Fare Estimate
```http
POST /api/rides/estimate
Content-Type: application/json

{
  "pickup_lat": 36.8969,
  "pickup_lng": 27.2883,
  "destination_lat": 36.8200,
  "destination_lng": 27.1400
}

Response:
{
  "distance_km": 15.5,
  "estimated_fare": 23.25,
  "currency": "EUR"
}
```

#### 2. Request a Ride
```http
POST /api/rides/request
Content-Type: application/json

{
  "rider_email": "user@example.com",
  "rider_phone": "+30 123 456 7890",
  "pickup_address": "Kos Town Center",
  "pickup_lat": 36.8969,
  "pickup_lng": 27.2883,
  "destination_address": "Tigaki Beach",
  "destination_lat": 36.8200,
  "destination_lng": 27.1400,
  "estimated_fare": 23.25
}

Response:
{
  "id": 1,
  "status": "pending",
  "created_at": "2025-10-03T09:30:00",
  ...
}
```

#### 3. Get Pending Rides
```http
GET /api/rides/pending

Response:
[
  {
    "id": 1,
    "rider_email": "user@example.com",
    "pickup_address": "Kos Town Center",
    "destination_address": "Tigaki Beach",
    "estimated_fare": 23.25,
    "status": "pending",
    "created_at": "2025-10-03T09:30:00"
  }
]
```

#### 4. Accept a Ride
```http
POST /api/rides/{ride_id}/accept
Content-Type: application/json

{
  "driver_id": 1
}

Response:
{
  "id": 1,
  "status": "accepted",
  "driver_id": 1,
  ...
}
```

#### 5. Complete a Ride
```http
POST /api/rides/{ride_id}/complete

Response:
{
  "id": 1,
  "status": "completed",
  "completed_at": "2025-10-03T10:00:00",
  ...
}
```

#### 6. Cancel a Ride
```http
POST /api/rides/{ride_id}/cancel

Response:
{
  "id": 1,
  "status": "cancelled",
  ...
}
```

#### 7. Create Payment Intent
```http
POST /api/rides/{ride_id}/payment-intent

Response:
{
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx"
}
```

#### 8. Check Payment Status
```http
GET /api/rides/{ride_id}/payment-status

Response:
{
  "payment_status": "succeeded",
  "payment_intent_id": "pi_xxx"
}
```

### Driver Endpoints

#### 1. Register Driver
```http
POST /api/drivers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "driver@example.com",
  "phone": "+30 123 456 7890",
  "vehicle_model": "Toyota Corolla",
  "license_plate": "ABC-1234"
}

Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "driver@example.com",
  "is_available": true,
  ...
}
```

#### 2. Get All Drivers
```http
GET /api/drivers

Response:
[
  {
    "id": 1,
    "name": "John Doe",
    "vehicle_model": "Toyota Corolla",
    "is_available": true
  }
]
```

#### 3. Get Driver Details
```http
GET /api/drivers/{driver_id}

Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "driver@example.com",
  "phone": "+30 123 456 7890",
  "vehicle_model": "Toyota Corolla",
  "license_plate": "ABC-1234",
  "is_available": true,
  "current_lat": 36.8969,
  "current_lng": 27.2883
}
```

#### 4. Update Driver Location
```http
PUT /api/drivers/{driver_id}/location
Content-Type: application/json

{
  "latitude": 36.8969,
  "longitude": 27.2883
}

Response:
{
  "message": "Location updated successfully"
}
```

#### 5. Toggle Driver Availability
```http
POST /api/drivers/{driver_id}/toggle-availability

Response:
{
  "id": 1,
  "is_available": false
}
```

#### 6. Get Driver's Ride History
```http
GET /api/drivers/{driver_id}/rides

Response:
[
  {
    "id": 1,
    "pickup_address": "Kos Town Center",
    "destination_address": "Tigaki Beach",
    "status": "completed",
    "estimated_fare": 23.25,
    "completed_at": "2025-10-03T10:00:00"
  }
]
```

---

## Database Schema

### Rides Table
```sql
CREATE TABLE rides (
    id INTEGER PRIMARY KEY,
    rider_email VARCHAR(120) NOT NULL,
    rider_phone VARCHAR(20) NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_lat FLOAT NOT NULL,
    pickup_lng FLOAT NOT NULL,
    destination_address TEXT NOT NULL,
    destination_lat FLOAT NOT NULL,
    destination_lng FLOAT NOT NULL,
    distance_km FLOAT,
    estimated_fare FLOAT,
    final_fare FLOAT,
    status VARCHAR(20) DEFAULT 'pending',
    driver_id INTEGER,
    payment_intent_id VARCHAR(100),
    payment_status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);
```

### Drivers Table
```sql
CREATE TABLE drivers (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_model VARCHAR(50) NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    current_lat FLOAT,
    current_lng FLOAT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Pricing Config Table
```sql
CREATE TABLE pricing_config (
    id INTEGER PRIMARY KEY,
    base_fare FLOAT DEFAULT 5.0,
    per_km_rate FLOAT DEFAULT 1.5,
    currency VARCHAR(3) DEFAULT 'EUR'
);
```

---

## Payment Integration

### Stripe Setup

The application uses **Stripe** for payment processing. To enable payments:

#### 1. Get Stripe API Keys
1. Create a Stripe account at https://stripe.com
2. Navigate to **Developers > API Keys**
3. Copy your **Publishable Key** and **Secret Key**

#### 2. Configure Backend
Set the Stripe secret key as an environment variable:

```bash
export STRIPE_SECRET_KEY="sk_test_..."
```

Or add it to your deployment configuration.

#### 3. Configure Frontend
Update the Stripe publishable key in `RiderView.jsx`:

```javascript
const stripe = await loadStripe('pk_test_...');
```

#### 4. Test Cards
Use these test card numbers in test mode:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184

---

## Fare Calculation

The fare is calculated using the following formula:

```
Fare = Base Fare + (Distance in KM × Per KM Rate)
```

**Default Pricing:**
- Base Fare: €5.00
- Per KM Rate: €1.50
- Currency: EUR

**Example:**
- Distance: 15.5 km
- Fare = €5.00 + (15.5 × €1.50) = €28.25

You can modify these rates in the database or through the API.

---

## Deployment

### Current Deployment
The application is already deployed and accessible at:
**https://60h5imcl10zo.manus.space**

### Local Development

#### Backend Setup
```bash
cd kos_taxi_backend
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

The backend will run on `http://localhost:5000`

#### Frontend Setup
```bash
cd kos-taxi-app
pnpm install
pnpm run dev
```

The frontend will run on `http://localhost:5173`

### Production Build

#### Build Frontend
```bash
cd kos-taxi-app
pnpm run build
```

#### Deploy to Flask
```bash
# Copy built files to Flask static directory
cp -r kos-taxi-app/dist/* kos_taxi_backend/src/static/
```

---

## Configuration

### Environment Variables

**Backend:**
```bash
STRIPE_SECRET_KEY=sk_test_...          # Stripe secret key
FLASK_ENV=production                    # Flask environment
SECRET_KEY=your-secret-key              # Flask secret key
```

**Frontend:**
```javascript
// In RiderView.jsx
const API_BASE_URL = 'https://60h5imcl10zo.manus.space/api';
const STRIPE_PUBLISHABLE_KEY = 'pk_test_...';
```

### Pricing Configuration

To update pricing, modify the `PricingConfig` in the database:

```python
# In Python shell or script
from src.models.ride import db, PricingConfig
config = PricingConfig.query.first()
config.base_fare = 6.0
config.per_km_rate = 2.0
db.session.commit()
```

---

## User Guide

### For Riders

1. **Enter Contact Information**
   - Provide your email and phone number

2. **Set Pickup Location**
   - Type your pickup address or click "Set Pickup on Map"
   - The map will show your selected location with a green marker

3. **Set Destination**
   - Type your destination address or click "Set Destination on Map"
   - The map will show the route with a red marker at destination

4. **Calculate Fare**
   - Click "Calculate Fare" to see the estimated cost
   - The fare is based on distance

5. **Request Ride**
   - Click "Request Ride" to submit your request
   - You'll receive a confirmation with ride details

6. **Make Payment**
   - After a driver accepts, you'll be prompted to pay
   - Enter your card details securely through Stripe
   - Payment is processed immediately

### For Drivers

1. **Register as Driver**
   - Enter your name, email, phone
   - Provide vehicle model and license plate
   - Click "Register Driver"

2. **View Pending Rides**
   - Select your driver account from the dropdown
   - See all pending ride requests
   - Requests auto-refresh every 10 seconds

3. **Accept Rides**
   - Click "Accept Ride" on any pending request
   - The ride status changes to "accepted"
   - Rider is notified

4. **Complete Rides**
   - After dropping off the passenger, mark as complete
   - Payment is automatically processed

5. **Manage Availability**
   - Toggle your availability on/off
   - Only available drivers see new requests

---

## Troubleshooting

### Common Issues

#### Geocoding Fails
**Problem**: "Could not find pickup location" error

**Solution**: 
- Use more specific addresses (e.g., "Kos Town, Greece" instead of "Kos Town Center")
- Try using the map-based selection instead
- Ensure the address includes "Kos" or "Greece"

#### Payment Not Processing
**Problem**: Payment fails or doesn't complete

**Solution**:
- Verify Stripe API keys are correctly configured
- Check that you're using test card numbers in test mode
- Ensure the ride status is "accepted" before payment

#### Map Not Loading
**Problem**: Map appears blank or doesn't display

**Solution**:
- Check internet connection
- Verify Leaflet CSS is loaded
- Clear browser cache and reload

#### Rides Not Appearing in Driver Dashboard
**Problem**: Driver can't see pending rides

**Solution**:
- Ensure a driver account is selected
- Check that rides are in "pending" status
- Wait for auto-refresh (10 seconds) or reload page

---

## Security Considerations

### Implemented Security Features

1. **Payment Security**
   - Stripe handles all sensitive card data
   - PCI DSS compliant payment processing
   - No card details stored in database

2. **Data Validation**
   - Input validation on both frontend and backend
   - SQL injection prevention through SQLAlchemy ORM
   - XSS protection through React's automatic escaping

3. **CORS Configuration**
   - Configured for production domain
   - Restricts unauthorized API access

### Recommended Enhancements

For production deployment, consider adding:

1. **Authentication**
   - JWT tokens for API authentication
   - OAuth for social login
   - Session management

2. **HTTPS**
   - SSL/TLS certificates
   - Force HTTPS redirects

3. **Rate Limiting**
   - Prevent API abuse
   - Throttle requests per IP

4. **Data Encryption**
   - Encrypt sensitive data at rest
   - Secure database backups

---

## Future Enhancements

### Planned Features

1. **Real-Time Updates**
   - WebSocket integration for live ride status
   - Push notifications for riders and drivers
   - Live driver location tracking

2. **Advanced Booking**
   - Schedule rides in advance
   - Recurring ride bookings
   - Favorite locations

3. **Rating System**
   - Riders rate drivers
   - Drivers rate riders
   - Display average ratings

4. **Multi-Language Support**
   - Greek language option
   - English (default)
   - Additional languages

5. **Admin Dashboard**
   - Monitor all rides
   - Manage drivers
   - View analytics and reports
   - Configure pricing dynamically

6. **Mobile Apps**
   - Native iOS app
   - Native Android app
   - Push notifications

7. **Advanced Payment Options**
   - Multiple payment methods
   - Split payments
   - Ride credits and vouchers

---

## Support and Maintenance

### File Locations

**Application Files:**
- Frontend: `/home/ubuntu/kos-taxi-app/`
- Backend: `/home/ubuntu/kos_taxi_backend/`
- Database: `/home/ubuntu/kos_taxi_backend/src/database/app.db`

### Backup Database

```bash
# Backup SQLite database
cp /home/ubuntu/kos_taxi_backend/src/database/app.db ~/backup_$(date +%Y%m%d).db
```

### View Logs

```bash
# Backend logs (when running)
cd /home/ubuntu/kos_taxi_backend
source venv/bin/activate
python src/main.py
```

### Update Application

```bash
# Update frontend
cd /home/ubuntu/kos-taxi-app
pnpm install
pnpm run build
cp -r dist/* ../kos_taxi_backend/src/static/

# Restart backend
cd /home/ubuntu/kos_taxi_backend
# Stop current process and restart
```

---

## License and Credits

**Application**: Kos Taxi - Private Ride-Hailing Service  
**Location**: Kos Island, Greece  
**Year**: 2025  

**Technologies Used:**
- React (MIT License)
- Flask (BSD License)
- Stripe (Commercial API)
- Leaflet (BSD License)
- OpenStreetMap (ODbL License)
- Tailwind CSS (MIT License)

---

## Contact

For questions, issues, or feature requests related to this application, please refer to the deployment documentation or contact the development team.

**Application URL**: https://60h5imcl10zo.manus.space

---

*This documentation was generated on October 3, 2025*
