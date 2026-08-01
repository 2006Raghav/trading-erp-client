// src/renderer/src/modules/auth/AuthContext.tsx
//
// Holds the current authenticated user and provides login/logout/permission-check.
// Wraps the entire app in App.tsx so every component can access it via useAuth().

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { tokenStorage } from '../../platform'
import { hasPermission } from './permissions'
import type { InternalUser } from '../../lib/types'
import { authApi } from './auth.api'
import type { User } from '../../lib/types'

// ── Context shape ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null // null when not logged in
  loading: boolean // true while we check for a stored token on app start
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  // Returns true if the current user's role has access to the given module name.
  // Used by ProtectedRoute and Sidebar to hide/show routes and nav items.
  can: (module: string) => boolean
  isInternal: boolean
  isBuyer: boolean
  isSeller: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // start true — we haven't checked yet

  // On mount: check if we have a token stored from a previous session.
  // If we do, call GET /api/auth/me to validate it and get the user object.
  // If the token is expired, the 401 handler in api.ts clears it and redirects to /login.
  useEffect(() => {
    async function restoreSession() {
      const token = tokenStorage.get()
      if (!token) {
        // No token stored — definitely not logged in
        setLoading(false)
        return
      }
      try {
        // Token exists — ask the server if it's still valid
        const res = await authApi.me()
        if (res.success) setUser(res.user)
      } catch {
        // Token is invalid or expired — clear it
        // api.ts already cleared it and redirected if it was a 401
        tokenStorage.clear()
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  // ── login ──────────────────────────────────────────────────────────────────
  // Calls POST /api/auth/login, stores the JWT, sets user state.
  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const res = await authApi.login(identifier, password)
      // Store the JWT token so the next app open restores the session
      tokenStorage.set(res.token)
      setUser(res.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' }
    }
  }, [])

  // ── logout ─────────────────────────────────────────────────────────────────
  // Clears local token first (so even if the server call fails, the user is logged out locally).
  const logout = useCallback(async () => {
    tokenStorage.clear()
    setUser(null)
    try {
      // Best-effort: tell the server to log the logout event
      await authApi.logout()
    } catch {
      // Ignore — the local session is already cleared
    }
  }, [])

  // ── can ────────────────────────────────────────────────────────────────────
  // Role-based permission check for UI visibility.
  // Example: can('buyers') returns false for 'accounts' role.
  const can = useCallback((module: string) => hasPermission(user, module), [user])

  const value: AuthContextValue = {
    user,
    loading,
    login,
    logout,
    can,
    isInternal: user?.userType === 'internal',

    isBuyer: user?.userType === 'buyer',

    isSeller: user?.userType === 'seller',

    isAdmin: user?.userType === 'internal' && (user as InternalUser).role === 'admin'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────────
// Throws if used outside AuthProvider — catches accidental misuse early.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
