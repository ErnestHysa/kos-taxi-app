import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Car, CheckCircle, ClipboardCheck, Phone, Sparkles, User } from 'lucide-react'
import { motion } from 'framer-motion'

import { useDriverProfileQuery, useDriverSignupMutation } from '../state/auth'

interface FormState {
  name: string
  email: string
  password: string
  phone: string
  vehicle_model: string
  vehicle_plate: string
}

const initialState: FormState = {
  name: '',
  email: '',
  password: '',
  phone: '',
  vehicle_model: '',
  vehicle_plate: '',
}

const DriverRegister = () => {
  const navigate = useNavigate()
  const [formState, setFormState] = useState<FormState>(initialState)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: currentDriver } = useDriverProfileQuery()
  const signupMutation = useDriverSignupMutation()

  useEffect(() => {
    if (currentDriver) {
      navigate('/driver/dashboard')
    }
  }, [currentDriver, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    try {
      await signupMutation.mutateAsync(formState)
      navigate('/driver/dashboard')
    } catch (error) {
      setErrorMessage('Unable to create your driver account. Please review the details and try again.')
    }
  }

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-orange-500 via-pink-600 to-purple-700 animate-gradient-xy" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/30 rounded-full blur-3xl"
          animate={{ x: [0, 120, 0], y: [0, 40, 0], scale: [1, 1.25, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-cyan-400/30 rounded-full blur-3xl"
          animate={{ x: [0, -60, 0], y: [0, -60, 0], scale: [1, 1.35, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <header className="relative z-10 bg-black/20 backdrop-blur-2xl border-b-2 border-white/20 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.button
              onClick={() => navigate('/')}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
            <div className="flex items-center gap-3">
              <motion.div className="relative" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <div className="absolute inset-0 bg-yellow-400 rounded-2xl blur-xl opacity-60" />
                <div className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-3 rounded-2xl shadow-2xl">
                  <Car className="w-7 h-7 text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-black text-white drop-shadow-lg flex items-center gap-2">
                  Become a Kos Taxi Driver
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-sm text-white/80 font-bold">Complete the form to start accepting rides</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-2 p-10 border-r border-white/10 space-y-6 hidden md:flex flex-col">
                  <h2 className="text-3xl font-black">Why drive with Kos Taxi?</h2>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Access the official driver dashboard, get real-time ride assignments, and manage your availability from any device.
                  </p>
                  <div className="bg-white/10 rounded-2xl p-6 border border-white/10 space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-300" />
                      <span className="font-semibold">Verified payouts every week</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="w-6 h-6 text-yellow-300" />
                      <span className="font-semibold">Instant ride updates and alerts</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-pink-300" />
                      <span className="font-semibold">Premium rider support and navigation</span>
                    </div>
                  </div>
                </div>

                <form className="md:col-span-3 p-10 space-y-6" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-white/80" htmlFor="name">
                        Full name
                      </label>
                      <div className="mt-2 relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                        <input
                          id="name"
                          type="text"
                          required
                          className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                          placeholder="Alex Driver"
                          value={formState.name}
                          onChange={(event) => updateField('name', event.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-white/80" htmlFor="email">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        placeholder="driver@example.com"
                        value={formState.email}
                        onChange={(event) => updateField('email', event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-white/80" htmlFor="password">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        placeholder="Create a secure password"
                        value={formState.password}
                        onChange={(event) => updateField('password', event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-white/80" htmlFor="phone">
                        Phone number
                      </label>
                      <div className="mt-2 relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                        <input
                          id="phone"
                          type="tel"
                          required
                          className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                          placeholder="+30 123 456 7890"
                          value={formState.phone}
                          onChange={(event) => updateField('phone', event.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-white/80" htmlFor="vehicle_model">
                        Vehicle model
                      </label>
                      <input
                        id="vehicle_model"
                        type="text"
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        placeholder="Toyota Prius"
                        value={formState.vehicle_model}
                        onChange={(event) => updateField('vehicle_model', event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-white/80" htmlFor="vehicle_plate">
                        Vehicle plate
                      </label>
                      <input
                        id="vehicle_plate"
                        type="text"
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        placeholder="ABC-1234"
                        value={formState.vehicle_plate}
                        onChange={(event) => updateField('vehicle_plate', event.target.value)}
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-red-500/20 border border-red-400/40 text-red-200 px-4 py-3 rounded-2xl">
                      {errorMessage}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 py-4 rounded-2xl font-black text-lg shadow-xl border border-white/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={signupMutation.isPending}
                  >
                    {signupMutation.isPending ? 'Creating account...' : 'Create driver account'}
                  </motion.button>

                  <p className="text-center text-sm text-white/70">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/driver/login')}
                      className="font-semibold text-yellow-200 hover:text-yellow-100"
                    >
                      Sign in to your dashboard
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default DriverRegister
