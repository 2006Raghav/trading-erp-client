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
    border: `1px solid var(--color-slate-200)`,
    borderRadius: '8px',
    color: 'var(--color-ink-900)',
    background: 'var(--color-white)',
    outline: 'none',
    fontFamily: 'var(--font-ui)'
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-navy-950)' }}
    >
      {/* Card */}
      <div
        className="w-full"
        style={{
          maxWidth: '400px',
          background: 'var(--color-white)',
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
              background: 'var(--color-cobalt-600)',
              fontSize: '16px'
            }}
          >
            CE
          </div>
          <h2 className="text-heading-m" style={{ color: 'var(--color-ink-900)' }}>
            Commodity ERP
          </h2>
          <p
            className="text-caption uppercase tracking-widest mt-1"
            style={{ color: 'var(--color-slate-500)' }}
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
                background: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                border: `1px solid var(--color-danger)`
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            {' '}
            <h1 className="text-2xl font-bold text-ink-900 mb-1">Sign in</h1>
            <p className="text-slate-500 text-sm mb-8">
              Don't have an account?{' '}
              <Link to="/register" className="text-cobalt-600 hover:text-cobalt-700 font-medium">
                Register
              </Link>
            </p>
            <div>
              <label
                className="block text-caption uppercase mb-1.5"
                style={{ color: 'var(--color-slate-500)' }}
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
                  e.target.style.borderColor = 'var(--color-cobalt-600)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-slate-200)'
                }}
              />
            </div>
            <div>
              <label
                className="block text-caption uppercase mb-1.5"
                style={{ color: 'var(--color-slate-500)' }}
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
                    e.target.style.borderColor = 'var(--color-cobalt-600)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-slate-200)'
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
                    color: 'var(--color-slate-500)',
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
                background: loading ? 'var(--color-cobalt-700)' : 'var(--color-cobalt-600)',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-cobalt-700)'
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-cobalt-600)'
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
