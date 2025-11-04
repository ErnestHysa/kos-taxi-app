export type RideStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'

export interface Ride {
  id: number
  rider_name?: string | null
  user_email?: string | null
  user_phone?: string | null
  driver_id?: number | null
  pickup_lat?: number | null
  pickup_lon?: number | null
  pickup_address: string
  dest_lat?: number | null
  dest_lon?: number | null
  dest_address: string
  dropoff_address?: string | null
  destination_address?: string | null
  status: RideStatus
  fare: number
  distance_km: number
  estimated_duration_minutes: number
  passenger_count: number
  scheduled_time: string | null
  notes?: string | null
  payment_intent_id?: string | null
  payment_status?: string | null
  customer_phone?: string | null
  created_at: string | null
  updated_at: string | null
}
