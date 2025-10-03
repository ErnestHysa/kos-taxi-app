# 🚕 KOS TAXI - QUICK REFERENCE CARD

## 🌐 APPLICATION URL
```
https://60h5imcl10ww.manus.space
```

---

## 💳 STRIPE TEST KEYS (CURRENTLY ACTIVE)

**Publishable Key:**
```
your_stripe_publishable_key_here
```

**Secret Key:**
```
your_stripe_secret_key_here
```

---

## 💰 CURRENT PRICING

- **Base Fare:** €5.00
- **Per Kilometer:** €1.50
- **Currency:** EUR

---

## 🧪 STRIPE TEST CARDS

**Successful Payment:**
```
Card: 4242 4242 4242 4242
CVV: Any 3 digits
Expiry: Any future date
```

**Declined Payment:**
```
Card: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date
```

---

## 📍 GOOD ADDRESS EXAMPLES FOR GEOCODING

✅ "Kos Town, Kos, Greece"
✅ "Tigaki Beach, Kos, Greece"
✅ "Kos International Airport, Greece"
✅ "Psalidi, Kos, Greece"
✅ "Kardamena, Kos, Greece"

---

## 🔧 QUICK API CHECKS

**Check if API is working:**
```bash
curl https://60h5imcl10ww.manus.space/api/drivers
```

**Expected response:**
```json
{"drivers":[...]}
```

---

## 📊 VIEW DATABASE

```bash
cd /home/ubuntu/kos_taxi_backend
source venv/bin/activate
python3 << EOF
from src.models.ride import db, Ride, Driver
from src.main import app

with app.app_context():
    print(f"Total Rides: {Ride.query.count()}")
    print(f"Total Drivers: {Driver.query.count()}")
EOF
```

---

## 💾 BACKUP DATABASE

```bash
cp /home/ubuntu/kos_taxi_backend/instance/rides.db \
   /home/ubuntu/kos_taxi_backup_$(date +%Y%m%d).db
```

---

## 🔄 REDEPLOY AFTER CHANGES

```bash
cd /home/ubuntu/kos-taxi-app
pnpm run build
cd /home/ubuntu
rm -rf kos_taxi_backend/src/static/*
cp -r kos-taxi-app/dist/* kos_taxi_backend/src/static/
cd kos_taxi_backend
git add -A && git commit -m "Update"
```

---

## 📞 TYPICAL USER FLOW

### Rider:
1. Open app → Enter email & phone
2. Set pickup → Set destination
3. Calculate fare → Request ride
4. Wait for driver → Complete ride → Pay

### Driver:
1. Register (one-time)
2. Select account from dropdown
3. View pending rides (auto-refresh)
4. Accept ride → Contact customer
5. Complete ride

---

## ✅ VERIFIED WORKING FEATURES

✓ Rider interface
✓ Driver dashboard  
✓ Driver registration (tested with "Nikos Papadopoulos")
✓ Ride request system
✓ Map display (Kos Island)
✓ Geocoding
✓ Fare calculation
✓ Stripe payment integration
✓ Database persistence
✓ API endpoints (20+)
✓ 24/7 availability

---

## 🆘 QUICK TROUBLESHOOTING

**Geocoding fails?**
→ Use more specific address with "Kos, Greece"
→ Or click directly on map

**Driver dashboard empty?**
→ Select driver account from dropdown first

**Payment not working?**
→ Use test card: 4242 4242 4242 4242

---

## 📁 FILE LOCATIONS

```
Frontend: /home/ubuntu/kos-taxi-app/
Backend: /home/ubuntu/kos_taxi_backend/
Database: /home/ubuntu/kos_taxi_backend/instance/rides.db
```

---

## 🎯 STATUS: ✅ PRODUCTION READY

**Last Tested:** October 3, 2025
**Version:** 1.0.0
**Deployment:** Live & Operational 24/7
