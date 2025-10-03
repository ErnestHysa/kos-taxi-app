import { useState, useEffect } from 'react';
import { Car, User, Mail, Phone, CreditCard, CheckCircle, Clock, MapPin, LogOut } from 'lucide-react';

export default function DriverView() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [pendingRides, setPendingRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  
  // Registration form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleModel: '',
    licensePlate: ''
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (selectedDriver) {
      fetchPendingRides();
      const interval = setInterval(fetchPendingRides, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedDriver]);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('https://60h5imcl10ww.manus.space/api/drivers');
      const data = await response.json();
      setDrivers(data.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchPendingRides = async () => {
    try {
      const response = await fetch('https://60h5imcl10ww.manus.space/api/rides/pending');
      const data = await response.json();
      setPendingRides(data.rides || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://60h5imcl10ww.manus.space/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          vehicle_model: formData.vehicleModel,
          license_plate: formData.licensePlate
        })
      });

      if (response.ok) {
        const data = await response.json();
        await fetchDrivers();
        setSelectedDriver(data.driver);
        setShowRegistration(false);
        setFormData({ name: '', email: '', phone: '', vehicleModel: '', licensePlate: '' });
      }
    } catch (error) {
      console.error('Error registering driver:', error);
      alert('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    if (!selectedDriver) return;

    try {
      const response = await fetch(`https://60h5imcl10ww.manus.space/api/rides/${rideId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: selectedDriver.id })
      });

      if (response.ok) {
        fetchPendingRides();
        alert('Ride accepted! Contact the customer to confirm.');
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
      alert('Failed to accept ride. Please try again.');
    }
  };

  const handleLogout = () => {
    setSelectedDriver(null);
    setPendingRides([]);
  };

  // If no drivers exist, show registration
  if (drivers.length === 0 && !showRegistration) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-blue-100">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-500 p-4 rounded-full">
                <Car className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Welcome, Driver!
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Register your vehicle to start accepting ride requests and earning money.
            </p>
            
            <button
              onClick={() => setShowRegistration(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  if (showRegistration || (drivers.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <User className="w-6 h-6" />
              Driver Registration
            </h2>
            <p className="text-blue-100 mt-1">Complete your profile to start driving</p>
          </div>

          <form onSubmit={handleRegister} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="driver@example.com"
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
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+30 694 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vehicle Model
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Mercedes E-Class"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                License Plate
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="KOS-1234"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {drivers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRegistration(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Driver Selection (if not logged in)
  if (!selectedDriver) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Car className="w-6 h-6" />
              Select Your Account
            </h2>
            <p className="text-blue-100 mt-1">Choose your driver profile to continue</p>
          </div>

          <div className="p-6">
            <div className="grid gap-4 mb-6">
              {drivers.map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-full group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-gray-900 text-lg">{driver.name}</h3>
                    <p className="text-gray-600 text-sm">{driver.vehicle_model} • {driver.license_plate}</p>
                  </div>
                  <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowRegistration(true)}
              className="w-full py-3 px-6 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all"
            >
              + Register New Driver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Driver Dashboard
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Driver Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{selectedDriver.name}</h2>
              <p className="text-blue-100">{selectedDriver.vehicle_model} • {selectedDriver.license_plate}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </div>

      {/* Pending Rides */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Pending Ride Requests
          </h3>
          <p className="text-green-100 mt-1">Accept rides to start earning</p>
        </div>

        <div className="p-6">
          {pendingRides.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No pending rides at the moment</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon or refresh the page</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRides.map((ride) => (
                <div
                  key={ride.id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-green-500 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-gray-900">Pickup</span>
                      </div>
                      <p className="text-gray-700 ml-7">{ride.pickup_address}</p>
                    </div>
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-gray-900">Destination</span>
                      </div>
                      <p className="text-gray-700 ml-7">{ride.destination_address}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Distance</p>
                        <p className="font-bold text-gray-900">{ride.distance_km?.toFixed(1)} km</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fare</p>
                        <p className="font-bold text-green-600">€{ride.estimated_fare?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-bold text-gray-900">{ride.customer_phone}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptRide(ride.id)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Accept Ride
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
