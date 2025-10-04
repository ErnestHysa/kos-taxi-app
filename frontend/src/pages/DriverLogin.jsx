import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, User, CheckCircle, ArrowLeft, Plus, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-500 via-pink-600 to-purple-700 animate-gradient-xy"></div>
      
      {/* Animated Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/30 rounded-full blur-3xl"
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
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-400/30 rounded-full blur-3xl"
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
      <header className="relative z-50 bg-black/20 backdrop-blur-2xl border-b-2 border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate('/')}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
              
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
                  <p className="text-sm text-white/80 font-bold">Driver Portal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : drivers.length === 0 ? (
            // No drivers - show registration prompt
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
              
              <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 via-pink-600 to-purple-700 p-12 text-center">
                  <motion.div 
                    className="relative inline-block"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl"></div>
                    <div className="relative bg-white/20 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/30">
                      <Car className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                  <h2 className="text-5xl font-black text-white mb-4 drop-shadow-lg">
                    Welcome, Driver!
                  </h2>
                  <p className="text-white/90 text-xl font-semibold">
                    🚀 Join our network and start earning today
                  </p>
                </div>

                <div className="p-12 text-center">
                  <p className="text-white/90 mb-10 text-xl font-medium">
                    No driver accounts found. Register your vehicle to get started and begin accepting ride requests.
                  </p>
                  
                  <motion.button
                    onClick={() => navigate('/driver/register')}
                    className="bg-white text-pink-600 py-5 px-10 rounded-2xl font-black text-xl hover:bg-yellow-300 hover:text-purple-700 transition-all duration-300 shadow-2xl inline-flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-7 h-7" />
                    Register as Driver
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            // Show driver selection
            <div className="space-y-8">
              <div className="text-center mb-10">
                <h2 className="text-5xl font-black text-white mb-4 drop-shadow-lg">
                  Select Your Account
                </h2>
                <p className="text-white/90 text-xl font-semibold">
                  Choose your driver profile to access your dashboard
                </p>
              </div>

              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.01 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-orange-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
                  <div className="p-8">
                    <div className="space-y-4 mb-6">
                      {drivers.map((driver, index) => (
                        <motion.button
                          key={driver.id}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          onClick={() => handleSelectDriver(driver)}
                          whileHover={{ scale: 1.03, x: 5 }}
                          className="w-full flex items-center gap-5 p-6 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl hover:bg-white/20 hover:border-white/40 transition-all group/item"
                        >
                          <motion.div 
                            className="relative"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-2xl blur-lg opacity-60"></div>
                            <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-600 p-4 rounded-2xl shadow-2xl">
                              <User className="w-8 h-8 text-white" />
                            </div>
                          </motion.div>
                          
                          <div className="flex-1 text-left">
                            <h3 className="font-black text-white text-2xl mb-1 drop-shadow-lg">
                              {driver.name}
                            </h3>
                            <p className="text-white/80 text-lg font-semibold">
                              {driver.vehicle_model} • {driver.license_plate}
                            </p>
                          </div>
                          
                          <motion.div 
                            className="text-yellow-300"
                            initial={{ opacity: 0, scale: 0 }}
                            whileHover={{ opacity: 1, scale: 1 }}
                          >
                            <CheckCircle className="w-8 h-8" />
                          </motion.div>
                        </motion.button>
                      ))}
                    </div>

                    <motion.button
                      onClick={() => navigate('/driver/register')}
                      className="w-full py-5 px-6 bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all flex items-center justify-center gap-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-6 h-6" />
                      Register New Driver
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
