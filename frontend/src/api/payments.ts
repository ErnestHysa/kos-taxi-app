import apiClient from './client'
import type { PaymentSummary } from '../types/payment'

export interface StripeConfigResponse {
  publishableKey: string | null
  configured: boolean
}

export const fetchStripeConfig = async (): Promise<StripeConfigResponse> => {
  const { data } = await apiClient.get<StripeConfigResponse>('/payments/config')
  return data
}

export interface PaymentDetailsResponse {
  payment: (PaymentSummary & { client_secret?: string | null }) | null
  payment_status: string
}

export const fetchPaymentForRide = async (rideId: number): Promise<PaymentDetailsResponse> => {
  const { data } = await apiClient.get<PaymentDetailsResponse>(`/payments/${rideId}`)
  return data
}
