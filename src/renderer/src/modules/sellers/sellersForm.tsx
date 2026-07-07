import { useState } from 'react'
import { sellersApi, type SellerInput } from './sellers.api'
import { useToast } from '../auth/ToastContext'
import { COMMODITY_UNITS } from '../../lib/constants'
import { X, Plus } from 'lucide-react'
import type { Seller } from '../../lib/types'

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
    notes: seller?.notes ?? ''
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
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const res = isEdit ? await sellersApi.update(seller!.id, form) : await sellersApi.create(form)
      if (res.success) onSuccess(res.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const cls = (field: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2
     focus:ring-brand-500 focus:border-transparent
     ${errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-300'}`

  const SectionTitle = ({ title }: { title: string }) => (
    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h4>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company */}
      <section>
        <SectionTitle title="Company Information" />
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Company Name *</label>
            <input
              value={form.companyName}
              onChange={(e) => setField('companyName', e.target.value)}
              className={cls('companyName')}
              placeholder="e.g. Global Metals Ltd."
            />
            {errors.companyName && (
              <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
            )}
          </div>
          {(['country', 'contactPerson', 'email', 'phone'] as const).map((f) => (
            <div key={f}>
              <label className="block text-xs font-medium text-slate-600 mb-1 capitalize">
                {f === 'contactPerson' ? 'Contact Person' : f.charAt(0).toUpperCase() + f.slice(1)}
              </label>
              <input
                value={(form[f] as string) ?? ''}
                onChange={(e) => setField(f, e.target.value)}
                type={f === 'email' ? 'email' : 'text'}
                className={cls(f)}
              />
              {errors[f] && <p className="text-red-500 text-xs mt-1">{errors[f]}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Addresses */}
      <section>
        <SectionTitle title="Addresses" />
        <div className="grid grid-cols-2 gap-4">
          {(['factoryAddress', 'warehouseAddress'] as const).map((f) => (
            <div key={f}>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {f === 'factoryAddress' ? 'Factory Address' : 'Warehouse Address'}
              </label>
              <textarea
                value={form[f] ?? ''}
                onChange={(e) => setField(f, e.target.value)}
                rows={2}
                className={`${cls(f)} resize-none`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Capacity */}
      <section>
        <SectionTitle title="Production Capacity" />
        <div className="flex gap-3 max-w-xs">
          <input
            type="number"
            value={form.monthlyProductionCapacity ?? ''}
            onChange={(e) => setField('monthlyProductionCapacity', e.target.value)}
            className={`flex-1 ${cls('monthlyProductionCapacity')}`}
            placeholder="0"
            min="0"
            step="0.01"
          />
          <select
            value={form.capacityUnit ?? 'MT'}
            onChange={(e) => setField('capacityUnit', e.target.value)}
            className="w-24 px-2 py-2 text-sm border border-slate-300 rounded-lg bg-white
                       focus:outline-none focus:ring-2 focus:ring-brand-500"
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

      {/* Tag arrays: certifications + export licenses */}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag(field, val)
                }
              }}
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={`Add ${label.toLowerCase().slice(0, -1)} and press Enter`}
            />
            <button
              type="button"
              onClick={() => addTag(field, val)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm
                         rounded-lg flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {(form[field] as string[]).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(form[field] as string[]).map((item) => (
                <span
                  key={item}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs
                    ${
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

      {/* Banking */}
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
              <label className="block text-xs font-medium text-slate-600 mb-1">{lbl}</label>
              <input
                value={form[f] ?? ''}
                onChange={(e) => setField(f, e.target.value)}
                className={cls(f)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section>
        <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
        <textarea
          value={form.notes ?? ''}
          onChange={(e) => setField('notes', e.target.value)}
          rows={3}
          className={`${cls('notes')} resize-none`}
        />
      </section>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-50
                     text-white font-medium rounded-lg"
        >
          {saving ? 'Saving…' : isEdit ? 'Update Seller' : 'Add Seller'}
        </button>
      </div>
    </form>
  )
}
