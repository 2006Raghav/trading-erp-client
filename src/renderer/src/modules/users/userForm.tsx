import { useState } from 'react'
import { usersApi, type UserInput } from './users.api'
import { useToast } from '../auth/ToastContext'
import { USER_ROLES, ROLE_LABELS } from '../../lib/constants'
import type { User } from '../../lib/types'

interface Props {
  user?: User
  onSuccess: (user: User) => void
  onCancel: () => void
}

export function UserForm({ user, onSuccess, onCancel }: Props) {
  const toast = useToast()
  const isEdit = !!user

  const [saving, setSaving] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<UserInput>({
    fullName: user?.fullName ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'sales',
    password: '',
    newPassword: ''
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
    if (!isEdit && !form.password?.trim()) e.password = 'Password is required'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
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

  const cls = (field: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500
     ${errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-300'}`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
        <input
          value={form.fullName}
          onChange={(e) => setField('fullName', e.target.value)}
          className={cls('fullName')}
          placeholder="e.g. Rajesh Kumar"
        />
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Username *</label>
          <input
            value={form.username}
            onChange={(e) => setField('username', e.target.value)}
            className={cls('username')}
            autoComplete="off"
          />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => setField('email', e.target.value)}
            className={cls('email')}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Role *</label>
        <select
          value={form.role}
          onChange={(e) => setField('role', e.target.value)}
          className={`${cls('role')} bg-white`}
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}
        </label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={isEdit ? (form.newPassword ?? '') : (form.password ?? '')}
            onChange={(e) => setField(isEdit ? 'newPassword' : 'password', e.target.value)}
            className={cls(isEdit ? 'newPassword' : 'password')}
            placeholder={isEdit ? 'Enter new password to change…' : 'Min 8 characters'}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            {showPw ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-50
                     text-white font-medium rounded-lg"
        >
          {saving ? 'Saving…' : isEdit ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  )
}
