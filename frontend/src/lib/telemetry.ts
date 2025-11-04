import * as Sentry from '@sentry/react'
import { browserTracingIntegration } from '@sentry/react'
import type { Metric } from 'web-vitals'
import { onCLS, onINP, onLCP, onTTFB } from 'web-vitals'

export type TelemetryConfig = {
  dsn?: string
  environment?: string
  tracesSampleRate?: number
  profilesSampleRate?: number
  metricsEndpoint?: string
}

let metricsEndpoint: string | undefined

const normaliseSampleRate = (value: number | undefined): number | undefined => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined
  }
  return Math.max(0, Math.min(1, value))
}

const deliverMetric = (metric: Metric) => {
  const payload = {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
  }

  if (metricsEndpoint) {
    try {
      const body = JSON.stringify(payload)
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(metricsEndpoint, body)
      } else {
        fetch(metricsEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {
          console.debug('[telemetry] metric delivery failed', payload)
        })
      }
    } catch (error) {
      console.debug('[telemetry] unable to serialise metric payload', error)
    }
  } else {
    console.debug('[telemetry] web vital', payload)
  }
}

export const initTelemetry = (config: TelemetryConfig): void => {
  metricsEndpoint = config.metricsEndpoint

  if (config.dsn) {
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment ?? 'development',
      integrations: [browserTracingIntegration()],
      tracesSampleRate: normaliseSampleRate(config.tracesSampleRate) ?? 0.1,
      profilesSampleRate: normaliseSampleRate(config.profilesSampleRate) ?? 0.0,
      replaysSessionSampleRate: 0.0,
      replaysOnErrorSampleRate: 0.0,
    })
  }

  onCLS(deliverMetric)
  onINP(deliverMetric)
  onLCP(deliverMetric)
  onTTFB(deliverMetric)
}

export const logEvent = (message: string, context?: Record<string, unknown>): void => {
  console.info(`[KosTaxi] ${message}`, context ?? '')
  Sentry.addBreadcrumb({
    category: 'log',
    level: 'info',
    message,
    data: context,
  })
}

export const reportError = (error: unknown, context?: Record<string, unknown>): void => {
  console.error('[KosTaxi] error', error, context)
  Sentry.captureException(error, {
    extra: context,
  })
}
