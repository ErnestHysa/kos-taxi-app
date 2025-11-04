import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

import { getApiBaseUrl } from '../config/env'
import { AuthTokens, clearTokens, loadTokens, storeTokens } from '../state/storage'

interface RetriableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let unauthorizedHandler: (() => void) | null = null

export const registerUnauthorizedHandler = (handler: () => void): void => {
  unauthorizedHandler = handler
}

const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let refreshPromise: Promise<AuthTokens | null> | null = null
const refreshQueue: Array<(tokens: AuthTokens | null, error?: AxiosError) => void> = []

const processQueue = (tokens: AuthTokens | null, error?: AxiosError) => {
  refreshQueue.forEach((callback) => callback(tokens, error))
  refreshQueue.length = 0
}

const refreshTokens = async (currentTokens: AuthTokens): Promise<AuthTokens | null> => {
  try {
    const { data } = await axios.post<{
      access_token: string
      refresh_token: string
      expires_in: number
    }>(`${getApiBaseUrl()}/auth/driver/refresh`, {
      refresh_token: currentTokens.refreshToken,
    })

    const updatedTokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      issuedAt: Date.now(),
    }
    storeTokens(updatedTokens)
    return updatedTokens
  } catch (error) {
    clearTokens()
    if (unauthorizedHandler) {
      unauthorizedHandler()
    }
    return null
  }
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = loadTokens()
  if (tokens?.accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${tokens.accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableAxiosRequestConfig | undefined
    if (!originalRequest) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const currentTokens = loadTokens()

      if (!currentTokens?.refreshToken) {
        clearTokens()
        if (unauthorizedHandler) unauthorizedHandler()
        return Promise.reject(error)
      }

      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = refreshTokens(currentTokens)
          .then((tokens) => {
            processQueue(tokens)
            return tokens
          })
          .finally(() => {
            isRefreshing = false
            refreshPromise = null
          })
      }

      return new Promise((resolve, reject) => {
        refreshQueue.push((tokens, refreshError) => {
          if (refreshError) {
            reject(refreshError)
            return
          }

          if (!tokens) {
            reject(error)
            return
          }

          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
          resolve(apiClient(originalRequest as AxiosRequestConfig))
        })

        refreshPromise?.catch((refreshError) => {
          processQueue(null, refreshError as AxiosError)
        })
      })
    }

    return Promise.reject(error)
  },
)

export default apiClient
