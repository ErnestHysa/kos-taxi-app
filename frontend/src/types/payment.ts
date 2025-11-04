export interface PaymentSummary {
  id: number
  ride_id: number
  payment_intent_id: string
  status: string
  amount: number
  amount_eur: number
  currency: string
  customer_email: string | null
  customer_phone: string | null
  last_error: string | null
  created_at: string | null
  updated_at: string | null
  metadata?: Record<string, unknown>
  client_secret?: string | null
  placeholder?: boolean
  message?: string
}
