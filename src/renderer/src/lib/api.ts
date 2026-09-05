import { tokenStorage } from '../platform'

const BASE =
  ((window as any).electron
    ? (import.meta.env as any).VITE_PROD_URL_ELECTRON
    : import.meta.env.VITE_API_URL) || 'http://localhost:4000'

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = tokenStorage.get()
  const isFormData = body instanceof FormData
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
  if (!isFormData) {
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
  if (!res.ok) throw new Error(data.error || 'Request failed')
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
