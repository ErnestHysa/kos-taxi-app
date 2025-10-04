import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Sparkles } from 'lucide-react';
import RiderView from '../components/RiderView';
import { motion } from 'framer-motion';

export default function RideBooking() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 animate-gradient-xy"></div>
      
      {/* Animated Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
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
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
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
            {/* Logo */}
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
                  <p className="text-sm text-white/80 font-bold">Book Your Ride</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <RiderView />
        </motion.div>
      </main>
    </div>
  );
}
