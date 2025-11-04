export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  issuedAt: number
}

const STORAGE_KEY = 'kos_taxi_driver_tokens'

const isBrowser = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export const loadTokens = (): AuthTokens | null => {
  if (!isBrowser()) return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AuthTokens
    if (typeof parsed.accessToken !== 'string' || typeof parsed.refreshToken !== 'string') {
      return null
    }
    return parsed
  } catch (error) {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const storeTokens = (tokens: Omit<AuthTokens, 'issuedAt'> & { issuedAt?: number }): void => {
  if (!isBrowser()) return
  const payload: AuthTokens = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    issuedAt: tokens.issuedAt ?? Date.now(),
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export const clearTokens = (): void => {
  if (!isBrowser()) return
  window.localStorage.removeItem(STORAGE_KEY)
}

export const hasValidAccessToken = (): boolean => {
  const tokens = loadTokens()
  if (!tokens) return false
  const expiry = tokens.issuedAt + tokens.expiresIn * 1000
  return Date.now() < expiry - 5 * 1000
}
