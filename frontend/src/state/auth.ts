import { useMutation, useQuery, useQueryClient, QueryClient } from '@tanstack/react-query'

import apiClient from '../api/client'
import { loginDriver, logoutDriver, signupDriver, AuthResponse, LoginPayload, SignupPayload } from '../api/auth'
import { Driver } from '../types/driver'
import { clearTokens, loadTokens, storeTokens } from './storage'
import { registerUnauthorizedHandler } from '../api/client'

const authQueryKeys = {
  base: ['auth'] as const,
  driver: () => [...authQueryKeys.base, 'driver'] as const,
}

const persistAuthResponse = (response: AuthResponse): Driver => {
  storeTokens({
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresIn: response.expires_in,
  })
  return response.driver
}

export const initialiseAuthState = (queryClient: QueryClient): void => {
  registerUnauthorizedHandler(() => {
    clearTokens()
    queryClient.removeQueries({ queryKey: authQueryKeys.base })
  })
}

export const useDriverProfileQuery = () => {
  const tokens = loadTokens()

  return useQuery<Driver, Error>({
    queryKey: authQueryKeys.driver(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ driver: Driver }>('/drivers/me')
      return data.driver
    },
    enabled: Boolean(tokens?.accessToken || tokens?.refreshToken),
    staleTime: 60 * 1000,
  })
}

export const useDriverLoginMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginDriver(payload),
    onSuccess: (response) => {
      const driver = persistAuthResponse(response)
      queryClient.setQueryData(authQueryKeys.driver(), driver)
    },
  })
}

export const useDriverSignupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SignupPayload) => signupDriver(payload),
    onSuccess: (response) => {
      const driver = persistAuthResponse(response)
      queryClient.setQueryData(authQueryKeys.driver(), driver)
    },
  })
}

export const useDriverLogoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => logoutDriver(),
    onSettled: () => {
      clearTokens()
      queryClient.removeQueries({ queryKey: authQueryKeys.base })
    },
  })
}

export const isAuthenticated = (): boolean => {
  const tokens = loadTokens()
  return Boolean(tokens?.accessToken)
}

export const authKeys = authQueryKeys
