import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { buyersApi, type BuyerInput } from './buyers.api'
import { useToast } from '../auth/ToastContext'
import { productsApi } from '../products/products.api'
import { CREDIT_RATINGS, COMMODITY_UNITS } from '../../lib/constants'
import type { Buyer, ProductCategory } from '../../lib/types'

interface BuyerFormProps {
  buyer?: Buyer // undefined = add mode, defined = edit mode
  onSuccess: (buyer: Buyer) => void
  onCancel: () => void
}

export function BuyerForm({ buyer, onSuccess, onCancel }: BuyerFormProps) {
  const toast = useToast()
  const isEdit = !!buyer

  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Form state ─────────────────────────────────────────────────────────────
  // Initialise from existing buyer data (edit mode) or empty strings (add mode).
  const [form, setForm] = useState<BuyerInput>({
    companyName: buyer?.companyName ?? '',
    contactPerson: buyer?.contactPerson ?? '',
    country: buyer?.country ?? '',
    email: buyer?.email ?? '',
    phone: buyer?.phone ?? '',
    whatsapp: buyer?.whatsapp ?? '',
    website: buyer?.website ?? '',
    businessRegistrationNo: buyer?.businessRegistrationNo ?? '',
    taxNumber: buyer?.taxNumber ?? '',
    annualPurchaseCapacity: buyer?.annualPurchaseCapacity ?? '',
    capacityUnit: buyer?.capacityUnit ?? 'MT',
    creditRating: buyer?.creditRating ?? 'Unrated',
    notes: buyer?.notes ?? '',
    interestIds: buyer?.interests?.map((i) => i.id) ?? []
  })

  // Load product categories for the interests toggle section
  useEffect(() => {
    productsApi
      .getCategories()
      .then((res) => {
        if (res.success) setCategories(res.data)
      })
      .catch(() => {}) // Silently fail — interests are optional
  }, [])

  // ── Field update helper ────────────────────────────────────────────────────
  // Updates one field in form state and clears its error if one existed.
  function setField<K extends keyof BuyerInput>(field: K, value: BuyerInput[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field])
      setErrors((prev) => {
        const e = { ...prev }
        delete e[field]
        return e
      })
  }

  // ── Interest toggle ────────────────────────────────────────────────────────
  // Adds or removes a category ID from the interestIds array.
  function toggleInterest(catId: string) {
    setForm((prev) => ({
      ...prev,
      interestIds: prev.interestIds.includes(catId)
        ? prev.interestIds.filter((id) => id !== catId)
        : [...prev.interestIds, catId]
    }))
  }

  // ── Client-side validation ─────────────────────────────────────────────────
  // Catches obvious errors before making a network call.
  // The server validates too — this is UX-only, not a security measure.
  function validateForm(): boolean {
    const e: Record<string, string> = {}
    if (!form.companyName?.trim()) e.companyName = 'Company name is required'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Invalid email address'
    }
    if (form.website && form.website.trim()) {
      try {
        new URL(form.website)
      } catch {
        e.website = 'Invalid website URL'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      const res = isEdit ? await buyersApi.update(buyer!.id, form) : await buyersApi.create(form)
      if (res.success) onSuccess(res.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  // ── Nested builder: reusable field renderer ────────────────────────────────
  // Defined inside the component so it has access to `form`, `errors`, `setField`.
  // Returns a complete field block (label + input + error message).
  // This is the nested-function approach: the helper is local to where it's used,
  // keeps field JSX DRY (one call per field instead of 20 lines each), and is not
  // exported because no other component needs it.
  function buildField(
    name: keyof BuyerInput,
    label: string,
    type: string = 'text',
    placeholder?: string
  ): ReactNode {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <input
          type={type}
          value={(form[name] as string) ?? ''}
          onChange={(e) => setField(name, e.target.value as any)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2
            focus:ring-brand-500 focus:border-transparent transition-shadow
            ${errors[name] ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
        />
        {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Company Information ──────────────────────────────────────────── */}
      <section>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Company Information
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {buildField('companyName', 'Company Name *')}
          {buildField('contactPerson', 'Contact Person')}
          {buildField('country', 'Country')}
          {buildField('email', 'Email', 'email')}
          {buildField('phone', 'Phone')}
          {buildField('whatsapp', 'WhatsApp')}
          {buildField('website', 'Website', 'url', 'https://example.com')}
        </div>
      </section>

      {/* ── Legal & Financial ────────────────────────────────────────────── */}
      <section>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Legal & Financial
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {buildField('businessRegistrationNo', 'Business Reg. Number')}
          {buildField('taxNumber', 'Tax Number')}

          {/* Credit Rating dropdown */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Credit Rating</label>
            <select
              value={form.creditRating ?? 'Unrated'}
              onChange={(e) => setField('creditRating', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {CREDIT_RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Annual Capacity: number + unit select */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Annual Purchase Capacity
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={form.annualPurchaseCapacity ?? ''}
                onChange={(e) => setField('annualPurchaseCapacity', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="0"
                min="0"
              />
              <select
                value={form.capacityUnit ?? 'MT'}
                onChange={(e) => setField('capacityUnit', e.target.value)}
                className="w-24 px-2 py-2 text-sm border border-slate-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {COMMODITY_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Interests ─────────────────────────────────────────────── */}
      <section>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Product Interests
        </h4>
        {/* Toggle buttons: filled = selected, outlined = unselected */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleInterest(cat.id)}
              className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
                form.interestIds.includes(cat.id)
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'bg-white border-slate-300 text-slate-600 hover:border-brand-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      <section>
        <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
        <textarea
          value={form.notes ?? ''}
          onChange={(e) => setField('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          placeholder="Any additional notes about this buyer…"
        />
      </section>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
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
          {saving ? 'Saving…' : isEdit ? 'Update Buyer' : 'Add Buyer'}
        </button>
      </div>
    </form>
  )
}
