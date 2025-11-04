import axios, { AxiosError } from 'axios'
import { useCallback, useState } from 'react'

import apiClient from './client'
import { Ride, RideStatus } from '../types/ride'
import type { PaymentSummary } from '../types/payment'

export interface RideEstimatePayload {
  pickupAddress: string
  dropoffAddress: string
  scheduledTime: string
  passengerCount: number
}

export interface RideEstimateResponse {
  distanceKm: number
  durationMinutes: number
  fare: number
}

export interface CreateRidePayload extends RideEstimatePayload {
  riderName: string
  riderEmail: string
  riderPhone: string
  notes?: string
}

export type RideDto = Ride

export interface CreateRideResponse {
  ride: RideDto
  estimate: RideEstimateResponse
  payment?: (PaymentSummary & { placeholder?: boolean; message?: string }) | null
  payment_error?: string | null
  publishable_key?: string | null
}

export const normaliseError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { error?: string; message?: string; details?: Record<string, unknown> } | undefined
    if (responseData?.error) {
      return responseData.error
    }
    if (responseData?.details) {
      const detailsMessage = Object.values(responseData.details).find(
        (value) => typeof value === 'string' && value.length > 0,
      )
      if (typeof detailsMessage === 'string') {
        return detailsMessage
      }
    }
    if (responseData?.message) {
      return responseData.message
    }
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error occurred.'
}

export const useRideEstimate = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const estimateRide = useCallback(
    async (payload: RideEstimatePayload): Promise<RideEstimateResponse> => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await apiClient.post<RideEstimateResponse>('/rides/estimate', payload)
        return data
      } catch (err) {
        const message = normaliseError(err)
        setError(message)
        throw new Error(message, { cause: err })
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { estimateRide, loading, error } as const
}

export const useCreateRide = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createRide = useCallback(
    async (payload: CreateRidePayload): Promise<CreateRideResponse> => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await apiClient.post<CreateRideResponse>('/rides', payload)
        return data
      } catch (err) {
        const message = normaliseError(err)
        setError(message)
        throw new Error(message, { cause: err })
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { createRide, loading, error } as const
}

export const fetchPendingRides = async (): Promise<RideDto[]> => {
  const { data } = await apiClient.get<{ rides: RideDto[] }>('/rides/pending')
  return data.rides ?? []
}

export const fetchAssignedRides = async (statuses?: RideStatus[]): Promise<RideDto[]> => {
  const params = statuses && statuses.length > 0 ? { status: statuses.join(',') } : undefined
  const { data } = await apiClient.get<{ rides: RideDto[] }>('/drivers/me/assigned-rides', {
    params,
  })
  return data.rides ?? []
}

export const acceptRideRequest = async (rideId: number): Promise<RideDto> => {
  const { data } = await apiClient.post<{ ride: RideDto }>('/drivers/me/rides/' + rideId + '/accept')
  return data.ride
}

export const updateRideStatus = async (
  rideId: number,
  status: RideStatus,
): Promise<RideDto> => {
  const { data } = await apiClient.patch<{ ride: RideDto }>('/drivers/me/rides/' + rideId + '/status', {
    status,
  })
  return data.ride
}

export const isAxiosError = (error: unknown): error is AxiosError => axios.isAxiosError(error)
