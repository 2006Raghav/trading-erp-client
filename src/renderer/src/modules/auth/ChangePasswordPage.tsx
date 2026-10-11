// src/renderer/src/modules/auth/ChangePasswordPage.tsx
// Dedicated page for changing password at /change-password route.

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  KeyRound,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react'
import { authApi } from './auth.api'
import { useToast } from './ToastContext'
import { Button } from '../../components/ui/button'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
    <div className="max-w-2xl mx-auto py-8 px-4 font-sans space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--action)] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      <div
        className="rounded-2xl border border-[var(--border)] overflow-hidden shadow-xs"
        style={{ background: 'var(--bg-card)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between"
          style={{ background: 'var(--bg-canvas)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--action-tint)] flex items-center justify-center text-[var(--action)]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Change Password
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Keep your account secure with a strong password
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-in zoom-in">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Password Successfully Updated
              </h2>
              <p className="text-xs max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                Your password has been changed. Please use your new password next time you sign in to
                the platform.
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="mt-2 text-xs h-9 px-5 text-white"
                style={{ background: 'var(--action)' }}
              >
                Return to Dashboard
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
              {error && (
                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
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
                    className="w-full h-10 px-3 pr-10 text-xs rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--action)] transition-colors"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                    className="w-full h-10 px-3 pr-10 text-xs rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--action)] transition-colors"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter Bar */}
                {newPassword && (
                  <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden mt-2">
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
                    className="w-full h-10 px-3 pr-10 text-xs rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--action)] transition-colors"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Validation Checklist */}
              <div
                className="p-3.5 rounded-xl border border-[var(--border)] space-y-2 text-xs"
                style={{ background: 'var(--bg-canvas)' }}
              >
                <div
                  className={`flex items-center gap-2 ${
                    hasMinLength
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Check className={`w-4 h-4 ${hasMinLength ? 'opacity-100' : 'opacity-40'}`} />
                  <span>At least 8 characters</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    hasNumberOrSymbol
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Check
                    className={`w-4 h-4 ${hasNumberOrSymbol ? 'opacity-100' : 'opacity-40'}`}
                  />
                  <span>Contains a number or symbol</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    passwordsMatch
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Check
                    className={`w-4 h-4 ${passwordsMatch ? 'opacity-100' : 'opacity-40'}`}
                  />
                  <span>Passwords match</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="h-10 px-5 text-xs font-semibold text-white rounded-xl gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--action)' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  className="h-10 px-4 text-xs font-semibold rounded-xl border-[var(--border)]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
