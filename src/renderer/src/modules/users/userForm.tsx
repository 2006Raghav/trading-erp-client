import { useState } from 'react'
import { usersApi, type UserInput } from './users.api'
import { useToast } from '../auth/ToastContext'
import { USER_ROLES, ROLE_LABELS } from '../../lib/constants'
import type { User } from '../../lib/types'
import { primaryBtnStyle, labelStyle, cancelBtnStyle, errorStyle } from '../cssUtils'

interface Props {
  user?: User
  onSuccess: (user: User) => void
  onCancel: () => void
  modifier: string
}

export function UserForm({ user, onSuccess, onCancel, modifier }: Props) {
  const toast = useToast()
  const isEdit = !!user

  const [saving, setSaving] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<UserInput>({
    fullName: user?.fullName ?? '',
    username: (user as any)?.username ?? '',
    email: user?.email ?? '',
    role: (user as any)?.role ?? 'sales',
    password: '',
    newPassword: '',
    createdBy: modifier
  })
  function setField<K extends keyof UserInput>(key: K, value: UserInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key])
      setErrors((prev) => {
        const e = { ...prev }
        delete e[key]
        return e
      })
  }
  function validate(): boolean {
    const e: Record<string, string> = {}

    if (!form.fullName?.trim()) e.fullName = 'Full name is required'
    if (!form.username?.trim()) e.username = 'Username is required'
    if (!form.role) e.role = 'Role is required'

    if (!form.email?.trim()) {
      e.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Invalid email'
    }

    if (!isEdit) {
      if (!form.password?.trim()) {
        e.password = 'Password is required'
      } else if (form.password.length < 8) {
        e.password = 'Password must be at least 8 characters'
      }
    } else if (isEdit && form.newPassword && form.newPassword.length > 0) {
      if (form.newPassword.length < 8) {
        e.newPassword = 'Password must be at least 8 characters'
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const res = isEdit ? await usersApi.update(user!.id, form) : await usersApi.create(form)
      if (res.success) onSuccess(res.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  function fieldStyle(hasError: boolean): React.CSSProperties {
    return {
      width: '100%',
      padding: '9px 12px',
      height: '40px',
      fontSize: '14px',
      lineHeight: '20px',
      border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-slate-200)'}`,
      borderRadius: '8px',
      background: hasError ? 'var(--color-danger-bg)' : 'var(--color-white)',
      color: 'var(--color-ink-900)',
      outline: 'none',
      fontFamily: 'var(--font-ui)'
    }
  }

  function onFocus(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    e.target.style.borderColor = 'var(--color-cobalt-600)'
    e.target.style.boxShadow = '0 0 0 2px var(--color-cobalt-100)'
  }

  function onBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    hasError: boolean
  ) {
    e.target.style.borderColor = hasError ? 'var(--color-danger)' : 'var(--color-slate-200)'
    e.target.style.boxShadow = ''
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label style={labelStyle}>Full Name *</label>
        <input
          value={form.fullName}
          onChange={(e) => setField('fullName', e.target.value)}
          onFocus={onFocus}
          onBlur={(e) => onBlur(e, !!errors.fullName)}
          className="w-full"
          placeholder="e.g. Rajesh Kumar"
          style={fieldStyle(!!errors.fullName)}
        />
        {errors.fullName && <p style={errorStyle}>{errors.fullName}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Username *</label>
          <input
            value={form.username}
            onChange={(e) => setField('username', e.target.value)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, !!errors.username)}
            className="w-full"
            autoComplete="off"
            style={fieldStyle(!!errors.username)}
          />
          {errors.username && <p style={errorStyle}>{errors.username}</p>}
        </div>
        <div>
          <label style={labelStyle}>Email *</label>{' '}
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => setField('email', e.target.value)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, !!errors.email)}
            className="w-full"
            style={fieldStyle(!!errors.email)}
          />
          {errors.email && <p style={errorStyle}>{errors.email}</p>}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Role *</label>
        <select
          value={form.role}
          onChange={(e) => setField('role', e.target.value)}
          onFocus={onFocus}
          onBlur={(e) => onBlur(e, !!errors.role)}
          className="w-full bg-white"
          style={fieldStyle(!!errors.role)}
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>
          {isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}
        </label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={isEdit ? (form.newPassword ?? '') : (form.password ?? '')}
            onChange={(e) => setField(isEdit ? 'newPassword' : 'password', e.target.value)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, !!errors[isEdit ? 'newPassword' : 'password'])}
            className="w-full"
            placeholder={isEdit ? 'Enter new password to change…' : 'Min 8 characters'}
            autoComplete="new-password"
            style={fieldStyle(!!errors[isEdit ? 'newPassword' : 'password'])}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            {showPw ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <p style={errorStyle}>{errors.password}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="transition-colors"
          style={cancelBtnStyle}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="disabled:opacity-50 transition-colors"
          style={primaryBtnStyle}
        >
          {saving ? 'Saving…' : isEdit ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  )
}
