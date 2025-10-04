import { useNavigate } from 'react-router-dom';
import { Car, User, MapPin, Shield, Clock, Star, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: Clock,
      title: 'Fast & Reliable',
      description: 'Quick response times and professional drivers'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Verified drivers and secure payment processing'
    },
    {
      icon: Star,
      title: 'Top Rated',
      description: 'Highest quality service in Kos, Greece'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-2xl">
                <Car className="w-12 h-12 text-white" />
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Kos Taxi
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-4 font-medium">
              Premium Ride Service in Kos, Greece
            </p>
            
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">Serving all of Kos Island</span>
            </div>
          </motion.div>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {/* Rider Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="p-8 md:p-10">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Book a Ride
                  </h2>
                  
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Need transportation? Book a comfortable ride with our professional drivers. Fast, safe, and reliable service.
                  </p>
                  
                  <button
                    onClick={() => navigate('/ride')}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group-hover:gap-4"
                  >
                    Request a Ride
                    <ArrowRight className="w-6 h-6 transition-all" />
                  </button>
                </div>
                
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              </div>
            </motion.div>

            {/* Driver Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="p-8 md:p-10">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Car className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Drive with Us
                  </h2>
                  
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Want to earn money? Join our driver network and start accepting ride requests. Flexible schedule, great earnings.
                  </p>
                  
                  <button
                    onClick={() => navigate('/driver/login')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group-hover:gap-4"
                  >
                    Get Started
                    <ArrowRight className="w-6 h-6 transition-all" />
                  </button>
                </div>
                
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600"></div>
              </div>
            </motion.div>
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">
              © 2025 Kos Taxi. Premium ride-hailing service in Kos, Greece.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Powered by</span>
              <span className="font-semibold text-blue-600">Stripe</span>
              <span>•</span>
              <span className="font-semibold text-green-600">OpenStreetMap</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
