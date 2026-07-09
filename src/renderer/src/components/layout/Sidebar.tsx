import { NavLink } from 'react-router-dom'
import { useAuth } from '../../modules/auth/AuthContext'
import {
  LayoutDashboard,
  Users2,
  Building2,
  Package,
  FileText,
  Ship,
  DollarSign,
  UserCog,
  LogOut,
  type LucideIcon
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  module: string | null
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: null },
  { to: '/buyers', label: 'Buyers', icon: Users2, module: 'buyers' },
  { to: '/sellers', label: 'Sellers', icon: Building2, module: 'sellers' },
  { to: '/products', label: 'Products', icon: Package, module: 'products' },
  { to: '/users', label: 'Users', icon: UserCog, module: 'users' },
  { to: '/inquiries', label: 'Inquiries', icon: FileText, module: 'inquiries', disabled: true },
  { to: '/shipments', label: 'Shipments', icon: Ship, module: 'shipments', disabled: true },
  { to: '/payments', label: 'Payments', icon: DollarSign, module: 'payments', disabled: true }
]

// Deterministic avatar color from entity name — §5.5
const AVATAR_PALETTES = [
  { bg: 'bg-cobalt-100', text: 'text-cobalt-700' },
  { bg: 'bg-[#FEF9E7]', text: 'text-[#C9962E]' }, // gold tint
  { bg: 'bg-[#FDF0EC]', text: 'text-[#BE5F3D]' }, // copper tint
  { bg: 'bg-slate-200', text: 'text-ink-900' }
] as const

export function avatarPalette(name?: string) {
  if (!name) return AVATAR_PALETTES[0] // Add this safety check

  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length]
}

export function Sidebar() {
  const { user, can, logout } = useAuth()
  const palette = user?.fullName ? avatarPalette(user.fullName) : AVATAR_PALETTES[1]
  const initial = user?.fullName?.charAt(0).toUpperCase() ?? '?'

  return (
    <aside
      className="flex flex-col h-full shrink-0"
      style={{ width: '240px', background: 'var(--color-navy-950)' }}
    >
      {/* Wordmark */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--color-navy-700)' }}>
        <div className="flex items-center gap-3">
          {/* Logo mark — 32px square pill */}
          <div
            className="flex items-center justify-center rounded-btn text-white text-xs font-bold shrink-0"
            style={{ width: 32, height: 32, background: 'var(--color-cobalt-600)' }}
          >
            CE
          </div>
          <div>
            <p className="text-white font-semibold text-body-m leading-tight">Commodity ERP</p>
            <p
              className="text-caption uppercase tracking-widest"
              style={{ color: 'var(--color-slate-500)' }}
            >
              Global Trade
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {' '}
        {NAV_ITEMS.map(({ to, label, icon: Icon, module, disabled }) => {
          if (module && !can(module) && !disabled) return null

          if (disabled) {
            return (
              <div
                key={to}
                className="flex items-center gap-3 px-3 cursor-not-allowed select-none"
                style={{ height: '40px', borderRadius: '8px', color: 'var(--color-navy-700)' }}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="text-body-m">{label}</span>
                <span
                  className="ml-auto text-caption uppercase"
                  style={{ color: 'var(--color-navy-700)' }}
                >
                  V2
                </span>
              </div>
            )
          }

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 transition-colors ${
                  isActive
                    ? 'text-white' /* active: white text */
                    : 'text-slate-300 hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                height: '40px',
                borderRadius: '8px',
                background: isActive
                  ? 'var(--color-cobalt-600)' /* §5.4: solid filled pill */
                  : undefined
              })}
              onMouseEnter={(e) => {
                if (!(e.currentTarget as HTMLElement).classList.contains('active')) {
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--color-navy-900)'
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                if (!el.querySelector('[aria-current]')) {
                  el.style.background = ''
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    style={{ color: isActive ? '#fff' : 'inherit' }}
                  />
                  <span className="text-body-m">{label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--color-navy-700)' }}>
        <div className="flex items-center gap-3 px-3 mb-1" style={{ height: '40px' }}>
          {/* Avatar: deterministic palette from full name */}
          <div
            className={`flex items-center justify-center rounded-full text-body-s font-semibold shrink-0 ${palette.bg} ${palette.text}`}
            style={{ width: 32, height: 32 }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-body-s font-medium text-white truncate">{user?.fullName}</p>
            <p className="text-caption capitalize" style={{ color: 'var(--color-slate-500)' }}>
              {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 text-body-m transition-colors"
          style={{
            height: '40px',
            borderRadius: '8px',
            color: 'var(--color-slate-300)'
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = 'var(--color-navy-900)'
            ;(e.currentTarget as HTMLElement).style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = ''
            ;(e.currentTarget as HTMLElement).style.color = 'var(--color-slate-300)'
          }}
        >
          <LogOut size={20} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
