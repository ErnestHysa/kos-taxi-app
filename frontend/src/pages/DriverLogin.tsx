import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Car, Lock, Mail, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

import { useDriverLoginMutation, useDriverProfileQuery } from '../state/auth'

const initialFormState = {
  email: '',
  password: '',
}

const DriverLogin = () => {
  const navigate = useNavigate()
  const [formState, setFormState] = useState(initialFormState)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: currentDriver } = useDriverProfileQuery()
  const loginMutation = useDriverLoginMutation()

  useEffect(() => {
    if (currentDriver) {
      navigate('/driver/dashboard')
    }
  }, [currentDriver, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    try {
      await loginMutation.mutateAsync({
        email: formState.email,
        password: formState.password,
      })
      navigate('/driver/dashboard')
    } catch (error) {
      setErrorMessage('Unable to log in with those details. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700 animate-gradient-xy" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-400/30 rounded-full blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -50, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <header className="relative z-10 bg-black/20 backdrop-blur-2xl border-b-2 border-white/20 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  Kos Taxi Driver Portal
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-sm text-white/80 font-bold">Sign in to manage your rides</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-orange-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-10 border-r border-white/10 hidden md:flex flex-col gap-6">
                  <h2 className="text-3xl font-black">Welcome back!</h2>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Sign in using your driver account to view assigned rides, accept new trips, and keep your status up to date in real time.
                  </p>
                  <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-300" /> Highlights
                    </h3>
                    <ul className="space-y-2 text-white/80 text-sm">
                      <li>• View and manage your assigned rides instantly.</li>
                      <li>• Update ride status with a single tap.</li>
                      <li>• Automatic session refresh keeps you online.</li>
                    </ul>
                  </div>
                </div>

                <form className="p-10 space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="text-sm font-semibold text-white/80" htmlFor="email">
                      Email address
                    </label>
                    <div className="mt-2 relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        placeholder="driver@example.com"
                        value={formState.email}
                        onChange={(event) =>
                          setFormState((current) => ({ ...current, email: event.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white/80" htmlFor="password">
                      Password
                    </label>
                    <div className="mt-2 relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        placeholder="Enter your password"
                        value={formState.password}
                        onChange={(event) =>
                          setFormState((current) => ({ ...current, password: event.target.value }))
                        }
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
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
                  </motion.button>

                  <p className="text-center text-sm text-white/70">
                    New to Kos Taxi?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/driver/register')}
                      className="font-semibold text-yellow-200 hover:text-yellow-100"
                    >
                      Create a driver account
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

export default DriverLogin
