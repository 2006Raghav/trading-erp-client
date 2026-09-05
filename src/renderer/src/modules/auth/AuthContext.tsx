// src/renderer/src/modules/auth/AuthContext.tsx
//
// Holds the current authenticated user and provides login/logout/permission-check.
// Wraps the entire app in App.tsx so every component can access it via useAuth().

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { tokenStorage } from '../../platform'
import { hasPermission } from './permissions'
import type { InternalUser, KycStatus, MandateUser } from '../../lib/types'
import { authApi } from './auth.api'
import type { User } from '../../lib/types'

// ── Context shape ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null           // null when not logged in
  loading: boolean            // true while we check for a stored token on app start
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  // Returns true if the current user's role has access to the given module name.
  can: (module: string) => boolean
  isInternal: boolean
  isBuyer: boolean
  isSeller: boolean
  isMandate: boolean
  isAdmin: boolean
  // KYC helpers for exchange users
  kycApproved: boolean
  kycStatus: KycStatus | null
  rejectionReason: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount: check if we have a token stored from a previous session.
  useEffect(() => {
    async function restoreSession() {
      const token = tokenStorage.get()
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await authApi.me()
        if (res.success) setUser(res.user)
      } catch {
        tokenStorage.clear()
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const res = await authApi.login(identifier, password)
      tokenStorage.set(res.token)
      setUser(res.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' }
    }
  }, [])

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    tokenStorage.clear()
    setUser(null)
    try {
      await authApi.logout()
    } catch {
      // Local session is already cleared
    }
  }, [])

  // ── can ────────────────────────────────────────────────────────────────────
  const can = useCallback((module: string) => hasPermission(user, module), [user])

  // ── Derived KYC helpers ────────────────────────────────────────────────────
  const kycApproved: boolean =
    user?.userType === 'internal'
      ? true
      : (user as BuyerUser | SellerUser | MandateUser | null)?.kycApproved ?? false

  const kycStatus: KycStatus | null =
    user?.userType !== 'internal' && user != null
      ? ((user as BuyerUser | SellerUser | MandateUser).kycStatus ?? null)
      : null

  const rejectionReason: string | null =
    user?.userType !== 'internal' && user != null
      ? ((user as BuyerUser | SellerUser | MandateUser).rejectionReason ?? null)
      : null

  // ── type aliases for brevity in derived values ─────────────────────────────
  type BuyerUser = import('../../lib/types').BuyerUser
  type SellerUser = import('../../lib/types').SellerUser

  const value: AuthContextValue = {
    user,
    loading,
    login,
    logout,
    can,
    isInternal: user?.userType === 'internal',
    isBuyer: user?.userType === 'buyer',
    isSeller: user?.userType === 'seller',
    isMandate: user?.userType === 'mandate',
    isAdmin: user?.userType === 'internal' && (user as InternalUser).role === 'admin',
    kycApproved,
    kycStatus,
    rejectionReason
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
