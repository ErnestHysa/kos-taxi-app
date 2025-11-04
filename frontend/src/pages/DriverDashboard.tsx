import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Car,
  CheckCircle,
  Clock,
  LogOut,
  MapPin,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { useDriverLogoutMutation, useDriverProfileQuery } from '../state/auth'
import {
  useAcceptRideMutation,
  useAssignedRidesQuery,
  usePendingRidesQuery,
  useUpdateRideStatusMutation,
} from '../state/rides'
import { Ride, RideStatus } from '../types/ride'

const statusColours: Record<RideStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-200 border-yellow-300/30',
  accepted: 'bg-blue-500/20 text-blue-200 border-blue-300/30',
  in_progress: 'bg-indigo-500/20 text-indigo-200 border-indigo-300/30',
  completed: 'bg-emerald-500/20 text-emerald-200 border-emerald-300/30',
  cancelled: 'bg-rose-500/20 text-rose-200 border-rose-300/30',
}

const statusActionMap: Partial<Record<RideStatus, Array<{ label: string; status: RideStatus; tone: string }>>> = {
  accepted: [
    { label: 'Start ride', status: 'in_progress', tone: 'bg-indigo-500 hover:bg-indigo-400' },
    { label: 'Complete ride', status: 'completed', tone: 'bg-emerald-500 hover:bg-emerald-400' },
    { label: 'Cancel ride', status: 'cancelled', tone: 'bg-rose-500 hover:bg-rose-400' },
  ],
  in_progress: [
    { label: 'Complete ride', status: 'completed', tone: 'bg-emerald-500 hover:bg-emerald-400' },
    { label: 'Cancel ride', status: 'cancelled', tone: 'bg-rose-500 hover:bg-rose-400' },
  ],
  pending: [
    { label: 'Accept ride', status: 'accepted', tone: 'bg-blue-500 hover:bg-blue-400' },
  ],
}

