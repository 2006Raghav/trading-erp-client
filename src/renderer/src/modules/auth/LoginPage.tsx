import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, from, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier.trim() || !password.trim()) {
      setError('Enter your username and password.')
      return
    }
    setLoading(true)
    setError('')
    const result = await login(identifier.trim(), password)
    setLoading(false)
    if (!result.success) setError(result.error || 'Login failed. Check your credentials.')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    lineHeight: '20px',
    border: `1px solid var(--border)`,
    borderRadius: '8px',
    color: 'var(--text-primary)',
    background: 'var(--bg-canvas)',
    outline: 'none',
    fontFamily: 'var(--font-ui)'
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-sidebar)' }}
    >
      {/* Card */}
      <div
        className="w-full border border-[var(--border)]"
        style={{
          maxWidth: '400px',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-modal)',
          padding: '40px'
        }}
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center text-white font-bold mb-4"
            style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'var(--action)',
              fontSize: '16px'
            }}
          >
            !
          </div>
          <h2 className="text-heading-m" style={{ color: 'var(--text-primary)' }}>
            Xclamation
          </h2>
          <p
            className="text-caption uppercase tracking-widest mt-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            Enterprise Commodity Trading
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Error */}
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-btn text-body-s"
              style={{
                background: 'var(--danger-bg)',
                color: 'var(--danger-text)',
                border: `1px solid var(--danger-text)`
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            {' '}
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Sign in</h1>
            <p className="text-[var(--text-secondary)] text-sm mb-8">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[var(--action)] hover:text-[var(--action-hover)] font-medium"
              >
                Register
              </Link>
            </p>
            <div>
              <label
                className="block text-caption uppercase mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Username or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={inputStyle}
                placeholder="your.username"
                autoFocus
                autoComplete="username"
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--action)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                }}
              />
            </div>
            <div>
              <label
                className="block text-caption uppercase mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingRight: '42px'
                  }}
                  autoComplete="current-password"
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--action)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)'
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold text-body-m text-white transition-colors"
              style={{
                height: '40px',
                borderRadius: '8px',
                background: loading ? 'var(--action-hover)' : 'var(--action)',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLElement).style.background = 'var(--action-hover)'
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.currentTarget as HTMLElement).style.background = 'var(--action)'
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
