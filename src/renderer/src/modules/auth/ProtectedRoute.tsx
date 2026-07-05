import { Navigate, useLocation } from 'react-router-dom'
import { type ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  // If provided, the current user must have permission for this module.
  // Module names match the keys in ROLE_PERMISSIONS in lib/constants.ts
  require?: string
}

export function ProtectedRoute({ children, require: requireModule }: ProtectedRouteProps) {
  const { user, loading, can } = useAuth()
  const location = useLocation()

  // While we're checking the stored token on startup, show a centered spinner.
  // Without this, unauthenticated users would flash the login page on every reload.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Not logged in — redirect to /login, saving where the user was trying to go.
  // After login, AuthContext redirects back to this location.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but wrong role — show access denied message instead of redirect.
  // The user is authenticated, they just don't have permission for this module.
  if (requireModule && !can(requireModule)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-sm">Your role does not have access to this module.</p>
      </div>
    )
  }

  return <>{children}</>
}
