// src/renderer/src/modules/auth/LoginPage.tsx
//
// The only public page. Submits credentials to AuthContext.login(),
// which calls POST /api/auth/login via authApi.

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // After login, go back to where the user was trying to reach (or dashboard)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  // Already logged in — skip the login page
  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, from, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Simple client-side presence check — real validation happens server-side
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.')
      return
    }
    setLoading(true)
    setError('')
    const result = await login(username.trim(), password)
    setLoading(false)
    if (!result.success) {
      setError(result.error || 'Login failed. Please try again.')
    }
    // On success: useEffect above picks up the new `user` value and redirects
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 to-brand-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Trading ERP</h1>
          <p className="text-slate-500 text-sm mt-1">Commodity Deal Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error banner — only shown when login fails */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Enter your username"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50
                       text-white font-medium text-sm rounded-lg transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
