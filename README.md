# 🚕 Kos Taxi - Private Ride-Hailing Application

A full-stack ride-hailing web application for private taxi services in Kos, Greece. Built with React, Flask, and Stripe payment integration.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://example.com)
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
- ✨ Modern UI with smooth animations

### For Drivers
- 👤 Separated driver registration flow
- 📊 Real-time ride request dashboard
- ✅ Accept/decline ride functionality
- 🔄 Auto-refresh every 10 seconds
- 📜 Ride history tracking
- 🔔 Contact information for each ride
- 🎨 Clean account selection interface
- 🚪 Easy logout functionality

## 🚀 Live Demo

**Access the live application:** [https://77h9ikc69o8e.manus.space](https://77h9ikc69o8e.manus.space)

## 🎨 Modern UI/UX Design

The application features a completely redesigned modern interface with:
- **Gradient-based design** - Beautiful color transitions throughout
- **Card-based layout** - Clean, organized sections
- **Smooth animations** - Fade-ins, hover effects, and transitions
- **Separated flows** - Clear distinction between registration and operations
- **Icon integration** - Lucide icons for better visual communication
- **Responsive design** - Works perfectly on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Leaflet** - Interactive maps
- **Lucide Icons** - Modern icon library
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

## 🔐 Configuration

1. Copy the sample environment file and update the values as needed:

   ```bash
   cp .env.example .env
   ```

   - Backend settings (secret key, database URL, and Stripe secrets) are loaded from `.env` automatically when the Flask app starts.
   - The `VITE_STRIPE_PUBLISHABLE_KEY` entry is used when you configure the frontend build (see the frontend setup section below).

2. Export the backend variables in your shell before running the server (or use a tool like [direnv](https://direnv.net/)):

   ```bash
   export $(grep -v '^#' .env | xargs)
   ```

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

Create a `frontend/.env` file (or copy from `.env`) to expose the publishable key to Vite:
```bash
echo "VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}" > frontend/.env
```

### 3. Setup Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

The backend reads Stripe credentials and Flask settings from the exported environment variables (see [Configuration](#-configuration)).
On startup it also bootstraps the `backend/src/database/` directory and initialises Flask-Migrate metadata automatically.

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

The helper script `backend/scripts/build_static.py` validates that `frontend/dist/` exists before copying files and ensures `backend/src/static/` is created, preventing missing-folder errors during deployment.

**Production Mode:**

```bash
# Build frontend
cd frontend
pnpm run build
cd ..

# Copy built assets with safety checks
python backend/scripts/build_static.py

# Run backend
cd backend
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
2. Update keys in your environment configuration:
   - Frontend: `frontend/.env` (`VITE_STRIPE_PUBLISHABLE_KEY`)
   - Backend: `.env` (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
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
**https://77h9ikc69o8e.manus.space**

For deployment instructions, see [PRODUCTION_READY_GUIDE.md](PRODUCTION_READY_GUIDE.md).

## 📁 Project Structure

```
kos-taxi-app/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── DriverView.jsx    # Driver dashboard
│   │   │   ├── RiderView.jsx     # Rider interface
│   │   │   └── MapComponent.jsx  # Map display
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
7. See success screen

### Test Driver Flow
1. Click "Driver Dashboard"
2. Select existing driver OR register new driver
3. View dashboard with driver info
4. See pending rides (auto-refreshes)
5. Accept a ride
6. Logout when done

## 🎨 UI/UX Highlights

- **Separated Registration Flow** - No more confusion between signup and dashboard
- **Modern Gradient Design** - Beautiful color schemes throughout
- **Smooth Animations** - Fade-ins, hover effects, transitions
- **Clear Visual Hierarchy** - Easy to understand what to do next
- **Loading States** - Visual feedback for all operations
- **Success Screens** - Animated confirmations
- **Responsive Layout** - Works on all screen sizes

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
- Lucide for modern icons

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built for private taxi services in Kos, Greece 🇬🇷**

**Live Demo:** [https://77h9ikc69o8e.manus.space](https://77h9ikc69o8e.manus.space)
