import apiClient from './client'
import { Driver } from '../types/driver'

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  driver: Driver
}

export interface SignupPayload {
  name: string
  email: string
  password: string
  phone: string
  vehicle_model: string
  vehicle_plate: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const signupDriver = async (payload: SignupPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/driver/signup', payload)
  return data
}

export const loginDriver = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/driver/login', payload)
  return data
}

export const logoutDriver = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/driver/logout')
  } catch (error) {
    // Ignore network errors during logout; client state will be cleared locally.
  }
}
