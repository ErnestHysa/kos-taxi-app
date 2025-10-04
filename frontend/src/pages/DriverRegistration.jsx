import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, User, Mail, Phone, CreditCard, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/driver/login')}
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
                  <p className="text-xs text-gray-500 font-medium">Driver Registration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all ${
                    currentStep >= step
                      ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step ? <CheckCircle2 className="w-6 h-6" /> : step}
                  </div>
                  {step < 2 && (
                    <div className={`w-20 h-1 rounded-full transition-all ${
                      currentStep > step ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-4">
              <p className="text-gray-600 font-medium">
                Step {currentStep} of 2: {currentStep === 1 ? 'Personal Information' : 'Vehicle Details'}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-8">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                {currentStep === 1 ? (
                  <>
                    <User className="w-8 h-8" />
                    Personal Information
                  </>
                ) : (
                  <>
                    <Car className="w-8 h-8" />
                    Vehicle Details
                  </>
                )}
              </h2>
              <p className="text-purple-100 mt-2 text-lg">
                {currentStep === 1 
                  ? 'Tell us about yourself'
                  : 'Information about your vehicle'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {currentStep === 1 ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg ${
                          errors.name ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg ${
                          errors.email ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="driver@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg ${
                          errors.phone ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="+30 694 123 4567"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Continue
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Vehicle Model */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle Model *
                    </label>
                    <div className="relative">
                      <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.vehicleModel}
                        onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg ${
                          errors.vehicleModel ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Mercedes E-Class"
                      />
                    </div>
                    {errors.vehicleModel && <p className="text-red-500 text-sm mt-1">{errors.vehicleModel}</p>}
                  </div>

                  {/* License Plate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      License Plate *
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.licensePlate}
                        onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg ${
                          errors.licensePlate ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="KOS-1234"
                      />
                    </div>
                    {errors.licensePlate && <p className="text-red-500 text-sm mt-1">{errors.licensePlate}</p>}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all"
                    >
                      Back
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-6 h-6" />
                          Complete Registration
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
