// src/renderer/src/modules/auth/ProfilePage.tsx
// User profile view showing current account info, roles, KYC status, and security actions.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Building,
  KeyRound,
  ArrowLeft,
  BadgeCheck,
  Clock
} from 'lucide-react'
import { useAuth } from './AuthContext'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { ChangePasswordModal } from './ChangePasswordModal'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  if (!user) return null

  const isInternal = user.userType === 'internal'
  const displayName = isInternal
    ? (user as any).fullName || (user as any).username
    : (user as any).companyName || (user as any).fullName || 'User'

  const userRoleOrType = isInternal
    ? `Internal Staff (${(user as any).role?.toUpperCase()})`
    : user.userType?.toUpperCase()

  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--action)] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      {/* Profile Overview Card */}
      <div
        className="rounded-2xl border border-[var(--border)] overflow-hidden shadow-xs"
        style={{ background: 'var(--bg-card)' }}
      >
        {/* Banner Header */}
        <div
          className="px-6 py-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ background: 'var(--bg-canvas)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--action)] text-white flex items-center justify-center text-xl font-bold shadow-md">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {displayName}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] uppercase font-bold"
                >
                  {user.userType}
                </Badge>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {userRoleOrType}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsChangePasswordOpen(true)}
            size="sm"
            className="text-xs h-9 px-4 gap-2 text-white shadow-xs self-start sm:self-auto"
            style={{ background: 'var(--action)' }}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </Button>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Email */}
          <div className="p-3.5 rounded-xl border border-[var(--border)] flex items-start gap-3 bg-[var(--bg-elevated)]">
            <div className="p-2 rounded-lg bg-[var(--bg-canvas)] text-[var(--action)]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Email Address</span>
              <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {user.email || 'No email registered'}
              </p>
            </div>
          </div>

          {/* Account ID / Username */}
          <div className="p-3.5 rounded-xl border border-[var(--border)] flex items-start gap-3 bg-[var(--bg-elevated)]">
            <div className="p-2 rounded-lg bg-[var(--bg-canvas)] text-[var(--action)]">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                {isInternal ? 'Username' : 'Account Identifier'}
              </span>
              <p className="text-xs font-semibold mt-0.5 font-mono" style={{ color: 'var(--text-primary)' }}>
                {(user as any).username || user.id.slice(0, 13)}
              </p>
            </div>
          </div>

          {/* Company Name (for exchange users) */}
          {!isInternal && (
            <div className="p-3.5 rounded-xl border border-[var(--border)] flex items-start gap-3 bg-[var(--bg-elevated)]">
              <div className="p-2 rounded-lg bg-[var(--bg-canvas)] text-[var(--action)]">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Company Name</span>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {(user as any).companyName || 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* KYC Status (for exchange users) */}
          {!isInternal && (
            <div className="p-3.5 rounded-xl border border-[var(--border)] flex items-start gap-3 bg-[var(--bg-elevated)]">
              <div className="p-2 rounded-lg bg-[var(--bg-canvas)] text-[var(--action)]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">KYC Verification</span>
                <div className="mt-1">
                  {(user as any).kycApproved ? (
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[11px] font-semibold gap-1">
                      <Clock className="w-3 h-3" />
                      {(user as any).kycStatus || 'Pending'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Status */}
          <div className="p-3.5 rounded-xl border border-[var(--border)] flex items-start gap-3 bg-[var(--bg-elevated)]">
            <div className="p-2 rounded-lg bg-[var(--bg-canvas)] text-[var(--action)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Security</span>
              <p className="text-xs font-semibold mt-0.5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>Password Protected</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  )
}
