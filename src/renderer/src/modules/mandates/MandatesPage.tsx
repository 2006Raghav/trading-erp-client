// src/renderer/src/modules/mandates/MandatesPage.tsx

import { useState, useEffect, useCallback } from 'react'
import { DataTable } from '../../components/ui/DataTable'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { MandateForm } from './MandateForm'
import { MandateDetail } from './MandateDetail'
import { mandatesApi } from './mandates.api'
import { useToast } from '../auth/ToastContext'
import type { Mandate, MandateRepresents, KycStatus } from './mandates.api'
import type { PaginationMeta } from '../../lib/types'
import { Plus, Search, Filter, Eye, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { primaryBtnStyle } from '../cssUtils'

// ─────────────────────────────────────────────────────────────────────────────
// Small presentation helpers
// ─────────────────────────────────────────────────────────────────────────────

function RepresentsBadge({ represents }: { represents: MandateRepresents }) {
  if (represents === 'buyer_side') {
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
        style={{
          background: 'var(--color-cobalt-50)',
          color: 'var(--color-cobalt-700)'
        }}
      >
        Buyer Side
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
      style={{
        background: 'var(--color-warning-bg)',
        color: 'var(--color-warning)'
      }}
    >
      Seller Side
    </span>
  )
}

function KycStatusBadge({ status }: { status: KycStatus }) {
  const styles: Record<
    KycStatus,
    {
      background: string
      color: string
      label: string
    }
  > = {
    pending: {
      background: 'var(--color-warning-bg)',
      color: 'var(--color-warning)',
      label: 'Pending'
    },
    under_review: {
      background: 'var(--color-cobalt-50)',
      color: 'var(--color-cobalt-700)',
      label: 'Under Review'
    },
    approved: {
      background: 'var(--color-success-bg)',
      color: 'var(--color-success)',
      label: 'Approved'
    },
    rejected: {
      background: 'var(--color-danger-bg)',
      color: 'var(--color-danger)',
      label: 'Rejected'
    }
  }

  const config = styles[status] ?? {
    background: 'var(--color-slate-100)',
    color: 'var(--color-slate-600)',
    label: status
  }

  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
      style={{
        background: config.background,
        color: config.color
      }}
    >
      {config.label}
    </span>
  )
}

