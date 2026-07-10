// src/renderer/src/modules/sellers/SellersPage.tsx
import { useState, useEffect, useCallback } from 'react'
import { DataTable } from '../../components/ui/DataTable'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { SellerForm } from './sellersForm'
import { SellerDetail } from './SellerDetail'
import { sellersApi } from './sellers.api'
import { useToast } from '../auth/ToastContext'
import { formatQuantity } from '../../lib/utils'
import type { Seller, PaginationMeta } from '../../lib/types'
import { Plus, Search, Eye, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { primaryBtnStyle } from '../cssUtils'

export function SellersPage() {
  const toast = useToast()

  const [sellers, setSellers] = useState<Seller[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Seller | null>(null)
  const [viewTarget, setViewTarget] = useState<Seller | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Seller | null>(null)
  // Server returns a specific error message when a seller has active products
  const [deleteError, setDeleteError] = useState('')

  const fetchSellers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await sellersApi.getAll({ search, page, pageSize: 25 })
      if (res.success) {
        setSellers(res.data)
        setMeta(res.meta)
      }
    } catch {
      toast.error('Failed to load sellers')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchSellers()
  }, [fetchSellers])
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400)
    return () => clearTimeout(t)
  }, [search])

  async function handleDelete(seller: Seller) {
    try {
      const res = await sellersApi.remove(seller.id)
      if (res.success) {
        toast.success(`"${seller.companyName}" deactivated`)
        fetchSellers()
      }
    } catch (err) {
      // Show the server's error in the confirm dialog (e.g. "has active products")
      setDeleteError(err instanceof Error ? err.message : 'Failed to deactivate')
    }
  }

  const columns = [
    {
      key: 'sellerCode',
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
      key: 'monthlyProductionCapacity',
      label: 'Monthly Capacity',
      width: 150,
      numeric: true,
      render: (val: number, row: Seller) =>
        val ? (
          <span className="font-mono" style={{ color: 'var(--color-ink-900)' }}>
            {formatQuantity(val, row.capacityUnit)}
          </span>
        ) : (
          <span style={{ color: 'var(--color-slate-300)' }}>—</span>
        )
    },
    {
      key: '_actions',
      label: '',
      width: 110,
      render: (_: unknown, row: Seller) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setViewTarget(row)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            title="View"
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
            onClick={() => {
              setDeleteTarget(row)
              setDeleteError('')
            }}
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
      <div className="flex items-center gap-3">
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
        <button
          onClick={fetchSellers}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                     text-white text-sm font-medium rounded-lg transition-colors"
          style={primaryBtnStyle}
        >
          <Plus size={16} /> Add Seller
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <DataTable
          columns={columns}
          data={sellers}
          loading={loading}
          emptyMessage="No sellers yet. Add your first seller."
        />
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Seller" size="lg">
        <SellerForm
          onSuccess={() => {
            setAddOpen(false)
            fetchSellers()
            toast.success('Seller added')
          }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Seller"
        size="lg"
      >
        {editTarget && (
          <SellerForm
            seller={editTarget}
            onSuccess={() => {
              setEditTarget(null)
              fetchSellers()
              toast.success('Seller updated')
            }}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>
      <Modal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Seller Details & History"
        size="lg"
      >
        {viewTarget && <SellerDetail seller={viewTarget} />}
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Deactivate Seller"
        message={
          deleteError ||
          `Deactivate "${deleteTarget?.companyName}"? Products linked to this seller will also be checked.`
        }
        confirmLabel="Deactivate"
        danger
      />
    </div>
  )
}
