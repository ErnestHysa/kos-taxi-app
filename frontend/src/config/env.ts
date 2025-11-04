const normaliseBaseUrl = (value: string): string => value.replace(/\/$/, '');

const rawApiBaseUrl = typeof import.meta !== 'undefined' && import.meta.env
  ? (import.meta.env.VITE_API_BASE_URL as string | undefined)
  : undefined;

export const API_BASE_URL = normaliseBaseUrl(rawApiBaseUrl ?? 'http://localhost:5000/api');

export const getApiBaseUrl = (): string => API_BASE_URL;

export const isDevelopment = (): boolean =>
  typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV === true : false;
