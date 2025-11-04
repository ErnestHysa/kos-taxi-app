import apiClient from './client'
import type { Ride } from '../types/ride'
import type { Driver } from '../types/driver'
import type { PaymentSummary } from '../types/payment'

export interface AdminOverviewFilters {
  ride_status?: string
  payment_status?: string
  driver_id?: number
}

export interface AdminOverviewResponse {
  filters: {
    ride_status: string
    payment_status: string
    driver_id: number
  }
  rides: Ride[]
  drivers: Driver[]
  payments: PaymentSummary[]
  totals: {
    rides_total: number
    rides_pending: number
    rides_completed: number
    payments_succeeded: number
    payments_failed: number
    drivers_total: number
    revenue_eur: number
  }
}

export const fetchAdminOverview = async (
  filters: AdminOverviewFilters = {},
): Promise<AdminOverviewResponse> => {
  const params = new URLSearchParams()
  if (filters.ride_status && filters.ride_status !== 'all') {
    params.append('ride_status', filters.ride_status)
  }
  if (filters.payment_status && filters.payment_status !== 'all') {
    params.append('payment_status', filters.payment_status)
  }
  if (typeof filters.driver_id === 'number' && filters.driver_id > 0) {
    params.append('driver_id', String(filters.driver_id))
  }
  const queryString = params.toString()
  const url = queryString ? `/admin/overview?${queryString}` : '/admin/overview'
  const { data } = await apiClient.get<AdminOverviewResponse>(url)
  return data
}
