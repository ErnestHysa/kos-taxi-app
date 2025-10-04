import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, User, Mail, Phone, CreditCard, ArrowLeft, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DriverRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleModel: '',
    licensePlate: ''
  });

  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    } else if (step === 2) {
      if (!formData.vehicleModel.trim()) newErrors.vehicleModel = 'Vehicle model is required';
      if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;

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
          vehicle_plate: formData.licensePlate
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Remember the driver
        localStorage.setItem('kos_taxi_driver_id', data.driver.id);
        localStorage.setItem('kos_taxi_driver_name', data.driver.name);
        
        // Navigate to dashboard
        navigate('/driver/dashboard', { state: { driver: data.driver } });
      } else {
        alert('Failed to register. Please try again.');
      }
    } catch (error) {
      console.error('Error registering driver:', error);
      alert('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-500 via-teal-600 to-blue-700 animate-gradient-xy"></div>
      
      {/* Animated Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/30 rounded-full blur-3xl"
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
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-400/30 rounded-full blur-3xl"
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
      <header className="relative z-50 bg-black/20 backdrop-blur-2xl border-b-2 border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate('/driver/login')}
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
                  <p className="text-sm text-white/80 font-bold">Driver Registration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-center gap-4">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center gap-4">
                  <motion.div 
                    className={`flex items-center justify-center w-16 h-16 rounded-full font-black text-xl transition-all shadow-2xl ${
                      currentStep >= step
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                        : 'bg-white/20 backdrop-blur-sm text-white/50 border-2 border-white/30'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {currentStep > step ? <CheckCircle2 className="w-8 h-8" /> : step}
                  </motion.div>
                  {step < 2 && (
                    <div className={`w-24 h-2 rounded-full transition-all ${
                      currentStep > step ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-white/20'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <p className="text-white/90 font-bold text-xl">
                Step {currentStep} of 2: {currentStep === 1 ? '👤 Personal Information' : '🚗 Vehicle Details'}
              </p>
            </div>
          </div>

          {/* Form */}
          <motion.div 
            className="relative group"
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 via-teal-600 to-blue-700 p-10">
                <h2 className="text-4xl font-black text-white flex items-center gap-4 drop-shadow-lg">
                  {currentStep === 1 ? (
                    <>
                      <User className="w-10 h-10" />
                      Personal Information
                    </>
                  ) : (
                    <>
                      <Car className="w-10 h-10" />
                      Vehicle Details
                    </>
                  )}
                </h2>
                <p className="text-white/90 mt-3 text-xl font-semibold">
                  {currentStep === 1 
                    ? '✨ Tell us about yourself'
                    : '🚙 Information about your vehicle'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-10">
                {currentStep === 1 ? (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Name */}
                    <div>
                      <label className="block text-lg font-black text-white mb-3">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className={`w-full pl-14 pr-5 py-5 bg-white/90 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all text-lg font-semibold ${
                            errors.name ? 'border-red-500' : 'border-white/30'
                          }`}
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.name && <p className="text-red-300 text-sm mt-2 font-bold">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-lg font-black text-white mb-3">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className={`w-full pl-14 pr-5 py-5 bg-white/90 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all text-lg font-semibold ${
                            errors.email ? 'border-red-500' : 'border-white/30'
                          }`}
                          placeholder="driver@example.com"
                        />
                      </div>
                      {errors.email && <p className="text-red-300 text-sm mt-2 font-bold">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-lg font-black text-white mb-3">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className={`w-full pl-14 pr-5 py-5 bg-white/90 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all text-lg font-semibold ${
                            errors.phone ? 'border-red-500' : 'border-white/30'
                          }`}
                          placeholder="+30 694 123 4567"
                        />
                      </div>
                      {errors.phone && <p className="text-red-300 text-sm mt-2 font-bold">{errors.phone}</p>}
                    </div>

                    <motion.button
                      type="button"
                      onClick={handleNext}
                      className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white py-5 px-6 rounded-2xl font-black text-xl hover:from-yellow-500 hover:to-red-600 transition-all duration-300 shadow-2xl"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue →
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Vehicle Model */}
                    <div>
                      <label className="block text-lg font-black text-white mb-3">
                        Vehicle Model *
                      </label>
                      <div className="relative">
                        <Car className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                          type="text"
                          value={formData.vehicleModel}
                          onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                          className={`w-full pl-14 pr-5 py-5 bg-white/90 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all text-lg font-semibold ${
                            errors.vehicleModel ? 'border-red-500' : 'border-white/30'
                          }`}
                          placeholder="Mercedes E-Class"
                        />
                      </div>
                      {errors.vehicleModel && <p className="text-red-300 text-sm mt-2 font-bold">{errors.vehicleModel}</p>}
                    </div>

                    {/* License Plate */}
                    <div>
                      <label className="block text-lg font-black text-white mb-3">
                        License Plate *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                          type="text"
                          value={formData.licensePlate}
                          onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                          className={`w-full pl-14 pr-5 py-5 bg-white/90 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all text-lg font-semibold ${
                            errors.licensePlate ? 'border-red-500' : 'border-white/30'
                          }`}
                          placeholder="KOS-1234"
                        />
                      </div>
                      {errors.licensePlate && <p className="text-red-300 text-sm mt-2 font-bold">{errors.licensePlate}</p>}
                    </div>

                    <div className="flex gap-4">
                      <motion.button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 px-6 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl font-black text-xl hover:bg-white/30 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ← Back
                      </motion.button>
                      
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white py-5 px-6 rounded-2xl font-black text-xl hover:from-yellow-500 hover:to-red-600 transition-all duration-300 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-7 h-7 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-7 h-7" />
                            Complete Registration
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
