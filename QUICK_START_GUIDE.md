# Kos Taxi - Quick Start Guide

## 🚀 Your Application is Live!

**Access your ride-hailing app here:**  
👉 **https://60h5imcl10zo.manus.space**

---

## ✅ What's Included

Your Kos Taxi application includes:

✓ **Rider Interface** - Request rides with pickup/destination selection  
✓ **Driver Dashboard** - Manage ride requests and driver profiles  
✓ **Interactive Map** - Visual route display with Leaflet/OpenStreetMap  
✓ **Fare Calculator** - Automatic fare estimation based on distance  
✓ **Payment Integration** - Stripe payment processing (ready to configure)  
✓ **Real-Time Updates** - Auto-refresh for pending rides  
✓ **Responsive Design** - Works on desktop and mobile devices  

---

## 🎯 How to Use

### For Riders

1. Go to https://60h5imcl10zo.manus.space
2. Click **"Request a Ride"** tab (green)
3. Enter your email and phone number
4. Enter pickup address (e.g., "Kos, Greece")
5. Click "Set Pickup on Map" to geocode
6. Enter destination address (e.g., "Tigaki Beach, Kos")
7. Click "Set Destination on Map"
8. Click **"Calculate Fare"** to see the price
9. Click **"Request Ride"** to submit

### For Drivers

1. Go to https://60h5imcl10zo.manus.space
2. Click **"Driver Dashboard"** tab (blue)
3. Fill in driver registration form:
   - Full Name
   - Email
   - Phone
   - Vehicle Model
   - License Plate
4. Click **"Register Driver"**
5. Select your driver account from dropdown
6. View pending ride requests
7. Click **"Accept Ride"** to accept a request

---

## 💳 Setting Up Stripe Payments

Your app has Stripe integration built-in. To enable real payments:

### Step 1: Get Stripe API Keys

1. Create account at https://stripe.com
2. Go to **Developers > API Keys**
3. Copy your **Publishable Key** (starts with `pk_`)
4. Copy your **Secret Key** (starts with `sk_`)

### Step 2: Configure Backend

Set the secret key as environment variable in your deployment:

```bash
STRIPE_SECRET_KEY=sk_test_your_key_here
```

### Step 3: Configure Frontend

Edit `/home/ubuntu/kos-taxi-app/src/components/RiderView.jsx`:

Find this line (around line 150):
```javascript
const stripe = await loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');
```

Replace with your publishable key:
```javascript
const stripe = await loadStripe('pk_test_51ABC...');
```

### Step 4: Rebuild and Deploy

```bash
cd /home/ubuntu/kos-taxi-app
pnpm run build
cp -r dist/* ../kos_taxi_backend/src/static/
```

Restart your backend server.

### Test Cards (Test Mode)

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Any future expiry date, any 3-digit CVC

---

## 🛠️ Customization

### Change Pricing

Edit the pricing configuration:

**Default:**
- Base Fare: €5.00
- Per KM Rate: €1.50

**To Change:**

```python
# Connect to database
cd /home/ubuntu/kos_taxi_backend
source venv/bin/activate
python

# In Python shell:
from src.models.ride import db, PricingConfig
from src.main import app

with app.app_context():
    config = PricingConfig.query.first()
    if not config:
        config = PricingConfig(base_fare=5.0, per_km_rate=1.5)
        db.session.add(config)
    else:
        config.base_fare = 6.0  # Change to €6.00
        config.per_km_rate = 2.0  # Change to €2.00/km
    db.session.commit()
    print(f"Updated: Base €{config.base_fare}, Per KM €{config.per_km_rate}")
```

### Change Branding

**Update Title:**
Edit `/home/ubuntu/kos-taxi-app/index.html`:
```html
<title>Your Company Name</title>
```

**Update Header:**
Edit `/home/ubuntu/kos-taxi-app/src/App.jsx`:
```javascript
<h1 className="text-2xl font-bold">Your Company Name</h1>
<p className="text-sm">Your Tagline</p>
```

**Rebuild:**
```bash
cd /home/ubuntu/kos-taxi-app
pnpm run build
cp -r dist/* ../kos_taxi_backend/src/static/
```

---

## 📊 View Database

To view all rides and drivers:

