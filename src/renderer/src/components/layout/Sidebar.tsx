// src/renderer/src/components/layout/Sidebar.tsx
// Sidebar — DASHBOARD_NOTIFICATIONS_DARKMODE_SPEC.md §4.2 (Sidebar Tokens) & §4.5

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../modules/auth/AuthContext'
import {
  LayoutDashboard,
  Users2,
  Building2,
  Package,
  FileText,
  UserCog,
  LogOut,
  ShieldCheck,
  Store,
  ClipboardList,
  Handshake,
  ListTree,
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
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { to: '/buyers', label: 'Buyers', icon: Users2, module: 'buyers' },
  { to: '/sellers', label: 'Sellers', icon: Building2, module: 'sellers' },
  { to: '/mandates', label: 'Mandates', icon: Handshake, module: 'mandates' },
  { to: '/products', label: 'Products', icon: Package, module: 'products' },
  { to: '/catalogue/categories', label: 'Catalogue', icon: ListTree, module: 'products' },
  { to: '/myproducts', label: 'My Products', icon: Package, module: 'myProducts' },
  { to: '/marketplace', label: 'Marketplace', icon: Store, module: 'marketplace' },
  {
    to: '/commodity-requests',
    label: 'Commodity Requests',
    icon: ClipboardList,
    module: 'commodityRequests'
  },
  { to: '/my-deals', label: 'My Deals', icon: FileText, module: 'myDeals' },
  { to: '/users', label: 'Users', icon: UserCog, module: 'users' },
  { to: '/kyc', label: 'KYC Queue', icon: ShieldCheck, module: 'kyc' },
  { to: '/inquiries', label: 'Inquiries', icon: FileText, module: 'inquiries' }
]

// Deterministic avatar color from entity name — §5.5
const AVATAR_PALETTES = [
  { bg: 'bg-cobalt-100', text: 'text-cobalt-700' },
  { bg: 'bg-[#FEF9E7]', text: 'text-[#C9962E]' }, // gold tint
  { bg: 'bg-[#FDF0EC]', text: 'text-[#BE5F3D]' }, // copper tint
  { bg: 'bg-slate-200', text: 'text-ink-900' }
] as const

export function avatarPalette(name?: string) {
  if (!name) return AVATAR_PALETTES[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length]
}

export function Sidebar() {
  const { user, can, logout } = useAuth()
  const displayName = user?.userType === 'internal' ? user.fullName : user?.companyName

  const palette = avatarPalette(displayName)
  const initial = displayName?.charAt(0).toUpperCase() ?? '?'

  return (
    <aside
      id="app-sidebar"
      className="flex flex-col h-full shrink-0"
      style={{
        width: '240px',
        // §4.2 sidebar: dark-sidebar (#070D18) in dark, navy-950 (#16244A) in light
        background: 'var(--bg-sidebar)',
        transition: 'background-color 200ms ease'
      }}
    >
      {/* ── Wordmark ──────────────────────────────────────────────────────── */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border-sidebar)' }}>
        <div className="flex items-center gap-3">
          {/* Logo mark — 32px cobalt pill, unchanged in dark */}
          <div
            className="flex items-center justify-center rounded-btn text-white text-xs font-bold shrink-0"
            style={{ width: 32, height: 32, background: 'var(--action)' }}
          >
            CE
          </div>
          <div>
            <p className="text-white font-semibold text-body-m leading-tight">Commodity ERP</p>
            {/* §4.2: sidebar default text → dark-text-secondary (#8496BF) in dark */}
            <p
              className="text-caption uppercase tracking-widest"
              style={{ color: 'var(--text-secondary)' }}
            >
              Global Trade
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(({ to, label, icon: Icon, module, disabled }) => {
          if (module && !disabled && !can(module)) return null

          if (disabled) {
            return (
              <div
                key={to}
                className="flex items-center gap-3 px-3 cursor-not-allowed select-none"
                style={{
                  height: '40px',
                  borderRadius: '8px',
                  // §4.2: sidebar default text → text-secondary in dark
                  color: 'var(--border-sidebar)'
                }}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="text-body-m">{label}</span>
                <span
                  className="ml-auto text-caption uppercase"
                  style={{ color: 'var(--border-sidebar)' }}
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
                    ? 'text-white' // §4.2: active → white text (same in both modes)
                    : '' // default color set via style below
                }`
              }
              style={({ isActive }) => ({
                height: '40px',
                borderRadius: '8px',
                // §4.2: active → cobalt-600 (#2554E8) — UNCHANGED in dark
                background: isActive ? 'var(--action)' : undefined,
                // §4.2: default text → dark-text-secondary (#8496BF) in dark
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)'
              })}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                const isActive = el.getAttribute('aria-current') === 'page'
                if (!isActive) {
                  // §4.2: sidebar hover → #0F1728 in dark, navy-900 in light
                  el.style.background = 'var(--bg-sidebar-hover)'
                  el.style.color = '#FFFFFF'
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                const isActive = el.getAttribute('aria-current') === 'page'
                if (!isActive) {
                  el.style.background = ''
                  el.style.color = 'var(--text-secondary)'
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

      {/* ── User + Logout ──────────────────────────────────────────────────── */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border-sidebar)' }}>
        {/* User info row */}
        <div className="flex items-center gap-3 px-3 mb-1" style={{ height: '40px' }}>
          <div
            className={`flex items-center justify-center rounded-full text-body-s font-semibold shrink-0 ${palette.bg} ${palette.text}`}
            style={{ width: 32, height: 32 }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-body-s font-medium text-white truncate">{displayName}</p>
            <p className="text-caption capitalize" style={{ color: 'var(--text-secondary)' }}>
              {user?.userType === 'internal' ? user.role : user?.userType}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={async () => {
            await logout()
          }}
          className="flex items-center gap-3 w-full px-3 text-body-m transition-colors"
          style={{
            height: '40px',
            borderRadius: '8px',
            // §4.2: sidebar default text/icon → dark-text-secondary in dark
            color: 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-sidebar-hover)'
            ;(e.currentTarget as HTMLElement).style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = ''
            ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
          }}
        >
          <LogOut size={20} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
