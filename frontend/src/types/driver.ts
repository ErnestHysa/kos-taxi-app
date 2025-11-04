export interface Driver {
  id: number
  name: string
  email: string
  phone: string
  vehicle_model: string
  vehicle_plate: string
  is_available: boolean
  current_lat: number | null
  current_lon: number | null
  created_at: string | null
  updated_at: string | null
  last_login_at: string | null
}
