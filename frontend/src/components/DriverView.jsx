import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Car, User, Phone, Mail, MapPin, Navigation, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'

const API_URL = window.location.origin

export default function DriverView() {
  const [driverForm, setDriverForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleModel: '',
    vehiclePlate: ''
  })
  
  const [driverId, setDriverId] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [pendingRides, setPendingRides] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchDrivers()
  }, [])

  useEffect(() => {
    if (driverId) {
      fetchPendingRides()
      const interval = setInterval(fetchPendingRides, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [driverId])

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/drivers`)
      const data = await response.json()
      if (response.ok) {
        setDrivers(data.drivers || [])
      }
    } catch (err) {
      console.error('Failed to fetch drivers:', err)
    }
  }

  const fetchPendingRides = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rides/pending`)
      const data = await response.json()
      if (response.ok) {
        setPendingRides(data.rides || [])
      }
    } catch (err) {
      console.error('Failed to fetch pending rides:', err)
    }
  }

  const handleDriverFormChange = (e) => {
    const { name, value } = e.target
    setDriverForm(prev => ({ ...prev, [name]: value }))
  }

  const handleRegisterDriver = async () => {
    if (!driverForm.name || !driverForm.email || !driverForm.phone || !driverForm.vehicleModel || !driverForm.vehiclePlate) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: driverForm.name,
          email: driverForm.email,
          phone: driverForm.phone,
          vehicle_model: driverForm.vehicleModel,
          vehicle_plate: driverForm.vehiclePlate
        })
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess('Driver registered successfully!')
        setDriverId(data.driver_id)
        fetchDrivers()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to register driver')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDriver = (id) => {
    setDriverId(id)
    setError(null)
  }

  const handleAcceptRide = async (rideId) => {
    if (!driverId) {
      setError('Please select a driver first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/rides/${rideId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId })
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess('Ride accepted! Customer will be notified.')
        fetchPendingRides()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to accept ride')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Driver Registration/Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Driver Registration
              </CardTitle>
              <CardDescription>Register as a new driver</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={driverForm.name}
                  onChange={handleDriverFormChange}
                />
              </div>
              <div>
                <Label htmlFor="driver-email">Email</Label>
                <Input
                  id="driver-email"
                  name="email"
                  type="email"
                  placeholder="driver@email.com"
                  value={driverForm.email}
                  onChange={handleDriverFormChange}
                />
              </div>
              <div>
                <Label htmlFor="driver-phone">Phone</Label>
                <Input
                  id="driver-phone"
                  name="phone"
                  type="tel"
                  placeholder="+30 123 456 7890"
                  value={driverForm.phone}
                  onChange={handleDriverFormChange}
                />
              </div>
              <div>
                <Label htmlFor="vehicleModel">Vehicle Model</Label>
                <Input
                  id="vehicleModel"
                  name="vehicleModel"
                  placeholder="e.g., Toyota Corolla"
                  value={driverForm.vehicleModel}
                  onChange={handleDriverFormChange}
                />
              </div>
              <div>
                <Label htmlFor="vehiclePlate">License Plate</Label>
                <Input
                  id="vehiclePlate"
                  name="vehiclePlate"
                  placeholder="e.g., ABC-1234"
                  value={driverForm.vehiclePlate}
                  onChange={handleDriverFormChange}
                />
              </div>
              <Button 
                onClick={handleRegisterDriver} 
                className="w-full"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Register Driver
              </Button>
            </CardContent>
          </Card>

          {drivers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Driver Account</CardTitle>
                <CardDescription>Choose your driver profile to view rides</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {drivers.map(driver => (
                  <Button
                    key={driver.id}
                    onClick={() => handleSelectDriver(driver.id)}
                    variant={driverId === driver.id ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    <Car className="w-4 h-4 mr-2" />
                    {driver.name} - {driver.vehicle_model}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pending Rides */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Pending Ride Requests
                  </CardTitle>
                  <CardDescription>
                    {driverId ? 'Accept rides to start earning' : 'Select a driver to view rides'}
                  </CardDescription>
                </div>
                {driverId && (
                  <Button
                    onClick={fetchPendingRides}
                    variant="ghost"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!driverId ? (
                <div className="text-center py-8 text-gray-500">
                  <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Please select a driver account first</p>
                </div>
              ) : pendingRides.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Navigation className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No pending rides at the moment</p>
                  <p className="text-sm mt-1">Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRides.map(ride => (
                    <Card key={ride.id} className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">Ride #{ride.id}</Badge>
                            <span className="text-2xl font-bold text-blue-900">
                              €{ride.fare.toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-0.5 text-green-600" />
                              <div>
                                <p className="font-medium">Pickup</p>
                                <p className="text-gray-600">{ride.pickup_address}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Navigation className="w-4 h-4 mt-0.5 text-red-600" />
                              <div>
                                <p className="font-medium">Destination</p>
                                <p className="text-gray-600">{ride.dest_address}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-600" />
                              <p className="text-gray-600">{ride.user_email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-600" />
                              <p className="text-gray-600">{ride.user_phone}</p>
                            </div>
                          </div>

                          <div className="pt-2">
                            <p className="text-xs text-gray-500 mb-2">
                              Distance: {ride.distance_km.toFixed(2)} km
                            </p>
                            <Button
                              onClick={() => handleAcceptRide(ride.id)}
                              className="w-full bg-green-600 hover:bg-green-700"
                              disabled={loading}
                            >
                              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                              Accept Ride
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
