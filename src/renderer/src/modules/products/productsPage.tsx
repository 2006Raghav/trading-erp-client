// src/renderer/src/modules/products/ProductsPage.tsx
import { useState, useEffect, useCallback } from 'react'
import { DataTable } from '../../components/ui/DataTable'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ProductForm } from './productForm'
import { productsApi } from './products.api'
import { sellersApi } from '../sellers/sellers.api'
import { useToast } from '../auth/ToastContext'
import { formatCurrency, formatQuantity } from '../../lib/utils'
import type { Product, ProductCategory, Seller, PaginationMeta } from '../../lib/types'
import { Plus, Search, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { primaryBtnStyle } from '../cssUtils'

export function ProductsPage() {
  const toast = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [page, setPage] = useState(1)

  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  useEffect(() => {
    productsApi.getCategories().then((r) => {
      if (r.success) setCategories(r.data)
    })
    sellersApi.getAll({ pageSize: 200 }).then((r) => {
      if (r.success) setSellers(r.data)
    })
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productsApi.getAll({ search, categoryId: catFilter, page, pageSize: 25 })
      if (res.success) {
        setProducts(res.data)
        setMeta(res.meta)
      }
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [search, catFilter, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400)
    return () => clearTimeout(t)
  }, [search])

  async function handleDelete(product: Product) {
    try {
      const res = await productsApi.remove(product.id)
      if (res.success) {
        toast.success(`"${product.productName}" removed`)
        fetchProducts()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove product')
    }
  }

  const columns = [
    { key: 'categoryName', label: 'Category', width: 140 },
    { key: 'productName', label: 'Product Name' },
    { key: 'sellerName', label: 'Seller', width: 180 },
    { key: 'purity', label: 'Purity', numeric: true, width: 90 },
    { key: 'origin', label: 'Origin', width: 120 },
    {
      key: 'availableQuantity',
      label: 'Qty Available',
      numeric: true,
      width: 130,
      render: (val: number, row: Product) =>
        val ? (
          <span className="font-mono" style={{ color: 'var(--color-ink-900)' }}>
            {formatQuantity(val, row.quantityUnit)}
          </span>
        ) : (
          <span style={{ color: 'var(--color-slate-300)' }}>—</span>
        )
    },
    {
      key: 'pricePerUnit',
      label: 'Price / Unit',
      numeric: true,
      render: (val: number, row: Product) =>
        val ? (
          <span className="font-mono" style={{ color: 'var(--color-ink-900)' }}>
            {formatCurrency(val, row.currency)}
          </span>
        ) : (
          <span style={{ color: 'var(--color-slate-300)' }}>—</span>
        )
    },
    {
      key: '_actions',
      label: '',
      width: 90,
      render: (_: unknown, row: Product) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setEditTarget(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-56">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, origin, or seller…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => {
            setCatFilter(e.target.value)
            setPage(1)
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white
                     focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={fetchProducts}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                     text-white text-sm font-medium rounded-lg"
          style={primaryBtnStyle}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No products yet."
        />
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Product" size="lg">
        <ProductForm
          categories={categories}
          sellers={sellers}
          onSuccess={() => {
            setAddOpen(false)
            fetchProducts()
            toast.success('Product added')
          }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Product"
        size="lg"
      >
        {editTarget && (
          <ProductForm
            product={editTarget}
            categories={categories}
            sellers={sellers}
            onSuccess={() => {
              setEditTarget(null)
              fetchProducts()
              toast.success('Product updated')
            }}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Remove Product"
        message={`Remove "${deleteTarget?.productName}" from the product list?`}
        confirmLabel="Remove"
        danger
      />
    </div>
  )
}
