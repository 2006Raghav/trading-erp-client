import { useState, useEffect, useCallback } from 'react'
import { DataTable } from '../../components/ui/DataTable'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { CreditBadge } from '../../components/ui/StatusBadge'
import { BuyerForm } from './buyersForm'
import { BuyerDetail } from './buyersDetail'
import { buyersApi, type BuyerFilters } from './buyers.api'
import { useToast } from '../auth/ToastContext'
import { CREDIT_RATINGS } from '../../lib/constants'
import type { Buyer, PaginationMeta } from '../../lib/types'
import { Plus, Search, Filter, Eye, Pencil, Trash2, RefreshCw } from 'lucide-react'

export function BuyersPage() {
  const toast = useToast()

  // ── Data state ───────────────────────────────────────────────────────────
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Filter + pagination state ─────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [creditFilter, setCreditFilter] = useState('')
  const [page, setPage] = useState(1)

  // ── Modal state (one target variable per modal) ───────────────────────────
  // null = modal closed, an object = modal open with that buyer
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Buyer | null>(null)
  const [viewTarget, setViewTarget] = useState<Buyer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Buyer | null>(null)

  // ── Fetch function ────────────────────────────────────────────────────────
  // Wrapped in useCallback so it can be safely listed as a dependency in useEffect.
  // All filter/page state is in the dependency array — it re-runs when any changes.
  const fetchBuyers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await buyersApi.getAll({ search, creditRating: creditFilter, page, pageSize: 25 })
      if (res.success) {
        setBuyers(res.data)
        setMeta(res.meta)
      }
    } catch (err) {
      toast.error('Failed to load buyers')
    } finally {
      setLoading(false)
    }
  }, [search, creditFilter, page])

  useEffect(() => {
    fetchBuyers()
  }, [fetchBuyers])

  // ── Search debounce ───────────────────────────────────────────────────────
  // When the search string changes, wait 400ms before triggering a fetch.
  // This prevents a network request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 400)
    return () => clearTimeout(timer) // Cancel if the user types again within 400ms
  }, [search])

  // ── Delete handler ────────────────────────────────────────────────────────
  async function handleDelete(buyer: Buyer) {
    try {
      const res = await buyersApi.remove(buyer.id)
      if (res.success) {
        toast.success(`"${buyer.companyName}" deactivated`)
        fetchBuyers()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate buyer')
    }
  }

  // ── Column definitions ────────────────────────────────────────────────────
  // Each column's `render` receives (cellValue, fullRow) — use fullRow when you
  // need multiple fields (e.g. formatting quantity + unit together).
  const columns = [
    {
      key: 'buyerCode',
      label: 'Code',
      width: 110,
      render: (val: string) => (
        <span className="font-mono text-body-s" style={{ color: 'var(--color-slate-500)' }}>
          {val}
        </span>
      )
    },
    { key: 'companyName', label: 'Company Name' },
    { key: 'contactPerson', label: 'Contact' },
    { key: 'country', label: 'Country', width: 130 },
    { key: 'email', label: 'Email', width: 200 },
    {
      key: 'creditRating',
      label: 'Credit',
      width: 90,
      render: (val: string) => <CreditBadge rating={val} />
    },
    {
      key: 'interests',
      label: 'Interested In',
      render: (val: Array<{ name: string }>) =>
        val?.length ? (
          <span className="text-xs text-slate-500">{val.map((v) => v.name).join(', ')}</span>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )
    },
    {
      key: '_actions',
      label: '',
      width: 110,
      render: (_: unknown, row: Buyer) => (
        // stopPropagation prevents onRowClick from firing when action buttons are clicked
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setViewTarget(row)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            title="View history"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setEditTarget(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Deactivate"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      {/* Toolbar: search + credit filter + refresh + add button */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-56">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, contact, or email…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={creditFilter}
            onChange={(e) => {
              setCreditFilter(e.target.value)
              setPage(1)
            }}
            className="pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg
                       appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">All Credit Ratings</option>
            {CREDIT_RATINGS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={fetchBuyers}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                     text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} /> Add Buyer
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <DataTable
          columns={columns}
          data={buyers}
          loading={loading}
          emptyMessage={
            search ? `No buyers found for "${search}"` : 'No buyers yet. Add your first buyer.'
          }
        />
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {/* Add Buyer */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Buyer" size="lg">
        <BuyerForm
          onSuccess={() => {
            setAddOpen(false)
            fetchBuyers()
            toast.success('Buyer added')
          }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      {/* Edit Buyer */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Buyer" size="lg">
        {editTarget && (
          <BuyerForm
            buyer={editTarget}
            onSuccess={() => {
              setEditTarget(null)
              fetchBuyers()
              toast.success('Buyer updated')
            }}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>

      {/* View / History */}
      <Modal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Buyer Details & History"
        size="lg"
      >
        {viewTarget && <BuyerDetail buyer={viewTarget} />}
      </Modal>

      {/* Deactivate confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Deactivate Buyer"
        message={`Deactivate "${deleteTarget?.companyName}"? Their data is kept but they will no longer appear in active lists.`}
        confirmLabel="Deactivate"
        danger
      />
    </div>
  )
}