const DriverDashboard = () => {
  const navigate = useNavigate()
  const { data: driver, isLoading } = useDriverProfileQuery()
  const { data: pendingRides = [], isLoading: pendingLoading } = usePendingRidesQuery()
  const { data: assignedRides = [], isLoading: assignedLoading } = useAssignedRidesQuery()
  const logoutMutation = useDriverLogoutMutation()
  const acceptMutation = useAcceptRideMutation()
  const updateStatusMutation = useUpdateRideStatusMutation()

  const activeRides = useMemo(() => assignedRides.filter((ride) => ride.status !== 'completed' && ride.status !== 'cancelled'), [assignedRides])
  const completedToday = useMemo(
    () =>
      assignedRides.filter((ride) => ride.status === 'completed').length,
    [assignedRides],
  )

  const handleAcceptRide = async (rideId: number) => {
    try {
      await acceptMutation.mutateAsync(rideId)
    } catch (error) {
      window.alert('Unable to accept the ride. Please try again.')
    }
  }

  const handleStatusUpdate = async (rideId: number, status: RideStatus) => {
    try {
      if (status === 'accepted') {
        await handleAcceptRide(rideId)
      } else {
        await updateStatusMutation.mutateAsync({ rideId, status })
      }
    } catch (error) {
      window.alert('Unable to update the ride status. Please try again.')
    }
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    navigate('/driver/login')
  }

  if (isLoading || !driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
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

      <header className="relative z-50 bg-black/20 backdrop-blur-2xl border-b-2 border-white/20 shadow-2xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <motion.div className="relative" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <div className="absolute inset-0 bg-yellow-400 rounded-2xl blur-xl opacity-60" />
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
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-5 h-5 text-white" />
              <span className="font-bold text-white">{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
            </motion.button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-gradient-to-r from-orange-500 via-pink-600 to-purple-700 rounded-3xl shadow-2xl p-10 text-white overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-3xl font-black mb-2 flex items-center gap-2">
                    Welcome back, {driver.name}
                    <CheckCircle className="w-6 h-6 text-emerald-300" />
                  </h2>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Manage your active rides, update ride statuses, and stay on top of passenger requests in real time.
                  </p>
                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <p className="text-sm uppercase tracking-wide text-white/60">Vehicle</p>
                      <p className="text-xl font-bold">{driver.vehicle_model}</p>
                      <p className="text-sm text-white/70">Plate {driver.vehicle_plate}</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <p className="text-sm uppercase tracking-wide text-white/60">Availability</p>
                      <p className="text-xl font-bold flex items-center gap-2">
                        {driver.is_available ? 'Online' : 'Offline'}
                        <span className={`w-3 h-3 rounded-full ${driver.is_available ? 'bg-emerald-300' : 'bg-rose-400'}`} />
                      </p>
                      <p className="text-sm text-white/70">Tap rides below to update your status.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-white/60">Active rides</p>
                      <p className="text-3xl font-black">{activeRides.length}</p>
                    </div>
                    <Zap className="w-12 h-12 text-yellow-200" />
                  </div>
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-white/60">Completed rides</p>
                      <p className="text-3xl font-black">{completedToday}</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-emerald-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition duration-500" />
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="p-8 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-2">
                    Pending requests
                    <RefreshCw className={`w-5 h-5 ${pendingLoading ? 'animate-spin' : ''}`} />
                  </h3>
                  <p className="text-white/70 text-sm">New ride requests waiting for acceptance</p>
                </div>
                <span className="text-3xl font-black">{pendingRides.length}</span>
              </div>

              <div className="divide-y divide-white/10">
                {pendingRides.length === 0 && (
                  <div className="p-8 text-center text-white/70">
                    No pending requests right now. Enjoy the calm before the next ride!
                  </div>
                )}
                {pendingRides.map((ride) => (
                  <div key={ride.id} className="p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">Ride #{ride.id}</p>
                        <p className="text-white/70 text-sm">Requested by {ride.rider_name ?? 'Unknown rider'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColours[ride.status]}`}>
                        {ride.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-yellow-200" />
                        <span>{ride.pickup_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-200" />
                        <span>{ride.estimated_duration_minutes} mins • {ride.distance_km} km</span>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => handleAcceptRide(ride.id)}
                      className="self-start bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 px-4 py-2 rounded-2xl font-semibold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={acceptMutation.isPending}
                    >
                      {acceptMutation.isPending ? 'Accepting...' : 'Accept ride'}
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition duration-500" />
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="p-8 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-2">
                    Assigned rides
                    <Sparkles className={`w-5 h-5 ${assignedLoading ? 'animate-spin' : ''}`} />
                  </h3>
                  <p className="text-white/70 text-sm">Manage rides that are currently linked to your profile</p>
                </div>
                <span className="text-3xl font-black">{assignedRides.length}</span>
              </div>

              <div className="divide-y divide-white/10">
                {assignedRides.length === 0 && (
                  <div className="p-8 text-center text-white/70">No rides assigned at the moment.</div>
                )}

                {assignedRides.map((ride) => (
                  <AssignedRideCard key={ride.id} ride={ride} onUpdateStatus={handleStatusUpdate} updating={updateStatusMutation.isPending || acceptMutation.isPending} />
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}

interface AssignedRideCardProps {
  ride: Ride
  onUpdateStatus: (rideId: number, status: RideStatus) => Promise<void>
  updating: boolean
}

const AssignedRideCard = ({ ride, onUpdateStatus, updating }: AssignedRideCardProps) => {
  const actions = statusActionMap[ride.status] ?? []

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">Ride #{ride.id}</p>
          <p className="text-white/70 text-sm">Passenger {ride.rider_name ?? 'Unknown'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColours[ride.status]}`}>
          {ride.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm text-white/80">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-yellow-200" />
          <span>{ride.pickup_address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-200" />
          <span>{ride.estimated_duration_minutes} mins • {ride.distance_km} km</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {actions.length === 0 ? (
          <span className="text-white/60 text-sm">No further actions available.</span>
        ) : (
          actions.map((action) => (
            <motion.button
              key={action.status}
              onClick={() => onUpdateStatus(ride.id, action.status)}
              className={`px-4 py-2 rounded-2xl font-semibold text-white transition ${action.tone}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={updating}
            >
              {updating ? 'Updating...' : action.label}
            </motion.button>
          ))
        )}
      </div>
    </div>
  )
}

export default DriverDashboard
