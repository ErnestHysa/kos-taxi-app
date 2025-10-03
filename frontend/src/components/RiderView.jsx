import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { MapPin, Navigation, Phone, Mail, CreditCard, Loader2, CheckCircle2 } from 'lucide-react'
import MapComponent from './MapComponent.jsx'

const API_URL = window.location.origin

export default function RiderView() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    pickupAddress: '',
    destinationAddress: ''
  })
  
  const [pickupCoords, setPickupCoords] = useState(null)
  const [destinationCoords, setDestinationCoords] = useState(null)
  const [estimatedFare, setEstimatedFare] = useState(null)
  const [distance, setDistance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [rideId, setRideId] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Kos, Greece')}&limit=1`
      )
      const data = await response.json()
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        }
      }
      return null
    } catch (err) {
      console.error('Geocoding error:', err)
      return null
    }
  }

  const handleGeocodePickup = async () => {
    if (!formData.pickupAddress) return
    setLoading(true)
    const coords = await geocodeAddress(formData.pickupAddress)
    if (coords) {
      setPickupCoords(coords)
    } else {
      setError('Could not find pickup location. Please try a different address.')
    }
    setLoading(false)
  }

  const handleGeocodeDestination = async () => {
    if (!formData.destinationAddress) return
    setLoading(true)
    const coords = await geocodeAddress(formData.destinationAddress)
    if (coords) {
      setDestinationCoords(coords)
    } else {
      setError('Could not find destination. Please try a different address.')
    }
    setLoading(false)
  }

  const calculateEstimate = async () => {
    if (!pickupCoords || !destinationCoords) {
      setError('Please set both pickup and destination locations')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/rides/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup_lat: pickupCoords.lat,
          pickup_lon: pickupCoords.lon,
          dest_lat: destinationCoords.lat,
          dest_lon: destinationCoords.lon
        })
      })

      const data = await response.json()
      if (response.ok) {
        setEstimatedFare(data.estimated_fare)
        setDistance(data.distance_km)
      } else {
        setError(data.error || 'Failed to calculate estimate')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestRide = async () => {
    if (!formData.email || !formData.phone || !pickupCoords || !destinationCoords) {
      setError('Please fill in all fields and set locations')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/rides/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          pickup_lat: pickupCoords.lat,
          pickup_lon: pickupCoords.lon,
          pickup_address: formData.pickupAddress,
          dest_lat: destinationCoords.lat,
          dest_lon: destinationCoords.lon,
          dest_address: formData.destinationAddress
        })
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess(true)
        setRideId(data.ride_id)
        // Reset form after 5 seconds
        setTimeout(() => {
          setSuccess(false)
          setFormData({ email: '', phone: '', pickupAddress: '', destinationAddress: '' })
          setPickupCoords(null)
          setDestinationCoords(null)
          setEstimatedFare(null)
          setDistance(null)
          setRideId(null)
        }, 5000)
      } else {
        setError(data.error || 'Failed to request ride')
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
          <AlertDescription className="text-green-800">
            Ride requested successfully! Ride ID: {rideId}. A driver will be notified shortly.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+30 123 456 7890"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Pickup Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="pickupAddress">Pickup Address</Label>
                <Input
                  id="pickupAddress"
                  name="pickupAddress"
                  placeholder="e.g., Kos Town Center"
                  value={formData.pickupAddress}
                  onChange={handleInputChange}
                />
              </div>
              <Button 
                onClick={handleGeocodePickup} 
                variant="outline" 
                className="w-full"
                disabled={!formData.pickupAddress || loading}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Set Pickup on Map
              </Button>
              {pickupCoords && (
                <p className="text-sm text-green-600">✓ Pickup location set</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Destination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="destinationAddress">Destination Address</Label>
                <Input
                  id="destinationAddress"
                  name="destinationAddress"
                  placeholder="e.g., Tigaki Beach"
                  value={formData.destinationAddress}
                  onChange={handleInputChange}
                />
              </div>
              <Button 
                onClick={handleGeocodeDestination} 
                variant="outline" 
                className="w-full"
                disabled={!formData.destinationAddress || loading}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Set Destination on Map
              </Button>
              {destinationCoords && (
                <p className="text-sm text-green-600">✓ Destination set</p>
              )}
            </CardContent>
          </Card>

          {estimatedFare && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <CreditCard className="w-5 h-5" />
                  Estimated Fare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-blue-900">€{estimatedFare.toFixed(2)}</p>
                  <p className="text-sm text-blue-700">Distance: {distance.toFixed(2)} km</p>
                  <p className="text-xs text-blue-600">Final fare may vary based on actual route</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Button 
              onClick={calculateEstimate} 
              variant="outline" 
              className="w-full"
              disabled={!pickupCoords || !destinationCoords || loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Calculate Fare
            </Button>
            <Button 
              onClick={handleRequestRide} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || !estimatedFare}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Request Ride
            </Button>
          </div>
        </div>

        {/* Map Section */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Route Map</CardTitle>
              <CardDescription>View your pickup and destination locations</CardDescription>
            </CardHeader>
            <CardContent>
              <MapComponent 
                pickup={pickupCoords}
                destination={destinationCoords}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
