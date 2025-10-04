import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, User, MapPin, Clock, LogOut, TrendingUp, DollarSign, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [driver, setDriver] = useState(null);
  const [pendingRides, setPendingRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Get driver from location state or localStorage
    const driverFromState = location.state?.driver;
    const driverId = location.state?.driverId || localStorage.getItem('kos_taxi_driver_id');
    
    if (driverFromState) {
      setDriver(driverFromState);
      setLoading(false);
    } else if (driverId) {
      // Fetch driver details
      fetchDriverDetails(driverId);
    } else {
      // No driver info, redirect to login
      navigate('/driver/login');
      return;
    }

    fetchPendingRides();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchPendingRides(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [location, navigate]);

  const fetchDriverDetails = async (driverId) => {
    try {
      const response = await fetch('https://60h5imcl10ww.manus.space/api/drivers');
      const data = await response.json();
      const foundDriver = data.drivers?.find(d => d.id === parseInt(driverId));
      
      if (foundDriver) {
        setDriver(foundDriver);
      } else {
        navigate('/driver/login');
      }
    } catch (error) {
      console.error('Error fetching driver:', error);
      navigate('/driver/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRides = async (silent = false) => {
    if (!silent) setRefreshing(true);
    
    try {
      const response = await fetch('https://60h5imcl10ww.manus.space/api/rides/pending');
      const data = await response.json();
      setPendingRides(data.rides || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    if (!driver) return;

    try {
      const response = await fetch(`https://60h5imcl10ww.manus.space/api/rides/${rideId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driver.id })
      });

      if (response.ok) {
        fetchPendingRides();
        // Show success notification
        alert('Ride accepted! Contact the customer to confirm.');
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
      alert('Failed to accept ride. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kos_taxi_driver_id');
    localStorage.removeItem('kos_taxi_driver_name');
    navigate('/driver/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 rounded-xl shadow-lg">
                <Car className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Kos Taxi
                </h1>
                <p className="text-xs text-gray-500 font-medium">Driver Dashboard</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Driver Info Card */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl shadow-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">{driver?.name}</h2>
                  <p className="text-purple-100 text-lg">
                    {driver?.vehicle_model} • {driver?.license_plate}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                  <p className="text-purple-100 text-sm mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-bold text-xl">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Pending Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingRides.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Rides Today</p>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Earnings Today</p>
                  <p className="text-3xl font-bold text-gray-900">€0.00</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Pending Rides */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Clock className="w-7 h-7" />
                    Pending Ride Requests
                  </h3>
                  <p className="text-green-100 mt-1 text-lg">Accept rides to start earning</p>
                </div>
                
                <button
                  onClick={() => fetchPendingRides()}
                  disabled={refreshing}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-white font-semibold"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="p-6">
              {pendingRides.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">No Pending Rides</h4>
                  <p className="text-gray-500">New ride requests will appear here automatically</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRides.map((ride, index) => (
                    <motion.div
                      key={ride.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border-2 border-gray-200 rounded-2xl p-6 hover:border-green-500 hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="space-y-4">
                        {/* Pickup */}
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 p-2 rounded-lg mt-1">
                            <MapPin className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">Pickup Location</p>
                            <p className="text-gray-700">{ride.pickup_address}</p>
                          </div>
                        </div>

                        {/* Destination */}
                        <div className="flex items-start gap-3">
                          <div className="bg-red-100 p-2 rounded-lg mt-1">
                            <MapPin className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">Destination</p>
                            <p className="text-gray-700">{ride.destination_address}</p>
                          </div>
                        </div>

                        {/* Details & Action */}
                        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                          <div className="flex gap-8">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Distance</p>
                              <p className="font-bold text-gray-900 text-lg">
                                {ride.distance_km?.toFixed(1)} km
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Fare</p>
                              <p className="font-bold text-green-600 text-lg">
                                €{ride.estimated_fare?.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Customer</p>
                              <p className="font-bold text-gray-900 text-lg">
                                {ride.customer_phone}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAcceptRide(ride.id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Accept Ride
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
