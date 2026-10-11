// src/renderer/src/modules/auth/ChangePasswordModal.tsx
// Modal dialog allowing users (Internal, Buyer, Seller, Mandate) to change their password securely.

import React, { useState } from 'react'
import {
  KeyRound,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  X
} from 'lucide-react'
import { authApi } from './auth.api'
import { useToast } from './ToastContext'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const toast = useToast()

  if (!isOpen) return null

  // Password validation rules
  const hasMinLength = newPassword.length >= 8
  const hasNumberOrSymbol = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword

  // Strength score
  let strengthScore = 0
  if (hasMinLength) strengthScore += 1
  if (hasNumberOrSymbol) strengthScore += 1
  if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) strengthScore += 1
  if (newPassword.length >= 12) strengthScore += 1

  const getStrengthLabel = () => {
    if (!newPassword) return ''
    if (strengthScore <= 1) return 'Weak'
    if (strengthScore <= 3) return 'Medium'
    return 'Strong'
  }

  const getStrengthColor = () => {
    if (strengthScore <= 1) return 'bg-rose-500'
    if (strengthScore <= 3) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const canSubmit =
    currentPassword.trim().length > 0 &&
    hasMinLength &&
    hasNumberOrSymbol &&
    passwordsMatch &&
    !loading

  const handleReset = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(false)
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    if (newPassword === currentPassword) {
      setError('New password must be different from current password')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await authApi.changePassword(currentPassword, newPassword)
      if (res.success) {
        setSuccess(true)
        toast.success('Password changed successfully!')
        setTimeout(() => {
          handleClose()
        }, 1800)
      } else {
        setError('Failed to update password. Please verify your current password.')
      }
    } catch (err: any) {
      setError(err.message || 'Current password is incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div
        className="relative flex flex-col w-full max-w-md rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{ background: 'var(--bg-elevated)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]"
          style={{ background: 'var(--bg-canvas)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--action-tint)] flex items-center justify-center text-[var(--action)]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Change Password
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Update your account password
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-in zoom-in">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Password Updated!
              </h4>
              <p className="text-xs max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Your account password has been successfully updated. Use your new password on your next login.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value)
                      setError(null)
                    }}
                    placeholder="Enter current password"
                    required
                    className="w-full h-9 px-3 pr-9 text-xs rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--action)] transition-colors"
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="block text-xs font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    New Password
                  </label>
                  {newPassword && (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        strengthScore <= 1
                          ? 'text-rose-600'
                          : strengthScore <= 3
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                      }`}
                    >
                      {getStrengthLabel()}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      setError(null)
                    }}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full h-9 px-3 pr-9 text-xs rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--action)] transition-colors"
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter Bar */}
                {newPassword && (
                  <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${Math.min(100, (strengthScore / 4) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError(null)
                    }}
                    placeholder="Re-enter new password"
                    required
                    className="w-full h-9 px-3 pr-9 text-xs rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--action)] transition-colors"
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Validation Checklist */}
              <div
                className="p-3 rounded-lg border border-[var(--border)] space-y-1.5 text-[11px]"
                style={{ background: 'var(--bg-canvas)' }}
              >
                <div
                  className={`flex items-center gap-1.5 ${
                    hasMinLength
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'opacity-100' : 'opacity-40'}`} />
                  <span>At least 8 characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasNumberOrSymbol
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Check
                    className={`w-3.5 h-3.5 ${hasNumberOrSymbol ? 'opacity-100' : 'opacity-40'}`}
                  />
                  <span>Contains a number or symbol</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordsMatch
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Check
                    className={`w-3.5 h-3.5 ${passwordsMatch ? 'opacity-100' : 'opacity-40'}`}
                  />
                  <span>Passwords match</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--action)',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
