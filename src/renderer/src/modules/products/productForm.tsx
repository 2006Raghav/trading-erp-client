// src/renderer/src/modules/products/ProductForm.tsx
import { useState } from 'react'
import { productsApi, type ProductInput } from './products.api'
import { useToast } from '../auth/ToastContext'
import { COMMODITY_UNITS, CURRENCIES } from '../../lib/constants'
import type { Product, ProductCategory, Seller } from '../../lib/types'

interface ProductFormProps {
  product?: Product
  categories: ProductCategory[]
  sellers: Seller[]
  onSuccess: (product: Product) => void
  onCancel: () => void
}

export function ProductForm({
  product,
  categories,
  sellers,
  onSuccess,
  onCancel
}: ProductFormProps) {
  const toast = useToast()
  const isEdit = !!product
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<ProductInput>({
    sellerId: product?.sellerId ?? '',
    categoryId: product?.categoryId ?? '',
    productName: product?.productName ?? '',
    purity: product?.purity ?? '',
    grade: product?.grade ?? '',
    origin: product?.origin ?? '',
    availableQuantity: product?.availableQuantity ?? '',
    quantityUnit: product?.quantityUnit ?? 'MT',
    pricePerUnit: product?.pricePerUnit ?? '',
    currency: product?.currency ?? 'USD',
    warehouseLocation: product?.warehouseLocation ?? ''
  })

  function setField<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key])
      setErrors((prev) => {
        const e = { ...prev }
        delete e[key]
        return e
      })
  }

  // ── Nested validation builder ─────────────────────────────────────────────
  // Returns a map of field → error message for all invalid fields.
  // Declared inside the component so it has access to `form` without being passed as arg.
  function validateForm(): Record<string, string> {
    const e: Record<string, string> = {}
    if (!form.sellerId) e.sellerId = 'Seller is required'
    if (!form.categoryId) e.categoryId = 'Category is required'
    if (!form.productName?.trim()) e.productName = 'Product name is required'
    if (form.availableQuantity && isNaN(Number(form.availableQuantity))) {
      e.availableQuantity = 'Must be a number'
    }
    if (form.pricePerUnit && isNaN(Number(form.pricePerUnit))) {
      e.pricePerUnit = 'Must be a number'
    }
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fieldErrors = validateForm()
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    try {
      const res = isEdit
        ? await productsApi.update(product!.id, form)
        : await productsApi.create(form)
      if (res.success) onSuccess(res.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  // ── Nested helper: input class builder ────────────────────────────────────
  // Returns the Tailwind class string for a given field, adding red styling when
  // that field has an error. Declared locally — not useful outside this component.
  function inputCls(field: string): string {
    return `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none
            focus:ring-2 focus:ring-brand-500 focus:border-transparent
            ${errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-300'}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {/* Seller dropdown */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Seller *</label>
          <select
            value={form.sellerId}
            onChange={(e) => setField('sellerId', e.target.value)}
            className={`${inputCls('sellerId')} bg-white`}
          >
            <option value="">Select seller…</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.companyName} ({s.sellerCode})
              </option>
            ))}
          </select>
          {errors.sellerId && <p className="text-red-500 text-xs mt-1">{errors.sellerId}</p>}
        </div>

        {/* Category dropdown */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
          <select
            value={form.categoryId}
            onChange={(e) => setField('categoryId', e.target.value)}
            className={`${inputCls('categoryId')} bg-white`}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
        </div>

        {/* Product Name — full width */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Product Name *</label>
          <input
            value={form.productName}
            onChange={(e) => setField('productName', e.target.value)}
            className={inputCls('productName')}
            placeholder="e.g. Copper Cathode Grade A — DRC Origin"
          />
          {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
        </div>

        {/* Purity */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Purity</label>
          <input
            value={form.purity ?? ''}
            onChange={(e) => setField('purity', e.target.value)}
            className={inputCls('purity')}
            placeholder="e.g. 99.99%"
          />
        </div>

        {/* Grade */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Grade</label>
          <input
            value={form.grade ?? ''}
            onChange={(e) => setField('grade', e.target.value)}
            className={inputCls('grade')}
            placeholder="e.g. LME Grade A"
          />
        </div>

        {/* Origin */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Origin Country</label>
          <input
            value={form.origin ?? ''}
            onChange={(e) => setField('origin', e.target.value)}
            className={inputCls('origin')}
            placeholder="e.g. Democratic Republic of Congo"
          />
        </div>

        {/* Warehouse */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Warehouse Location
          </label>
          <input
            value={form.warehouseLocation ?? ''}
            onChange={(e) => setField('warehouseLocation', e.target.value)}
            className={inputCls('warehouseLocation')}
            placeholder="e.g. Durban Port, South Africa"
          />
        </div>

        {/* Quantity + Unit */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Available Quantity
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={form.availableQuantity ?? ''}
              onChange={(e) => setField('availableQuantity', e.target.value)}
              className={`flex-1 ${inputCls('availableQuantity')}`}
              placeholder="0"
              min="0"
              step="0.01"
            />
            <select
              value={form.quantityUnit ?? 'MT'}
              onChange={(e) => setField('quantityUnit', e.target.value)}
              className="w-20 px-2 py-2 text-sm border border-slate-300 rounded-lg bg-white
                         focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {COMMODITY_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          {errors.availableQuantity && (
            <p className="text-red-500 text-xs mt-1">{errors.availableQuantity}</p>
          )}
        </div>

        {/* Currency + Price */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Price Per Unit</label>
          <div className="flex gap-2">
            <select
              value={form.currency ?? 'USD'}
              onChange={(e) => setField('currency', e.target.value)}
              className="w-24 px-2 py-2 text-sm border border-slate-300 rounded-lg bg-white
                         focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={form.pricePerUnit ?? ''}
              onChange={(e) => setField('pricePerUnit', e.target.value)}
              className={`flex-1 ${inputCls('pricePerUnit')}`}
              placeholder="0.00"
              min="0"
              step="0.0001"
            />
          </div>
          {errors.pricePerUnit && (
            <p className="text-red-500 text-xs mt-1">{errors.pricePerUnit}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg
                     text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-50
                     text-white font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  )
}
