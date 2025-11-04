import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './index.css'
import App from './App'
import { initialiseAuthState } from './state/auth'
import { initTelemetry, logEvent, reportError } from './lib/telemetry'

const parseNumber = (value: unknown): number | undefined => {
  const result = typeof value === 'string' ? Number.parseFloat(value) : undefined
  return Number.isFinite(result) ? result : undefined
}

initTelemetry({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE,
  tracesSampleRate: parseNumber(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE),
  profilesSampleRate: parseNumber(import.meta.env.VITE_SENTRY_PROFILES_SAMPLE_RATE),
  metricsEndpoint: import.meta.env.VITE_METRICS_ENDPOINT,
})

const queryClient = new QueryClient()

initialiseAuthState(queryClient)

const rootElement = document.getElementById('root')

if (!rootElement) {
  reportError(new Error('Root element #root not found'))
  throw new Error('Unable to bootstrap application: missing root element')
}

logEvent('Bootstrapping Kos Taxi frontend', {
  environment: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE,
})

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
