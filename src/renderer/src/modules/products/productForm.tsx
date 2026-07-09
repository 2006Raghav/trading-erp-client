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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--color-slate-500)',
    marginBottom: '6px'
  }

  const errorStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--color-danger)',
    marginTop: '4px'
  }

  const primaryBtnStyle: React.CSSProperties = {
    height: '40px',
    padding: '0 24px',
    borderRadius: '8px',
    background: 'var(--color-cobalt-600)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer'
  }

  const cancelBtnStyle: React.CSSProperties = {
    height: '40px',
    padding: '0 16px',
    borderRadius: '8px',
    background: 'var(--color-white)',
    color: 'var(--color-ink-900)',
    fontSize: '14px',
    fontWeight: 500,
    border: '1px solid var(--color-slate-200)',
    cursor: 'pointer'
  }

  function setField<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key])
      setErrors((prev) => {
        const e = { ...prev }
        delete e[key]
        return e
      })
  }

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Seller *</label>
          <select
            value={form.sellerId}
            onChange={(e) => setField('sellerId', e.target.value)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, !!errors.sellerId)}
            className="bg-white"
            style={fieldStyle(!!errors.sellerId)}
          >
            <option value="">Select seller…</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.companyName} ({s.sellerCode})
              </option>
            ))}
          </select>
          {errors.sellerId && <p style={errorStyle}>{errors.sellerId}</p>}
        </div>

        <div>
          <label style={labelStyle}>Category *</label>
          <select
            value={form.categoryId}
            onChange={(e) => setField('categoryId', e.target.value)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, !!errors.categoryId)}
            className="bg-white"
            style={fieldStyle(!!errors.categoryId)}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p style={errorStyle}>{errors.categoryId}</p>}
        </div>

        <div className="col-span-2">
          <label style={labelStyle}>Product Name *</label>
          <input
            value={form.productName}
            onChange={(e) => setField('productName', e.target.value)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, !!errors.productName)}
            className="w-full"
            placeholder="e.g. Copper Cathode Grade A — DRC Origin"
            style={fieldStyle(!!errors.productName)}
          />
          {errors.productName && <p style={errorStyle}>{errors.productName}</p>}
        </div>

        <div>
          <label style={labelStyle}>Purity</label>
          <input
            value={form.purity ?? ''}
            onChange={(e) => setField('purity', e.target.value)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, !!errors.purity)}
            className="w-full"
            placeholder="e.g. 99.99%"
            style={fieldStyle(!!errors.purity)}
          />
        </div>

        <div>
          <label style={labelStyle}>Grade</label>
          <input
            value={form.grade ?? ''}
            onChange={(e) => setField('grade', e.target.value)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, !!errors.grade)}
            className="w-full"
            placeholder="e.g. LME Grade A"
            style={fieldStyle(!!errors.grade)}
          />
        </div>

        <div>
          <label style={labelStyle}>Origin Country</label>
          <input
            value={form.origin ?? ''}
            onChange={(e) => setField('origin', e.target.value)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, !!errors.origin)}
            className="w-full"
            placeholder="e.g. Democratic Republic of Congo"
            style={fieldStyle(!!errors.origin)}
          />
        </div>

        <div>
          <label style={labelStyle}>Warehouse Location</label>
          <input
            value={form.warehouseLocation ?? ''}
            onChange={(e) => setField('warehouseLocation', e.target.value)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, !!errors.warehouseLocation)}
            className="w-full"
            placeholder="e.g. Durban Port, South Africa"
            style={fieldStyle(!!errors.warehouseLocation)}
          />
        </div>

        <div>
          <label style={labelStyle}>Available Quantity</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={form.availableQuantity ?? ''}
              onChange={(e) => setField('availableQuantity', e.target.value)}
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, !!errors.availableQuantity)}
              className="flex-4"
              placeholder="0"
              min="0"
              step="0.01"
              style={fieldStyle(!!errors.availableQuantity)}
            />
            <select
              value={form.quantityUnit ?? 'MT'}
              onChange={(e) => setField('quantityUnit', e.target.value)}
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, false)}
              className=" flex-1 bg-white"
              style={fieldStyle(false)}
            >
              {COMMODITY_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          {errors.availableQuantity && <p style={errorStyle}>{errors.availableQuantity}</p>}
        </div>

        <div>
          <label style={labelStyle}>Price Per Unit</label>
          <div className="flex gap-2">
            <select
              value={form.currency ?? 'USD'}
              onChange={(e) => setField('currency', e.target.value)}
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, false)}
              className="flex-1 bg-white"
              style={fieldStyle(false)}
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
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, !!errors.pricePerUnit)}
              className="flex-4"
              placeholder="0.00"
              min="0"
              step="0.0001"
              style={fieldStyle(!!errors.pricePerUnit)}
            />
          </div>
          {errors.pricePerUnit && <p style={errorStyle}>{errors.pricePerUnit}</p>}
        </div>
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
          {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  )
}
