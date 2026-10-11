// src/renderer/src/modules/auth/ProfileModal.tsx
// Interactive Profile modal dialog displayed when clicking "Profile" in the user dropdown.

import { useState } from 'react'
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Building2,
  KeyRound,
  Copy,
  Check,
  X,
  BadgeCheck,
  Clock,
  Briefcase,
  Lock
} from 'lucide-react'
import { useAuth } from './AuthContext'
import { Badge } from '../../components/ui/badge'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenChangePassword?: () => void
}

function getAvatarColor(name: string): { bg: string; text: string } {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const palettes = [
    { bg: 'bg-cobalt-600', text: 'text-white' },
    { bg: 'bg-amber-600', text: 'text-white' },
    { bg: 'bg-emerald-600', text: 'text-white' },
    { bg: 'bg-indigo-600', text: 'text-white' }
  ]
  return palettes[hash % palettes.length]
}

export function ProfileModal({ isOpen, onClose, onOpenChangePassword }: ProfileModalProps) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!isOpen || !user) return null

  const isInternal = user.userType === 'internal'
  const displayName = isInternal
    ? (user as any).fullName || (user as any).username || 'Staff User'
    : (user as any).companyName || (user as any).fullName || 'Exchange User'

  const email = user.email || 'Not configured'
  const initial = displayName.charAt(0).toUpperCase()
  const avatarStyle = getAvatarColor(displayName)

  const getRoleTitle = () => {
    if (isInternal) {
      const role = (user as any).role
      if (role === 'admin') return 'Platform Administrator'
      if (role === 'sales') return 'Sales & Trade Desk'
      if (role === 'accounts') return 'Finance & Accounts'
      if (role === 'documents') return 'Trade Compliance & Documents'
      return 'Internal Staff'
    }
    if (user.userType === 'buyer') return 'Authorized Institutional Buyer'
    if (user.userType === 'seller') return 'Verified Commodity Supplier'
    if (user.userType === 'mandate') {
      const rep = (user as any).represents === 'buyer_side' ? 'Buyer Side' : 'Seller Side'
      return `Accredited Mandate (${rep})`
    }
    return 'Exchange User'
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleChangePasswordClick = () => {
    onClose()
    if (onOpenChangePassword) {
      onOpenChangePassword()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative flex flex-col w-full max-w-lg rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{ background: 'var(--bg-elevated)' }}
      >
        {/* Header */}
        <div
          className="relative px-6 pt-6 pb-5 border-b border-[var(--border)]"
          style={{ background: 'var(--bg-canvas)' }}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className={`w-14 h-14 rounded-2xl ${avatarStyle.bg} ${avatarStyle.text} flex items-center justify-center text-xl font-bold shadow-md shrink-0`}
            >
              {initial}
            </div>

            {/* Title & Role */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {displayName}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] font-bold uppercase tracking-wider py-0 px-2"
                >
                  {user.userType}
                </Badge>
              </div>

              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {getRoleTitle()}
              </p>

              {/* Status pill */}
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Session
                </span>

                {!isInternal && (
                  <>
                    {(user as any).kycApproved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium border border-emerald-200 dark:border-emerald-800">
                        <BadgeCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        KYC Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full font-medium border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        KYC {(user as any).kycStatus || 'Pending'}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Identity & Account Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Account ID */}
            <div
              className="p-3 rounded-xl border border-[var(--border)] flex flex-col justify-between"
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                  Account ID
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p
                className="text-xs font-mono truncate"
                style={{ color: 'var(--text-primary)' }}
                title={user.id}
              >
                {user.id}
              </p>
            </div>

            {/* Email Address */}
            <div
              className="p-3 rounded-xl border border-[var(--border)] flex flex-col justify-between"
              style={{ background: 'var(--bg-card)' }}
            >
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[var(--action)]" />
                Email Address
              </span>
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {email}
              </p>
            </div>

            {/* Username or Company */}
            <div
              className="p-3 rounded-xl border border-[var(--border)] flex flex-col justify-between"
              style={{ background: 'var(--bg-card)' }}
            >
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] mb-1 flex items-center gap-1.5">
                {isInternal ? (
                  <>
                    <UserIcon className="w-3.5 h-3.5 text-[var(--action)]" />
                    Username
                  </>
                ) : (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-[var(--action)]" />
                    Company Name
                  </>
                )}
              </span>
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {isInternal ? (user as any).username : (user as any).companyName || 'N/A'}
              </p>
            </div>

            {/* Contact Person (if external) or Role Code (if internal) */}
            <div
              className="p-3 rounded-xl border border-[var(--border)] flex flex-col justify-between"
              style={{ background: 'var(--bg-card)' }}
            >
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[var(--action)]" />
                {isInternal ? 'Authorization Level' : 'Contact Person'}
              </span>
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {isInternal
                  ? (user as any).role?.toUpperCase() || 'INTERNAL'
                  : (user as any).fullName || 'Authorized Representative'}
              </p>
            </div>
          </div>

          {/* Security & Access Section */}
          <div
            className="p-4 rounded-xl border border-[var(--border)] space-y-3"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--action-tint)] flex items-center justify-center text-[var(--action)]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    Security & Credentials
                  </h4>
                  <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    Manage your sign-in authentication
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Encrypted
              </span>
            </div>

            <div
              className="p-3 rounded-lg border border-[var(--border)] flex items-center justify-between"
              style={{ background: 'var(--bg-canvas)' }}
            >
              <div className="space-y-0.5">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Password
                </span>
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  Last changed via encrypted credential storage
                </p>
              </div>

              <button
                type="button"
                onClick={handleChangePasswordClick}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all flex items-center gap-1.5 shadow-2xs hover:opacity-90 cursor-pointer"
                style={{ background: 'var(--action)' }}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
