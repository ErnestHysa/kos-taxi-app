import axios, { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { getApiBaseUrl } from '../config/env';

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface RideEstimatePayload {
  pickupAddress: string;
  dropoffAddress: string;
  scheduledTime: string;
  passengerCount: number;
}

export interface RideEstimateResponse {
  distanceKm: number;
  durationMinutes: number;
  fare: number;
}

export interface RideDto {
  id: number;
  pickup_address: string;
  dropoff_address: string;
  destination_address?: string;
  scheduled_time: string | null;
  passenger_count: number;
  distance_km: number;
  estimated_duration_minutes: number;
  fare: number;
  estimated_fare?: number;
  status: string;
  customer_phone?: string | null;
  user_phone?: string | null;
  user_email?: string | null;
  rider_name?: string | null;
  notes?: string | null;
  payment_intent_id?: string | null;
  payment_status?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateRidePayload extends RideEstimatePayload {
  riderName: string;
  riderEmail: string;
  riderPhone: string;
  notes?: string;
}

export interface CreateRideResponse {
  ride: RideDto;
  estimate: RideEstimateResponse;
}

export interface PaymentIntentResponse {
  payment_intent_id: string;
  client_secret: string;
  placeholder?: boolean;
  message?: string;
}

const normaliseError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { error?: string; message?: string; details?: Record<string, unknown> } | undefined;
    if (responseData?.error) {
      return responseData.error;
    }
    if (responseData?.details) {
      const detailsMessage = Object.values(responseData.details).find(
        (value) => typeof value === 'string' && value.length > 0,
      );
      if (typeof detailsMessage === 'string') {
        return detailsMessage;
      }
    }
    if (responseData?.message) {
      return responseData.message;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error occurred.';
};

export const useRideEstimate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimateRide = useCallback(
    async (payload: RideEstimatePayload): Promise<RideEstimateResponse> => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.post<RideEstimateResponse>('/rides/estimate', payload);
        return data;
      } catch (err) {
        const message = normaliseError(err);
        setError(message);
        throw new Error(message, { cause: err });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { estimateRide, loading, error } as const;
};

export const useCreateRide = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRide = useCallback(
    async (payload: CreateRidePayload): Promise<CreateRideResponse> => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.post<CreateRideResponse>('/rides', payload);
        return data;
      } catch (err) {
        const message = normaliseError(err);
        setError(message);
        throw new Error(message, { cause: err });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createRide, loading, error } as const;
};

export const useCreatePaymentIntent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useCallback(
    async (rideId: number): Promise<PaymentIntentResponse> => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.post<PaymentIntentResponse>(`/rides/${rideId}/payment-intent`);
        return data;
      } catch (err) {
        const message = normaliseError(err);
        setError(message);
        throw new Error(message, { cause: err });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createPaymentIntent, loading, error } as const;
};

export const isAxiosError = (error: unknown): error is AxiosError => axios.isAxiosError(error);
