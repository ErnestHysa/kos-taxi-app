import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import RideBooking from './pages/RideBooking'
import DriverLogin from './pages/DriverLogin'
import DriverRegister from './pages/DriverRegister'
import DriverDashboard from './pages/DriverDashboard'
import { useDriverProfileQuery } from './state/auth'
import './App.css'

const ProtectedRoute = () => {
  const { data: driver, isLoading, isError } = useDriverProfileQuery()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <span className="animate-pulse">Loading driver profile...</span>
      </div>
    )
  }

  if (isError || !driver) {
    return <Navigate to="/driver/login" replace />
  }

  return <Outlet />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ride" element={<RideBooking />} />
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/register" element={<DriverRegister />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
