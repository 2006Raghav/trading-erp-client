import { useState } from 'react'
import { sellersApi, type SellerInput } from './sellers.api'
import { useToast } from '../auth/ToastContext'
import { COMMODITY_UNITS } from '../../lib/constants'
import { X, Plus } from 'lucide-react'
import type { Seller } from '../../lib/types'
import {
  primaryBtnStyle,
  labelStyle,
  cancelBtnStyle,
  errorStyle,
  sectionHeadingStyle
} from '../cssUtils'

interface Props {
  seller?: Seller
  onSuccess: (seller: Seller) => void
  onCancel: () => void
}

export function SellerForm({ seller, onSuccess, onCancel }: Props) {
  const toast = useToast()
  const isEdit = !!seller

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [certInput, setCertInput] = useState('')
  const [licenseInput, setLicenseInput] = useState('')

  const [form, setForm] = useState<SellerInput>({
    companyName: seller?.companyName ?? '',
    country: seller?.country ?? '',
    contactPerson: seller?.contactPerson ?? '',
    email: seller?.email ?? '',
    phone: seller?.phone ?? '',
    factoryAddress: seller?.factoryAddress ?? '',
    warehouseAddress: seller?.warehouseAddress ?? '',
    monthlyProductionCapacity: seller?.monthlyProductionCapacity ?? '',
    capacityUnit: seller?.capacityUnit ?? 'MT',
    certifications: seller?.certifications ?? [],
    exportLicenses: seller?.exportLicenses ?? [],
    bankName: seller?.bankName ?? '',
    bankAccountNo: seller?.bankAccountNo ?? '',
    bankSwiftCode: seller?.bankSwiftCode ?? '',
    bankIban: seller?.bankIban ?? '',
    bankCountry: seller?.bankCountry ?? '',
    notes: seller?.notes ?? '',
    password: ''
  })

  function setField<K extends keyof SellerInput>(key: K, value: SellerInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key])
      setErrors((prev) => {
        const e = { ...prev }
        delete e[key]
        return e
      })
  }

  function addTag(type: 'certifications' | 'exportLicenses', value: string) {
    const trimmed = value.trim()
    if (!trimmed || (form[type] as string[]).includes(trimmed)) return
    setField(type, [...(form[type] as string[]), trimmed])
    type === 'certifications' ? setCertInput('') : setLicenseInput('')
  }

  function removeTag(type: 'certifications' | 'exportLicenses', item: string) {
    setField(
      type,
      (form[type] as string[]).filter((x) => x !== item)
    )
  }

  function validate(): boolean {
    const e: Record<string, string> = {}

    if (!form.companyName?.trim()) e.companyName = 'Company name is required'
    if (!form.contactPerson?.trim()) e.contactPerson = 'Contact person is required'
    if (!form.country?.trim()) e.country = 'Country is required'
    if (!form.phone?.trim()) e.phone = 'Phone number is required'

    if (!form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Valid email is required'
    }

    // ONLY require password if creating a new seller
    if (!isEdit) {
      if (!form.password?.trim() || form.password.length < 6) {
        e.password = 'Password must be at least 6 characters'
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      // 1. Create a copy
      const payload = { ...form }

      // 2. Strip password if editing
      if (isEdit) {
        delete payload.password
      }

      // 3. Send payload instead of raw form state
      const res = isEdit
        ? await sellersApi.update(seller!.id, payload)
        : await sellersApi.create(payload)

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
      border: `1px solid ${hasError ? 'var(--danger-text)' : 'var(--border)'}`,
      borderRadius: '8px',
      background: hasError ? 'var(--danger-bg)' : 'var(--bg-canvas)',
      color: 'var(--text-primary)',
      outline: 'none',
      fontFamily: 'var(--font-ui)'
    }
  }

  function onFocus(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    e.target.style.borderColor = 'var(--action)'
    e.target.style.boxShadow = '0 0 0 2px var(--action-tint-strong)'
  }

  function onBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    hasError: boolean
  ) {
    e.target.style.borderColor = hasError ? 'var(--danger-text)' : 'var(--border)'
    e.target.style.boxShadow = ''
  }

  const SectionTitle = ({ title }: { title: string }) => (
    <h4 style={sectionHeadingStyle}>{title}</h4>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <SectionTitle title="Company Information" />
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label style={labelStyle}>Company Name *</label>
            <input
              value={form.companyName}
              onChange={(e) => setField('companyName', e.target.value)}
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, !!errors.companyName)}
              className="w-full"
              placeholder="e.g. Global Metals Ltd."
              style={fieldStyle(!!errors.companyName)}
            />
            {errors.companyName && <p style={errorStyle}>{errors.companyName}</p>}
          </div>
          {(['country', 'contactPerson', 'email', 'phone'] as const).map((f) => (
            <div key={f}>
              <label style={labelStyle}>
                {f === 'contactPerson'
                  ? 'Contact Person *'
                  : f.charAt(0).toUpperCase() + f.slice(1) + ' *'}
              </label>
              <input
                value={(form[f] as string) ?? ''}
                onChange={(e) => setField(f, e.target.value)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, !!errors[f])}
                type={f === 'email' ? 'email' : 'text'}
                className="w-full"
                style={fieldStyle(!!errors[f])}
              />
              {errors[f] && <p style={errorStyle}>{errors[f]}</p>}
            </div>
          ))}
          {/* Render password ONLY when creating a new seller */}
          {!isEdit && (
            <div>
              <label style={labelStyle}>Temporary Password *</label>
              <input
                type="password"
                value={form.password ?? ''}
                onChange={(e) => setField('password', e.target.value)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, !!errors.password)}
                className="w-full"
                style={fieldStyle(!!errors.password)}
              />
              {errors.password && <p style={errorStyle}>{errors.password}</p>}
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionTitle title="Addresses" />
        <div className="grid grid-cols-2 gap-4">
          {(['factoryAddress', 'warehouseAddress'] as const).map((f) => (
            <div key={f}>
              <label style={labelStyle}>
                {f === 'factoryAddress' ? 'Factory Address' : 'Warehouse Address'}
              </label>
              <textarea
                value={form[f] ?? ''}
                onChange={(e) => setField(f, e.target.value)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, false)}
                rows={2}
                className="w-full resize-none"
                style={fieldStyle(false)}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title="Production Capacity" />
        <div className="flex gap-3 max-w-md">
          <input
            type="number"
            value={form.monthlyProductionCapacity ?? ''}
            onChange={(e) => setField('monthlyProductionCapacity', e.target.value)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, !!errors.monthlyProductionCapacity)}
            className="flex-7"
            placeholder="0"
            min="0"
            step="0.01"
            style={fieldStyle(!!errors.monthlyProductionCapacity)}
          />
          <select
            value={form.capacityUnit ?? 'MT'}
            onChange={(e) => setField('capacityUnit', e.target.value)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, false)}
            className="flex-2 bg-white"
            style={fieldStyle(false)}
          >
            {COMMODITY_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <span className="flex items-center text-xs text-slate-400 whitespace-nowrap">
            per month
          </span>
        </div>
      </section>

      {[
        {
          label: 'Certifications',
          field: 'certifications' as const,
          val: certInput,
          setVal: setCertInput,
          color: 'brand'
        },
        {
          label: 'Export Licenses',
          field: 'exportLicenses' as const,
          val: licenseInput,
          setVal: setLicenseInput,
          color: 'amber'
        }
      ].map(({ label, field, val, setVal, color }) => (
        <section key={field}>
          <SectionTitle title={label} />
          <div className="flex gap-2 mb-2">
            <input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag(field, val)
                }
              }}
              className="flex-1"
              placeholder={`Add ${label.toLowerCase().slice(0, -1)} and press Enter`}
              style={fieldStyle(false)}
            />
            <button
              type="button"
              onClick={() => addTag(field, val)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {(form[field] as string[]).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(form[field] as string[]).map((item) => (
                <span
                  key={item}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${
                    color === 'brand'
                      ? 'bg-brand-50 text-brand-700 border border-brand-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeTag(field, item)}
                    className="opacity-60 hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>
      ))}

      <section>
        <div className="flex items-center gap-3 mb-3">
          <SectionTitle title="Banking Details" />
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            Sensitive
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              ['bankName', 'Bank Name'],
              ['bankCountry', 'Bank Country'],
              ['bankAccountNo', 'Account Number'],
              ['bankSwiftCode', 'SWIFT / BIC'],
              ['bankIban', 'IBAN']
            ] as const
          ).map(([f, lbl]) => (
            <div key={f} className={f === 'bankIban' ? 'col-span-2' : ''}>
              <label style={labelStyle}>{lbl}</label>
              <input
                value={form[f] ?? ''}
                onChange={(e) => setField(f, e.target.value)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, false)}
                className="w-full"
                style={fieldStyle(false)}
              />
            </div>
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
          {saving ? 'Saving…' : isEdit ? 'Update Seller' : 'Add Seller'}
        </button>
      </div>
    </form>
  )
}