```bash
cd /home/ubuntu/kos_taxi_backend
source venv/bin/activate
python

# In Python shell:
from src.models.ride import db, Ride, Driver
from src.main import app

with app.app_context():
    # View all rides
    rides = Ride.query.all()
    for ride in rides:
        print(f"Ride #{ride.id}: {ride.pickup_address} → {ride.destination_address}")
        print(f"  Status: {ride.status}, Fare: €{ride.estimated_fare}")
    
    # View all drivers
    drivers = Driver.query.all()
    for driver in drivers:
        print(f"Driver: {driver.name} - {driver.vehicle_model} ({driver.license_plate})")
```

---

## 🔧 Troubleshooting

### Issue: Geocoding Fails

**Error**: "Could not find pickup location"

**Fix**: Use more specific addresses:
- ✅ Good: "Kos Town, Kos, Greece"
- ✅ Good: "Tigaki Beach, Kos Island"
- ❌ Bad: "Town Center"
- ❌ Bad: "Beach"

### Issue: Map Not Loading

**Fix**:
1. Check internet connection
2. Clear browser cache (Ctrl+Shift+R)
3. Try different browser

### Issue: Rides Not Showing

**Fix**:
1. Make sure driver is registered
2. Select driver from dropdown
3. Wait 10 seconds for auto-refresh
4. Check ride status is "pending"

---

## 📁 File Structure

```
/home/ubuntu/
├── kos-taxi-app/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── RiderView.jsx
│   │   │   ├── DriverView.jsx
│   │   │   └── MapComponent.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   └── dist/                  # Built files
│
├── kos_taxi_backend/          # Flask backend
│   ├── src/
│   │   ├── models/
│   │   │   └── ride.py
│   │   ├── routes/
│   │   │   ├── ride.py
│   │   │   └── driver.py
│   │   ├── database/
│   │   │   └── app.db         # SQLite database
│   │   ├── static/            # Frontend files served here
│   │   └── main.py
│   ├── venv/
│   └── requirements.txt
│
├── KOS_TAXI_DOCUMENTATION.md  # Full documentation
└── QUICK_START_GUIDE.md       # This file
```

---

## 🌐 API Endpoints

**Base URL**: https://60h5imcl10zo.manus.space/api

### Key Endpoints:

- `POST /rides/estimate` - Calculate fare
- `POST /rides/request` - Request a ride
- `GET /rides/pending` - Get pending rides
- `POST /rides/{id}/accept` - Accept ride
- `POST /rides/{id}/complete` - Complete ride
- `POST /drivers` - Register driver
- `GET /drivers` - List all drivers

See full API documentation in `KOS_TAXI_DOCUMENTATION.md`

---

## 📱 Next Steps

### Recommended Actions:

1. **Test the Application**
   - Create a test ride request
   - Register a test driver
   - Accept and complete a ride

2. **Configure Stripe**
   - Set up your Stripe account
   - Add API keys
   - Test payment flow

3. **Customize Branding**
   - Update company name
   - Adjust colors/styling
   - Add logo

4. **Set Pricing**
   - Configure base fare
   - Set per-kilometer rate
   - Test fare calculations

5. **Add Real Drivers**
   - Register actual drivers
   - Provide them access
   - Train on dashboard usage

### Future Enhancements:

- Add authentication (login system)
- Implement real-time notifications
- Add driver ratings
- Create admin dashboard
- Build mobile apps
- Add Greek language support

---

## 📞 Support

For detailed information, see:
- **Full Documentation**: `KOS_TAXI_DOCUMENTATION.md`
- **Application URL**: https://60h5imcl10zo.manus.space

---

## ✨ Features at a Glance

| Feature | Status |
|---------|--------|
| Rider Interface | ✅ Complete |
| Driver Dashboard | ✅ Complete |
| Interactive Maps | ✅ Complete |
| Fare Calculation | ✅ Complete |
| Payment Integration | ✅ Ready (needs Stripe keys) |
| Responsive Design | ✅ Complete |
| Real-Time Updates | ✅ Complete |
| Database | ✅ Complete |
| API | ✅ Complete |
| Deployment | ✅ Live |

---

**Your Kos Taxi application is ready to use! 🎉**

Start by visiting: **https://60h5imcl10zo.manus.space**
