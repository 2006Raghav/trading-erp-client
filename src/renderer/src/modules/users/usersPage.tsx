import { useState, useEffect, useCallback } from 'react'
import { usersApi } from './users.api'
import { useToast } from '../auth/ToastContext'
import { DataTable } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { UserForm } from './userForm'
import { ROLE_LABELS } from '../../lib/constants'
import { formatDate } from '../../lib/utils'
import { useAuth } from '../auth/AuthContext'
import type { User } from '../../lib/types'
import { Plus, Search, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import { primaryBtnStyle } from '../cssUtils'

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const toast = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [toggleTarget, setToggleTarget] = useState<User | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await usersApi.getAll({ search })
      if (res.success) setUsers(res.data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [search])
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])
  useEffect(() => {
    const t = setTimeout(() => {}, 400)
    return () => clearTimeout(t)
  }, [search])

  async function handleToggle(u: User) {
    try {
      const res = await usersApi.toggleActive(u.id, !u.isActive)
      if (res.success) {
        toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}`)
        fetchUsers()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    }
  }

  const columns = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'username', label: 'Username', width: 150 },
    { key: 'email', label: 'Email', width: 220 },
    {
      key: 'role',
      label: 'Role',
      width: 150,
      render: (val: string) => (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                         bg-brand-100 text-brand-700 border border-brand-200"
        >
          {ROLE_LABELS[val as keyof typeof ROLE_LABELS] || val}
        </span>
      )
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      width: 160,
      render: (val: string) => (val ? formatDate(val) : 'Never')
    },
    {
      key: '_actions',
      label: '',
      width: 90,
      render: (_: unknown, row: User) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setEditTarget(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Pencil size={14} />
          </button>
          {row.id !== currentUser?.id && (
            <button
              onClick={() => setToggleTarget(row)}
              className={`p-1.5 rounded-lg transition-colors ${
                row.isActive
                  ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                  : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              {row.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                     text-white text-sm font-medium rounded-lg"
          style={primaryBtnStyle}
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No users found."
        />
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New User" size="md">
        {currentUser ? (
          <UserForm
            onSuccess={() => {
              setAddOpen(false)
              fetchUsers()
              toast.success('User created')
            }}
            onCancel={() => setAddOpen(false)}
            modifier={currentUser.id}
          />
        ) : (
          <div>Loading...</div>
        )}
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit User" size="md">
        {editTarget && (
          <UserForm
            user={editTarget}
            onSuccess={() => {
              setEditTarget(null)
              fetchUsers()
              toast.success('User updated')
            }}
            onCancel={() => setEditTarget(null)}
            modifier={currentUser?.id as string}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => toggleTarget && handleToggle(toggleTarget)}
        title={toggleTarget?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`${toggleTarget?.isActive ? 'Deactivate' : 'Activate'} "${toggleTarget?.fullName}"?`}
        confirmLabel={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        danger={!!toggleTarget?.isActive}
      />
    </div>
  )
}
