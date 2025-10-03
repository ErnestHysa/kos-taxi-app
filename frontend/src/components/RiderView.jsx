import { useState } from 'react';
import MapComponent from './MapComponent';
import { Mail, Phone, MapPin, Navigation, DollarSign, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function RiderView() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rideRequested, setRideRequested] = useState(false);

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleSetPickup = async () => {
    if (!pickupAddress) {
      alert('Please enter a pickup address');
      return;
    }
    setLoading(true);
    const coords = await geocodeAddress(pickupAddress);
    setLoading(false);
    
    if (coords) {
      setPickupCoords(coords);
    } else {
      alert('Could not find pickup location. Please try a different address.');
    }
  };

  const handleSetDestination = async () => {
    if (!destinationAddress) {
      alert('Please enter a destination address');
      return;
    }
    setLoading(true);
    const coords = await geocodeAddress(destinationAddress);
    setLoading(false);
    
    if (coords) {
      setDestinationCoords(coords);
    } else {
      alert('Could not find destination. Please try a different address.');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleCalculateFare = async () => {
    if (!pickupCoords || !destinationCoords) {
      alert('Please set both pickup and destination locations');
      return;
    }

    const distance = calculateDistance(
      pickupCoords.lat, pickupCoords.lng,
      destinationCoords.lat, destinationCoords.lng
    );

    try {
      const response = await fetch('https://60h5imcl10ww.manus.space/api/rides/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distance_km: distance })
      });

      const data = await response.json();
      setFare({ distance: distance.toFixed(2), amount: data.estimated_fare });
    } catch (error) {
      console.error('Error calculating fare:', error);
      alert('Failed to calculate fare. Please try again.');
    }
  };

  const handleRequestRide = async () => {
    if (!email || !phone || !pickupCoords || !destinationCoords || !fare) {
      alert('Please complete all fields and calculate fare first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://60h5imcl10ww.manus.space/api/rides/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: email,
          customer_phone: phone,
          pickup_address: pickupAddress,
          pickup_lat: pickupCoords.lat,
          pickup_lng: pickupCoords.lng,
          destination_address: destinationAddress,
          destination_lat: destinationCoords.lat,
          destination_lng: destinationCoords.lng,
          distance_km: parseFloat(fare.distance),
          estimated_fare: fare.amount
        })
      });

      if (response.ok) {
        setRideRequested(true);
        setTimeout(() => {
          // Reset form
          setEmail('');
          setPhone('');
          setPickupAddress('');
          setDestinationAddress('');
          setPickupCoords(null);
          setDestinationCoords(null);
          setFare(null);
          setRideRequested(false);
        }, 5000);
      } else {
        alert('Failed to request ride. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting ride:', error);
      alert('Failed to request ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (rideRequested) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-xl border border-green-100">
          <div className="flex justify-center mb-6">
            <div className="bg-green-500 p-4 rounded-full animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Ride Requested Successfully!
          </h2>
          <p className="text-gray-600 text-center mb-2">
            A driver will accept your request shortly.
          </p>
          <p className="text-gray-500 text-sm text-center">
            You'll be contacted at {phone}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 p-6">
      {/* Left Column - Form */}
      <div className="space-y-6">
        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Your Information
            </h3>
          </div>
          
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="+30 694 123 4567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Pickup Location
            </h3>
          </div>
          
          <div className="p-5 space-y-3">
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="e.g., Kos Town, Kos, Greece"
            />
            <button
              onClick={handleSetPickup}
              disabled={loading || !pickupAddress}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Loading...</>
              ) : pickupCoords ? (
                <><CheckCircle2 className="w-5 h-5" /> Pickup Set</>
              ) : (
                <><Navigation className="w-5 h-5" /> Set Pickup</>
              )}
            </button>
          </div>
        </div>

        {/* Destination */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 p-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Destination
            </h3>
          </div>
          
          <div className="p-5 space-y-3">
            <input
              type="text"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="e.g., Tigaki Beach, Kos, Greece"
            />
            <button
              onClick={handleSetDestination}
              disabled={loading || !destinationAddress}
              className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Loading...</>
              ) : destinationCoords ? (
                <><CheckCircle2 className="w-5 h-5" /> Destination Set</>
              ) : (
                <><MapPin className="w-5 h-5" /> Set Destination</>
              )}
            </button>
          </div>
        </div>

        {/* Fare Calculation */}
        {pickupCoords && destinationCoords && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Trip Details
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              {fare && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Distance</span>
                    <span className="text-gray-900 font-bold text-lg">{fare.distance} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Estimated Fare</span>
                    <span className="text-blue-600 font-bold text-2xl">€{fare.amount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {!fare ? (
                <button
                  onClick={handleCalculateFare}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Calculate Fare
                </button>
              ) : (
                <button
                  onClick={handleRequestRide}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Requesting...</>
                  ) : (
                    <><Send className="w-6 h-6" /> Request Ride</>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Map */}
      <div className="lg:sticky lg:top-6 h-fit">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Route Map
            </h3>
            <p className="text-orange-100 text-sm mt-1">View your pickup and destination</p>
          </div>
          
          <div className="h-[600px]">
            <MapComponent
              pickupCoords={pickupCoords}
              destinationCoords={destinationCoords}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
