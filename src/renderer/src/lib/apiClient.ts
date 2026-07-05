import { tokenStorage } from '../platform'

// VITE_API_URL is set in .env files and injected at build time.
// In dev: http://localhost:3001
// In prod: https://your-railway-app.up.railway.app
// The Electron and web build point to the same server — there is one backend.
const BASE = import.meta.env.VITE_API_URL || ''

// ── Core request function ─────────────────────────────────────────────────────
//
// Generic typed fetch wrapper. All actual HTTP calls are funnelled through here.
// Returns parsed JSON directly, or throws an Error with the server's error message.
//
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  // Get token from platform-aware storage (localStorage for web, safeStorage for Electron)
  const token = tokenStorage.get()

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Attach JWT Bearer token if one exists — all protected routes require it
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    // Only include a body for non-GET requests; JSON.stringify(undefined) = undefined
    body: body !== undefined ? JSON.stringify(body) : undefined
  })

  // 401 = JWT expired or invalid. Clear the token and hard-redirect to login.
  // The user must log in again. This handles token expiry transparently.
  if (res.status === 401) {
    tokenStorage.clear()
    window.location.hash = '/login'
    throw new Error('Session expired — please log in again')
  }

  const data = await res.json()

  // Server always returns { success: true, data } or { success: false, error }
  // If the HTTP status is not ok (4xx/5xx), throw with the server's error message
  if (!res.ok) throw new Error(data.error || 'Request failed')

  return data as T
}

// ── Query string builder ──────────────────────────────────────────────────────
//
// Turns a filters object into a URL query string.
// Automatically drops null, undefined, and empty string values so the server
// only receives filters the user actually set.
//
// Usage: api.qs({ search: 'acme', page: 2, creditRating: '' })
// Returns: "search=acme&page=2"   (creditRating dropped because it's empty)
//
function qs(params: Record<string, unknown> = {}): string {
  return new URLSearchParams(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    )
  ).toString()
}

export const api = { request, qs }
