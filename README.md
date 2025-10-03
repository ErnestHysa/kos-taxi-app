# 🚕 Kos Taxi - Private Ride-Hailing Application

A full-stack ride-hailing web application for private taxi services in Kos, Greece. Built with React, Flask, and Stripe payment integration.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://60h5imcl10ww.manus.space)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

### For Riders
- 📧 Contact information collection (email, phone)
- 📍 Interactive map with pickup/destination selection
- 🗺️ Geocoding for address-to-coordinates conversion
- 🛣️ Visual route display on map
- 💰 Distance-based fare calculation
- 🚗 One-click ride request submission
- 💳 Integrated Stripe payment processing

### For Drivers
- 👤 Driver registration with vehicle details
- 📊 Real-time ride request dashboard
- ✅ Accept/decline ride functionality
- 🔄 Auto-refresh every 10 seconds
- 📜 Ride history tracking
- 🔔 Contact information for each ride

## 🚀 Live Demo

**Access the live application:** [https://60h5imcl10ww.manus.space](https://60h5imcl10ww.manus.space)

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Leaflet** - Interactive maps
- **Stripe Elements** - Payment UI

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM
- **SQLite** - Database
- **Stripe API** - Payment processing

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Python 3.11+
- Stripe account (for payment processing)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ErnestHysa/kos-taxi-app.git
cd kos-taxi-app
```

### 2. Setup Frontend

```bash
cd frontend
pnpm install
```

Create `.env` file:
```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Setup Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Update Stripe secret key in `backend/src/routes/ride.py`:
```python
stripe.api_key = "your_stripe_secret_key"
```

### 4. Run the Application

**Development Mode:**

Terminal 1 (Frontend):
```bash
cd frontend
pnpm run dev
```

Terminal 2 (Backend):
```bash
cd backend
source venv/bin/activate
python src/main.py
```

**Production Mode:**

```bash
# Build frontend
cd frontend
pnpm run build

# Copy to backend static folder
cp -r dist/* ../backend/src/static/

# Run backend
cd ../backend
source venv/bin/activate
python src/main.py
```

The application will be available at `http://localhost:5000`

## 💳 Stripe Configuration

### Test Mode (Development)

Use these test card numbers:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### Live Mode (Production)

1. Get your live Stripe keys from [dashboard.stripe.com](https://dashboard.stripe.com)
2. Update keys in:
   - Frontend: `.env` file
   - Backend: `src/routes/ride.py`
3. Rebuild and redeploy

## 💰 Pricing Configuration

Current pricing structure:
- **Base Fare:** €5.00
- **Per Kilometer:** €1.50
- **Currency:** EUR

To modify pricing, update the database or use the API endpoint.

## 🗺️ Map & Geocoding

- **Map Provider:** OpenStreetMap (Leaflet)
- **Geocoding:** Nominatim (OpenStreetMap)

**Address Format Tips:**
- ✅ Good: "Kos Town, Kos, Greece"
- ✅ Good: "Tigaki Beach, Kos, Greece"
- ❌ Avoid: "Kos" (too generic)

## 📡 API Endpoints

### Rides
- `POST /api/rides/estimate` - Calculate fare
- `POST /api/rides/request` - Request ride
- `GET /api/rides/pending` - Get pending rides
- `POST /api/rides/{id}/accept` - Accept ride
- `POST /api/rides/{id}/complete` - Complete ride
- `POST /api/rides/{id}/payment-intent` - Create payment

### Drivers
- `POST /api/drivers` - Register driver
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/{id}` - Get driver details
- `PUT /api/drivers/{id}` - Update driver

See [KOS_TAXI_DOCUMENTATION.md](KOS_TAXI_DOCUMENTATION.md) for complete API reference.

## 📚 Documentation

- [**PRODUCTION_READY_GUIDE.md**](PRODUCTION_READY_GUIDE.md) - Complete production deployment guide
- [**QUICK_REFERENCE.md**](QUICK_REFERENCE.md) - Quick reference card
- [**KOS_TAXI_DOCUMENTATION.md**](KOS_TAXI_DOCUMENTATION.md) - Technical documentation
- [**STRIPE_SETUP_INSTRUCTIONS.md**](STRIPE_SETUP_INSTRUCTIONS.md) - Payment integration guide
- [**QUICK_START_GUIDE.md**](QUICK_START_GUIDE.md) - Getting started guide

## 🚀 Deployment

The application is deployed and running 24/7 at:
**https://60h5imcl10ww.manus.space**

For deployment instructions, see [PRODUCTION_READY_GUIDE.md](PRODUCTION_READY_GUIDE.md).

## 📁 Project Structure

```
kos-taxi-app/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── package.json
│   └── vite.config.js
├── backend/              # Flask application
│   ├── src/
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── main.py       # Flask app entry
│   ├── requirements.txt
│   └── instance/         # Database storage
└── docs/                 # Documentation
```

## 🧪 Testing

### Test Rider Flow
1. Open application
2. Enter email and phone
3. Set pickup: "Kos Town, Kos, Greece"
4. Set destination: "Tigaki Beach, Kos, Greece"
5. Calculate fare
6. Request ride

### Test Driver Flow
1. Click "Driver Dashboard"
2. Register with vehicle details
3. Select account from dropdown
4. View pending rides
5. Accept a ride

## 🔒 Security

- ✅ HTTPS encryption
- ✅ Stripe PCI compliance
- ✅ Input validation
- ✅ SQL injection protection (SQLAlchemy ORM)
- ✅ CORS configuration

## 📱 Mobile Support

Fully responsive design works on:
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Android Chrome)
- ✅ Tablets

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Ernest Hysa**
- GitHub: [@ErnestHysa](https://github.com/ErnestHysa)

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Stripe for payment processing
- Leaflet for map library

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built for private taxi services in Kos, Greece 🇬🇷**

**Live Demo:** [https://60h5imcl10ww.manus.space](https://60h5imcl10ww.manus.space)
