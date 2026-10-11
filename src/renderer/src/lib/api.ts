import { tokenStorage } from '../platform'

export const API_BASE: string =
  ((window as any).electron
    ? (import.meta.env as any).VITE_PROD_URL_ELECTRON || import.meta.env.VITE_API_URL
    : import.meta.env.VITE_API_URL) ||
  (typeof window !== 'undefined' &&
  window.location?.hostname === 'localhost' &&
  window.location?.port !== '4000'
    ? 'http://localhost:4000'
    : typeof window !== 'undefined' && window.location?.origin?.startsWith('http')
      ? window.location.origin
      : 'http://localhost:4000')

export function getWsBaseUrl(): string {
  let base = API_BASE
  if (!base || base.startsWith('/')) {
    if (typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) {
      base = `${window.location.origin}${base}`
    } else {
      base = 'http://localhost:4000'
    }
  }
  return base.replace(/^http/, 'ws')
}

const BASE = API_BASE

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = tokenStorage.get()
  const isFormData = body instanceof FormData
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
  if (!isFormData && body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined
  })
  if (res.status === 401) {
    tokenStorage.clear()
    window.location.hash = '/login'
    throw new Error('Session expired')
  }

  const data = await res.json()
  if (!res.ok) {
    let msg = data.error || 'Request failed'
    if (data.details && typeof data.details === 'object') {
      const detailsArray = Object.entries(data.details).map(
        ([field, errs]: [string, any]) =>
          `${field}: ${Array.isArray(errs) ? errs.join(', ') : String(errs)}`
      )
      if (detailsArray.length > 0) {
        msg = `${msg} (${detailsArray.join('; ')})`
      }
    }
    throw new Error(msg)
  }
  return data
}

const qs = (params: Record<string, unknown> = {}) =>
  new URLSearchParams(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => [k, String(v)])
    )
  ).toString()

export const api = { request, qs }
