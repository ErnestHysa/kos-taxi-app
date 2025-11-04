/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_APP_ENV?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string
  readonly VITE_SENTRY_PROFILES_SAMPLE_RATE?: string
  readonly VITE_METRICS_ENDPOINT?: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}
