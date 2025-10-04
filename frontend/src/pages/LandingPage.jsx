import { useNavigate } from 'react-router-dom';
import { Car, User, MapPin, Shield, Clock, Star, ArrowRight, Sparkles, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 animate-gradient-xy"></div>
      
      {/* Animated Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-400/30 rounded-full blur-3xl"
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
          className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyan-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-pink-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16 pt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo with Glow Effect */}
          <motion.div 
            className="flex items-center justify-center gap-3 mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-3xl blur-2xl opacity-60 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-6 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-6 transition-transform">
                <Car className="w-16 h-16 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.h1 
            className="text-7xl md:text-9xl font-black mb-6 leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-block bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl animate-text-shimmer bg-[length:200%_auto]">
              Kos Taxi
            </span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-block"
          >
            <div className="bg-white/20 backdrop-blur-xl border-2 border-white/30 rounded-full px-8 py-4 shadow-2xl">
              <p className="text-2xl md:text-3xl text-white font-bold mb-2 flex items-center gap-3 justify-center">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                Premium Ride Service
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              </p>
              <div className="flex items-center justify-center gap-2 text-white/90">
                <MapPin className="w-6 h-6 text-cyan-300" />
                <span className="text-xl font-semibold">Kos Island, Greece</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA Cards - Redesigned with Bold Colors */}
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto mb-20">
          {/* Rider Card - Vibrant Design */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="group relative perspective-1000"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
            
            {/* Card Content */}
            <div className="relative bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 rounded-3xl shadow-2xl overflow-hidden transform-gpu">
              {/* Animated Pattern Overlay */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)] animate-pulse"></div>
              </div>
              
              <div className="relative p-10">
                {/* Icon with Animation */}
                <motion.div 
                  className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border-2 border-white/30"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <User className="w-10 h-10 text-white" />
                </motion.div>
                
                <h2 className="text-4xl font-black text-white mb-4 drop-shadow-lg">
                  Book a Ride
                </h2>
                
                <p className="text-white/90 mb-8 text-lg leading-relaxed font-medium">
                  🚀 Need transportation? Book a comfortable ride with our professional drivers. Fast, safe, and reliable service across Kos Island.
                </p>
                
                <motion.button
                  onClick={() => navigate('/ride')}
                  className="w-full bg-white text-blue-600 py-5 px-6 rounded-2xl font-black text-xl hover:bg-yellow-300 hover:text-purple-700 transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 group-hover:gap-5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Request a Ride
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="w-7 h-7" />
                  </motion.div>
                </motion.button>
              </div>
              
              {/* Bottom Accent */}
              <div className="h-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400"></div>
            </div>
          </motion.div>

          {/* Driver Card - Vibrant Design */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            whileHover={{ scale: 1.05, rotateY: -5 }}
            className="group relative perspective-1000"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-pink-500 to-red-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
            
            {/* Card Content */}
            <div className="relative bg-gradient-to-br from-orange-500 via-pink-600 to-red-700 rounded-3xl shadow-2xl overflow-hidden transform-gpu">
              {/* Animated Pattern Overlay */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)] animate-pulse"></div>
              </div>
              
              <div className="relative p-10">
                {/* Icon with Animation */}
                <motion.div 
                  className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border-2 border-white/30"
                  whileHover={{ rotate: -360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Car className="w-10 h-10 text-white" />
                </motion.div>
                
                <h2 className="text-4xl font-black text-white mb-4 drop-shadow-lg">
                  Drive with Us
                </h2>
                
                <p className="text-white/90 mb-8 text-lg leading-relaxed font-medium">
                  💰 Want to earn money? Join our driver network and start accepting ride requests. Flexible schedule, great earnings!
                </p>
                
                <motion.button
                  onClick={() => navigate('/driver/login')}
                  className="w-full bg-white text-pink-600 py-5 px-6 rounded-2xl font-black text-xl hover:bg-yellow-300 hover:text-red-700 transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 group-hover:gap-5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="w-7 h-7" />
                  </motion.div>
                </motion.button>
              </div>
              
              {/* Bottom Accent */}
              <div className="h-3 bg-gradient-to-r from-cyan-400 via-yellow-500 to-pink-400"></div>
            </div>
          </motion.div>
        </div>

        {/* Features Section - Redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16"
        >
          {[
            { icon: Zap, title: 'Lightning Fast', description: 'Quick response times and instant booking', color: 'from-yellow-400 to-orange-500' },
            { icon: Shield, title: 'Super Safe', description: 'Verified drivers and secure payments', color: 'from-green-400 to-cyan-500' },
            { icon: Award, title: 'Top Rated', description: 'Highest quality service in Greece', color: 'from-pink-400 to-purple-500' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity`}></div>
              <div className="relative bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
                <motion.div 
                  className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-xl flex items-center justify-center mb-5 shadow-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-black text-white mb-3 drop-shadow-lg">
                  {feature.title}
                </h3>
                <p className="text-white/80 text-lg font-medium">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-10 shadow-2xl max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { number: '10K+', label: 'Happy Riders' },
              { number: '500+', label: 'Pro Drivers' },
              { number: '4.9★', label: 'Rating' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1 }}
                className="relative"
              >
                <div className="text-5xl font-black text-white mb-2 drop-shadow-lg">
                  {stat.number}
                </div>
                <div className="text-white/80 text-lg font-semibold">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/30 backdrop-blur-xl border-t-2 border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/80 text-sm font-medium">
              © 2025 Kos Taxi. Premium ride-hailing service in Kos, Greece. 🇬🇷
            </p>
            <div className="flex items-center gap-3 text-sm text-white/70 font-medium">
              <span>Powered by</span>
              <span className="px-3 py-1 bg-purple-500/30 rounded-full font-bold text-white">Stripe</span>
              <span>•</span>
              <span className="px-3 py-1 bg-green-500/30 rounded-full font-bold text-white">OpenStreetMap</span>
            </div>
          </div>
        </div>
      </footer>


    </div>
  );
}