function ExchangeAccessBadge({ hasAccess, onClick }: { hasAccess: boolean; onClick: () => void }) {
  if (hasAccess) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors"
        style={{
          background: 'var(--color-success-bg)',
          color: 'var(--color-success)'
        }}
        title="View mandate details"
      >
        Yes
      </button>
    )
  }

  // IMPORTANT:
  // "No" does NOT grant/revoke access directly.
  // It only opens the mandate detail where an administrator
  // can explicitly set a password.
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors hover:opacity-80"
      style={{
        background: 'var(--color-slate-100)',
        color: 'var(--color-slate-600)'
      }}
      title="Open mandate details to manage Exchange access"
    >
      No
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function MandatesPage() {
  const toast = useToast()

  // ── Data state ────────────────────────────────────────────────────────────

  const [mandates, setMandates] = useState<Mandate[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Filter + pagination state ─────────────────────────────────────────────

  const [search, setSearch] = useState('')
  const [representsFilter, setRepresentsFilter] = useState<MandateRepresents | ''>('')
  const [kycStatusFilter, setKycStatusFilter] = useState<KycStatus | ''>('')
  const [page, setPage] = useState(1)

  // ── Modal state ───────────────────────────────────────────────────────────

  const [addOpen, setAddOpen] = useState(false)

  const [editTarget, setEditTarget] = useState<Mandate | null>(null)

  const [viewTarget, setViewTarget] = useState<Mandate | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Mandate | null>(null)

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch
  // ─────────────────────────────────────────────────────────────────────────

  const fetchMandates = useCallback(async () => {
    setLoading(true)

    try {
      const res = await mandatesApi.getAll({
        search: search || undefined,
        represents: representsFilter || undefined,
        kycStatus: kycStatusFilter || undefined,
        page,
        pageSize: 25
      })

      if (res.success) {
        setMandates(res.data)
        setMeta(res.meta)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load mandates')
    } finally {
      setLoading(false)
    }
  }, [search, representsFilter, kycStatusFilter, page])

  useEffect(() => {
    fetchMandates()
  }, [fetchMandates])

  // ─────────────────────────────────────────────────────────────────────────
  // Search debounce
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  // ─────────────────────────────────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────────────────────────────────

  async function handleDelete(mandate: Mandate) {
    try {
      const res = await mandatesApi.remove(mandate.id)

      if (res.success) {
        toast.success(`"${mandate.companyName}" deactivated`)
        setDeleteTarget(null)
        fetchMandates()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate mandate')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Column definitions
  // ─────────────────────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'mandateCode',
      label: 'Code',
      width: 110,
      render: (val: string) => (
        <span className="font-mono text-body-s" style={{ color: 'var(--color-slate-500)' }}>
          {val}
        </span>
      )
    },

    {
      key: 'companyName',
      label: 'Company'
    },

    {
      key: 'contactPerson',
      label: 'Contact'
    },

    {
      key: 'country',
      label: 'Country',
      width: 140
    },

    {
      key: 'represents',
      label: 'Represents',
      width: 130,
      render: (val: MandateRepresents) => <RepresentsBadge represents={val} />
    },

    {
      key: 'hasExchangeAccess',
      label: 'Exchange',
      width: 100,
      render: (val: boolean, row: Mandate) => (
        <ExchangeAccessBadge hasAccess={val} onClick={() => setViewTarget(row)} />
      )
    },

    {
      key: 'kycStatus',
      label: 'KYC',
      width: 120,
      render: (val: KycStatus) => <KycStatusBadge status={val} />
    },

    {
      key: '_actions',
      label: '',
      width: 110,
      render: (_: unknown, row: Mandate) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {/* View */}
          <button
            type="button"
            onClick={() => setViewTarget(row)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            title="View mandate"
          >
            <Eye size={14} />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => setEditTarget(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit mandate"
          >
            <Pencil size={14} />
          </button>

          {/* Soft delete */}
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Deactivate mandate"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ]

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* ── Page header ──────────────────────────────────────────────────── */}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-ink-900)' }}>
            Mandates
          </h1>

          <p className="text-sm mt-1" style={{ color: 'var(--color-slate-500)' }}>
            Manage mandate and broker profiles, Exchange access and KYC status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          style={primaryBtnStyle}
        >
          <Plus size={16} />
          Add Mandate
        </button>
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}

      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}

        <div className="relative flex-1 min-w-56">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, code, contact, or email…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Represents */}

        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

          <select
            value={representsFilter}
            onChange={(e) => {
              setRepresentsFilter(e.target.value as MandateRepresents | '')
              setPage(1)
            }}
            className="pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg
                       appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">All Representing</option>

            <option value="buyer_side">Buyer Side</option>

            <option value="seller_side">Seller Side</option>
          </select>
        </div>

        {/* KYC status */}

        <div className="relative">
          <select
            value={kycStatusFilter}
            onChange={(e) => {
              setKycStatusFilter(e.target.value as KycStatus | '')
              setPage(1)
            }}
            className="pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg
                       appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">All KYC Statuses</option>

            <option value="pending">Pending</option>

            <option value="under_review">Under Review</option>

            <option value="approved">Approved</option>

            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Refresh */}

        <button
          type="button"
          onClick={fetchMandates}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <DataTable
          columns={columns}
          data={mandates}
          loading={loading}
          emptyMessage={
            search
              ? `No mandates found for "${search}"`
              : 'No mandates yet. Add your first mandate.'
          }
        />

        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          Add Mandate
      ─────────────────────────────────────────────────────────────────── */}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Mandate" size="lg">
        <MandateForm
          onSuccess={() => {
            setAddOpen(false)
            fetchMandates()
            toast.success('Mandate added')
          }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      {/* ───────────────────────────────────────────────────────────────────
          Edit Mandate
      ─────────────────────────────────────────────────────────────────── */}

      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Mandate"
        size="lg"
      >
        {editTarget && (
          <MandateForm
            mandate={editTarget}
            onSuccess={() => {
              setEditTarget(null)
              fetchMandates()
              toast.success('Mandate updated')
            }}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>

      {/* ───────────────────────────────────────────────────────────────────
          Mandate Detail
      ─────────────────────────────────────────────────────────────────── */}

      <Modal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Mandate Details"
        size="xl"
      >
        {viewTarget && (
          <MandateDetail
            mandate={viewTarget}
            onEdit={() => {
              setViewTarget(null)
              setEditTarget(viewTarget)
            }}
            onRefresh={fetchMandates}
          />
        )}
      </Modal>

      {/* ───────────────────────────────────────────────────────────────────
          Deactivate
      ─────────────────────────────────────────────────────────────────── */}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget)
          }
        }}
        title="Deactivate Mandate"
        message={`Deactivate "${deleteTarget?.companyName}"? Their data will be kept, but they will no longer appear in active mandate lists.`}
        confirmLabel="Deactivate"
        danger
      />
    </div>
  )
}
