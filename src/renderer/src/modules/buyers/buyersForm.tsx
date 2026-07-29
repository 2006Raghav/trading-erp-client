import { useState, useEffect, type ReactNode } from 'react'
import { buyersApi, type BuyerInput } from './buyers.api'
import { useToast } from '../auth/ToastContext'
import { productsApi } from '../products/products.api'
import { CREDIT_RATINGS, COMMODITY_UNITS } from '../../lib/constants'
import type { Buyer, ProductCategory } from '../../lib/types'
import {
  primaryBtnStyle,
  labelStyle,
  cancelBtnStyle,
  errorStyle,
  sectionHeadingStyle
} from '../cssUtils'

interface BuyerFormProps {
  buyer?: Buyer
  onSuccess: (buyer: Buyer) => void
  onCancel: () => void
}

export function BuyerForm({ buyer, onSuccess, onCancel }: BuyerFormProps) {
  const toast = useToast()
  const isEdit = !!buyer

  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<BuyerInput>({
    companyName: buyer?.companyName ?? '',
    contactPerson: buyer?.contactPerson ?? '',
    country: buyer?.country ?? '',
    email: buyer?.email ?? '',
    phone: buyer?.phone ?? '',
    password: '',
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
  useEffect(() => {
    productsApi
      .getCategories()
      .then((res) => {
        if (res.success) setCategories(res.data)
      })
      .catch(() => {})
  }, [])

  function setField<K extends keyof BuyerInput>(field: K, value: BuyerInput[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field])
      setErrors((prev) => {
        const e = { ...prev }
        delete e[field]
        return e
      })
  }

  function toggleInterest(catId: string) {
    setForm((prev) => ({
      ...prev,
      interestIds: prev.interestIds.includes(catId)
        ? prev.interestIds.filter((id) => id !== catId)
        : [...prev.interestIds, catId]
    }))
  }

  function validateForm(): boolean {
    const e: Record<string, string> = {}
    if (!isEdit) {
      if (!form.password?.trim() || form.password.length < 6) {
        e.password = 'Password must be at least 6 characters'
      }
    }
    if (!form.companyName?.trim()) e.companyName = 'Company name is required'
    if (!form.contactPerson?.trim()) e.contactPerson = 'Contact person is required'
    if (!form.country?.trim()) e.country = 'Country is required'
    if (!form.phone?.trim()) e.phone = 'Phone number is required'

    // Email is now mandatory, check existence AND format
    if (!form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Valid email is required'
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      // Create a copy of the form data
      const payload = { ...form }

      if (isEdit) {
        delete payload.password
      }

      const res = isEdit
        ? await buyersApi.update(buyer!.id, payload)
        : await buyersApi.create(payload)

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

  function buildField(
    name: keyof BuyerInput,
    label: string,
    type: string = 'text',
    placeholder?: string
  ): ReactNode {
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        <input
          type={type}
          value={(form[name] as string) ?? ''}
          onChange={(e) => setField(name, e.target.value as any)}
          onFocus={onFocus}
          onBlur={(e) => onBlur(e, !!errors[name])}
          placeholder={placeholder}
          className="w-full"
          style={fieldStyle(!!errors[name])}
        />
        {errors[name] && <p style={errorStyle}>{errors[name]}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <h4 style={sectionHeadingStyle}>Company Information</h4>
        <div className="grid grid-cols-2 gap-4">
          {buildField('companyName', 'Company Name *')}
          {buildField('contactPerson', 'Contact Person *')}
          {buildField('country', 'Country *')}
          {buildField('email', 'Email *', 'email')}
          {buildField('phone', 'Phone *')}
          {!isEdit && buildField('password', 'Temporary Password *', 'password')}{' '}
          {/* Optional fields below */}
          {buildField('whatsapp', 'WhatsApp')}
          {buildField('website', 'Website', 'url', 'https://example.com')}
        </div>
      </section>

      <section>
        <h4 style={sectionHeadingStyle}>Legal & Financial</h4>
        <div className="grid grid-cols-2 gap-4">
          {buildField('businessRegistrationNo', 'Business Reg. Number')}
          {buildField('taxNumber', 'Tax Number')}

          <div>
            <label style={labelStyle}>Credit Rating</label>
            <select
              value={form.creditRating ?? 'Unrated'}
              onChange={(e) => setField('creditRating', e.target.value)}
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, false)}
              className="w-full bg-white"
              style={fieldStyle(false)}
            >
              {CREDIT_RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Annual Purchase Capacity</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={form.annualPurchaseCapacity ?? ''}
                onChange={(e) => setField('annualPurchaseCapacity', e.target.value)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, false)}
                className="flex-4"
                placeholder="0"
                min="0"
                style={fieldStyle(false)}
              />
              <select
                value={form.capacityUnit ?? 'MT'}
                onChange={(e) => setField('capacityUnit', e.target.value)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, false)}
                className="flex-1 bg-white"
                style={fieldStyle(false)}
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

      <section>
        <h4 style={sectionHeadingStyle}>Product Interests</h4>
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

      <section>
        <label style={labelStyle}>Notes</label>
        <textarea
          value={form.notes ?? ''}
          onChange={(e) => setField('notes', e.target.value)}
          onFocus={onFocus}
          onBlur={(e) => onBlur(e, false)}
          rows={3}
          className="w-full resize-none"
          placeholder="Any additional notes about this buyer…"
          style={fieldStyle(false)}
        />
      </section>

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
          {saving ? 'Saving…' : isEdit ? 'Update Buyer' : 'Add Buyer'}
        </button>
      </div>
    </form>
  )
}
