import { tokenStorage } from '../platform'

const BASE =
  ((window as any).electron
    ? (import.meta.env as any).VITE_API_URL_ELECTRON
    : import.meta.env.VITE_API_URL) || 'http://localhost:4000'

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = tokenStorage.get()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
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
