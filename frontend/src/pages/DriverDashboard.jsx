import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, User, MapPin, Clock, LogOut, DollarSign, CheckCircle, RefreshCw, Sparkles, Zap, TrendingUp } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700 animate-gradient-xy"></div>
      
      {/* Animated Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-50 bg-black/20 backdrop-blur-2xl border-b-2 border-white/20 shadow-2xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <motion.div 
                className="relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute inset-0 bg-yellow-400 rounded-2xl blur-xl opacity-60"></div>
                <div className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-3 rounded-2xl shadow-2xl">
                  <Car className="w-7 h-7 text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-black text-white drop-shadow-lg flex items-center gap-2">
                  Kos Taxi
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-sm text-white/80 font-bold">Driver Dashboard</p>
              </div>
            </div>

            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-5 py-3 rounded-2xl transition-all border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5 text-white" />
              <span className="font-bold text-white">Logout</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Driver Info Card */}
          <motion.div 
            className="relative group"
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative bg-gradient-to-r from-orange-500 via-pink-600 to-purple-700 rounded-3xl shadow-2xl p-10 text-white overflow-hidden">
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]"></div>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <motion.div 
                    className="relative"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="absolute inset-0 bg-white/30 rounded-full blur-xl"></div>
                    <div className="relative bg-white/20 backdrop-blur-sm p-5 rounded-2xl border-2 border-white/30">
                      <User className="w-12 h-12" />
                    </div>
                  </motion.div>
                  <div>
                    <h2 className="text-4xl font-black mb-2 drop-shadow-lg">{driver?.name}</h2>
                    <p className="text-white/90 text-xl font-bold">
                      🚗 {driver?.vehicle_model} • {driver?.license_plate}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 border-2 border-white/30">
                    <p className="text-white/80 text-sm mb-2 font-bold">Status</p>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                      <span className="font-black text-2xl">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Pending Requests', value: pendingRides.length, color: 'from-cyan-400 to-blue-500', bg: 'from-cyan-500 to-blue-600' },
              { icon: Zap, title: 'Rides Today', value: '0', color: 'from-green-400 to-emerald-500', bg: 'from-green-500 to-emerald-600' },
              { icon: TrendingUp, title: 'Earnings Today', value: '€0.00', color: 'from-yellow-400 to-orange-500', bg: 'from-yellow-500 to-orange-600' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity`}></div>
                <div className="relative bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-5">
                    <motion.div 
                      className={`bg-gradient-to-br ${stat.bg} p-4 rounded-xl shadow-lg`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-white/80 text-sm font-bold mb-1">{stat.title}</p>
                      <p className="text-4xl font-black text-white drop-shadow-lg">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pending Rides */}
          <motion.div 
            className="relative group"
            whileHover={{ scale: 1.005 }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-white flex items-center gap-4 drop-shadow-lg">
                      <Clock className="w-9 h-9" />
                      Pending Ride Requests
                    </h3>
                    <p className="text-white/90 mt-2 text-xl font-bold">💰 Accept rides to start earning</p>
                  </div>
                  
                  <motion.button
                    onClick={() => fetchPendingRides()}
                    disabled={refreshing}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-2xl transition-all flex items-center gap-3 text-white font-black border-2 border-white/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </motion.button>
                </div>
              </div>

              <div className="p-8">
                {pendingRides.length === 0 ? (
                  <div className="text-center py-20">
                    <motion.div 
                      className="relative inline-block"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl"></div>
                      <div className="relative bg-white/20 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/30">
                        <Clock className="w-12 h-12 text-white" />
                      </div>
                    </motion.div>
                    <h4 className="text-2xl font-black text-white mb-3 drop-shadow-lg">No Pending Rides</h4>
                    <p className="text-white/80 text-lg font-semibold">New ride requests will appear here automatically</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingRides.map((ride, index) => (
                      <motion.div
                        key={ride.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-white/40 transition-all shadow-xl"
                      >
                        <div className="space-y-5">
                          {/* Pickup */}
                          <div className="flex items-start gap-4">
                            <div className="bg-green-500 p-3 rounded-xl mt-1 shadow-lg">
                              <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-white mb-2 text-lg">📍 Pickup Location</p>
                              <p className="text-white/90 text-lg font-semibold">{ride.pickup_address}</p>
                            </div>
                          </div>

                          {/* Destination */}
                          <div className="flex items-start gap-4">
                            <div className="bg-red-500 p-3 rounded-xl mt-1 shadow-lg">
                              <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-white mb-2 text-lg">🎯 Destination</p>
                              <p className="text-white/90 text-lg font-semibold">{ride.destination_address}</p>
                            </div>
                          </div>

                          {/* Details & Action */}
                          <div className="flex items-center justify-between pt-6 border-t-2 border-white/20">
                            <div className="flex gap-10">
                              <div>
                                <p className="text-sm text-white/70 mb-2 font-bold">Distance</p>
                                <p className="font-black text-white text-2xl">
                                  {ride.distance_km?.toFixed(1)} km
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-white/70 mb-2 font-bold">Fare</p>
                                <p className="font-black text-yellow-300 text-2xl drop-shadow-lg">
                                  €{ride.estimated_fare?.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-white/70 mb-2 font-bold">Customer</p>
                                <p className="font-black text-white text-2xl">
                                  {ride.customer_phone}
                                </p>
                              </div>
                            </div>

                            <motion.button
                              onClick={() => handleAcceptRide(ride.id)}
                              className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-xl hover:from-green-500 hover:to-emerald-600 transition-all shadow-2xl flex items-center gap-3"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <CheckCircle className="w-7 h-7" />
                              Accept Ride
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
