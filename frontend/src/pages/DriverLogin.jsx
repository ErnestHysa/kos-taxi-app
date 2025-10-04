import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, User, CheckCircle, ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DriverLogin() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
    
    // Check if there's a remembered driver
    const rememberedDriverId = localStorage.getItem('kos_taxi_driver_id');
    if (rememberedDriverId) {
      // Auto-navigate to dashboard if driver is remembered
      navigate('/driver/dashboard', { state: { driverId: rememberedDriverId } });
    }
  }, [navigate]);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('https://60h5imcl10ww.manus.space/api/drivers');
      const data = await response.json();
      setDrivers(data.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDriver = (driver) => {
    // Remember the driver
    localStorage.setItem('kos_taxi_driver_id', driver.id);
    localStorage.setItem('kos_taxi_driver_name', driver.name);
    
    // Navigate to dashboard
    navigate('/driver/dashboard', { state: { driver } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 rounded-xl shadow-lg">
                  <Car className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Kos Taxi
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Driver Portal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : drivers.length === 0 ? (
            // No drivers - show registration prompt
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-8 text-center">
                <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome, Driver!
                </h2>
                <p className="text-purple-100 text-lg">
                  Join our network and start earning today
                </p>
              </div>

              <div className="p-8 text-center">
                <p className="text-gray-600 mb-8 text-lg">
                  No driver accounts found. Register your vehicle to get started and begin accepting ride requests.
                </p>
                
                <button
                  onClick={() => navigate('/driver/register')}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  Register as Driver
                </button>
              </div>
            </div>
          ) : (
            // Show driver selection
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Select Your Account
                </h2>
                <p className="text-gray-600 text-lg">
                  Choose your driver profile to access your dashboard
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-8">
                  <div className="space-y-4 mb-6">
                    {drivers.map((driver, index) => (
                      <motion.button
                        key={driver.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => handleSelectDriver(driver)}
                        className="w-full flex items-center gap-4 p-5 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                      >
                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                          <User className="w-7 h-7 text-white" />
                        </div>
                        
                        <div className="flex-1 text-left">
                          <h3 className="font-bold text-gray-900 text-xl mb-1">
                            {driver.name}
                          </h3>
                          <p className="text-gray-600">
                            {driver.vehicle_model} • {driver.license_plate}
                          </p>
                        </div>
                        
                        <div className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CheckCircle className="w-7 h-7" />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/driver/register')}
                    className="w-full py-4 px-6 border-2 border-dashed border-gray-300 text-gray-600 rounded-2xl font-semibold hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Register New Driver
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
