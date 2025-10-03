import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in Leaflet with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function MapComponent({ pickup, destination }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const polylineRef = useRef(null)

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([36.8933, 27.2889], 12) // Kos Island center

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers and polyline
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

    const bounds = []

    // Add pickup marker
    if (pickup) {
      const pickupIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: #22c55e; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
      
      const pickupMarker = L.marker([pickup.lat, pickup.lon], { icon: pickupIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>Pickup Location</b>')
      
      markersRef.current.push(pickupMarker)
      bounds.push([pickup.lat, pickup.lon])
    }

    // Add destination marker
    if (destination) {
      const destIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
      
      const destMarker = L.marker([destination.lat, destination.lon], { icon: destIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>Destination</b>')
      
      markersRef.current.push(destMarker)
      bounds.push([destination.lat, destination.lon])
    }

    // Draw route line if both points exist
    if (pickup && destination) {
      polylineRef.current = L.polyline(
        [[pickup.lat, pickup.lon], [destination.lat, destination.lon]],
        { color: '#3b82f6', weight: 3, opacity: 0.7, dashArray: '10, 10' }
      ).addTo(mapInstanceRef.current)
    }

    // Fit bounds if we have markers
    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [pickup, destination])

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[500px] rounded-lg border-2 border-gray-200"
      style={{ zIndex: 0 }}
    />
  )
}
