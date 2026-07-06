// src/renderer/src/components/layout/Sidebar.tsx
//
// Left navigation panel. Role-aware: hides items the user's role cannot access.
// V2 modules are shown as disabled with a "V2" badge.

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../modules/auth/AuthContext'
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  FileText,
  Ship,
  DollarSign,
  UserCog,
  LogOut,
  type LucideIcon
} from 'lucide-react'

// ── Nav item definition ───────────────────────────────────────────────────────
// `module` matches keys in ROLE_PERMISSIONS. null means no permission check (dashboard).
// `disabled` = V2 feature: shown but not clickable.
interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  module: string | null
  disabled?: boolean
}

// To add a new nav item: add one entry here. Nothing else needs to change.
const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: null },
  { to: '/buyers', label: 'Buyers', icon: Users, module: 'buyers' },
  { to: '/sellers', label: 'Sellers', icon: Building2, module: 'sellers' },
  { to: '/products', label: 'Products', icon: Package, module: 'products' },
  { to: '/users', label: 'Users', icon: UserCog, module: 'users' },
  // V2 modules — visible but disabled
  { to: '/inquiries', label: 'Inquiries', icon: FileText, module: 'inquiries', disabled: true },
  { to: '/shipments', label: 'Shipments', icon: Ship, module: 'shipments', disabled: true },
  { to: '/payments', label: 'Payments', icon: DollarSign, module: 'payments', disabled: true }
]

export function Sidebar() {
  const { user, can, logout } = useAuth()

  return (
    <aside className="w-60 bg-brand-900 flex flex-col h-full shrink-0">
      {/* Brand header */}
      <div className="px-5 py-5 border-b border-brand-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-sm">
            📊
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Trading ERP</p>
            <p className="text-brand-300 text-xs">v1.0</p>
          </div>
        </div>
      </div>

      {/* Navigation list — iterates NAV_ITEMS, skips inaccessible ones */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, module, disabled }) => {
          // If the item has a module guard and the user doesn't have permission,
          // hide it entirely (unless it's a disabled V2 placeholder — those always show)
          if (module && !can(module) && !disabled) return null

          // V2 placeholder: looks like a nav item but isn't clickable
          if (disabled) {
            return (
              <div
                key={to}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-brand-500 cursor-not-allowed select-none"
              >
                <Icon size={16} />
                <span className="text-sm">{label}</span>
                <span className="ml-auto text-xs bg-brand-800 px-1.5 py-0.5 rounded text-brand-400">
                  V2
                </span>
              </div>
            )
          }

          // Active item: filled background. Inactive: subtle text that brightens on hover.
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-brand-200 hover:bg-brand-800 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* User badge + logout button */}
      <div className="px-3 py-4 border-t border-brand-700">
        {/* Avatar (first letter of full name) + name + role */}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.fullName}</p>
            <p className="text-brand-300 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-brand-200
                     hover:bg-brand-800 hover:text-white text-sm rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
