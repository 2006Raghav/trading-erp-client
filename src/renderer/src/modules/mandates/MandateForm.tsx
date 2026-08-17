// src/renderer/src/modules/mandates/MandateForm.tsx

import { useState, type ReactNode, type ChangeEvent, type FormEvent } from 'react'

import {
  mandatesApi,
  type Mandate,
  type MandateCreateBody,
  type MandateRepresents
} from './mandates.api'

import { useToast } from '../auth/ToastContext'

import {
  primaryBtnStyle,
  labelStyle,
  cancelBtnStyle,
  errorStyle,
  sectionHeadingStyle
} from '../cssUtils'

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface MandateFormProps {
  mandate?: Mandate
  onSuccess: (mandate: Mandate) => void
  onCancel: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Form
// ─────────────────────────────────────────────────────────────────────────────

export function MandateForm({ mandate, onSuccess, onCancel }: MandateFormProps) {
  const toast = useToast()

  const isEdit = !!mandate

  const [saving, setSaving] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<MandateCreateBody>({
    companyName: mandate?.companyName ?? '',
    country: mandate?.country ?? '',
    contactPerson: mandate?.contactPerson ?? '',

    represents: mandate?.represents ?? 'buyer_side',

    email: mandate?.email ?? '',
    phone: mandate?.phone ?? '',
    whatsapp: mandate?.whatsapp ?? '',

    businessRegistrationNo: mandate?.businessRegistrationNo ?? '',

    description: mandate?.description ?? '',

    notes: ''
  })

  // ─────────────────────────────────────────────────────────────────────────
  // Field helpers
  // ─────────────────────────────────────────────────────────────────────────

  function setField<K extends keyof MandateCreateBody>(field: K, value: MandateCreateBody[K]) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }

        delete next[field]

        return next
      })
    }
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {}

    if (!form.companyName?.trim()) {
      nextErrors.companyName = 'Company name is required'
    }

    if (!form.country?.trim()) {
      nextErrors.country = 'Country is required'
    }

    if (!form.contactPerson?.trim()) {
      nextErrors.contactPerson = 'Contact person is required'
    }

    if (!form.represents) {
      nextErrors.represents = 'Representation side is required'
    }

    if (form.email?.trim()) {
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)

      if (!validEmail) {
        nextErrors.email = 'Invalid email address'
      }
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Input styling
  // ─────────────────────────────────────────────────────────────────────────

  function fieldStyle(hasError: boolean): React.CSSProperties {
    return {
      width: '100%',
      padding: '9px 12px',
      minHeight: '40px',
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

  // ─────────────────────────────────────────────────────────────────────────
  // Reusable text field
  // ─────────────────────────────────────────────────────────────────────────

  function buildField(
    name: keyof MandateCreateBody,
    label: string,
    type = 'text',
    placeholder?: string
  ): ReactNode {
    const value = form[name]

    return (
      <div>
        <label style={labelStyle}>{label}</label>

        <input
          type={type}
          value={typeof value === 'string' ? value : ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setField(name, e.target.value as MandateCreateBody[typeof name])
          }
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

  // ─────────────────────────────────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!validateForm()) return

    setSaving(true)

    try {
      const payload: MandateCreateBody = {
        companyName: form.companyName.trim(),

        country: form.country.trim(),

        contactPerson: form.contactPerson.trim(),

        represents: form.represents,

        email: form.email?.trim() || undefined,

        phone: form.phone?.trim() || undefined,

        whatsapp: form.whatsapp?.trim() || undefined,

        businessRegistrationNo: form.businessRegistrationNo?.trim() || undefined,

        description: form.description?.trim() || undefined,

        notes: form.notes?.trim() || undefined
      }

      const res = isEdit
        ? await mandatesApi.update(mandate!.id, payload)
        : await mandatesApi.create(payload)

      if (res.success) {
        onSuccess(res.data)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save mandate')
    } finally {
      setSaving(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ───────────────────────────────────────────────────────────────────
          Mandate Details
      ─────────────────────────────────────────────────────────────────── */}

      <section>
        <h4 style={sectionHeadingStyle}>Mandate Details</h4>

        <div className="space-y-4">
          <div>
            <label style={labelStyle}>Represents *</label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setField('represents', 'buyer_side')}
                className="rounded-lg border px-4 py-3 text-left transition-colors"
                style={{
                  borderColor:
                    form.represents === 'buyer_side'
                      ? 'var(--color-cobalt-600)'
                      : 'var(--color-slate-200)',

                  background:
                    form.represents === 'buyer_side'
                      ? 'var(--color-cobalt-50)'
                      : 'var(--color-white)'
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{
                    color:
                      form.represents === 'buyer_side'
                        ? 'var(--color-cobalt-700)'
                        : 'var(--color-ink-900)'
                  }}
                >
                  Buyer Side
                </p>

                <p className="text-xs text-slate-400 mt-1">Represents commodity buyers</p>
              </button>

              <button
                type="button"
                onClick={() => setField('represents', 'seller_side')}
                className="rounded-lg border px-4 py-3 text-left transition-colors"
                style={{
                  borderColor:
                    form.represents === 'seller_side'
                      ? 'var(--color-warning)'
                      : 'var(--color-slate-200)',

                  background:
                    form.represents === 'seller_side'
                      ? 'var(--color-warning-bg)'
                      : 'var(--color-white)'
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{
                    color:
                      form.represents === 'seller_side'
                        ? 'var(--color-warning)'
                        : 'var(--color-ink-900)'
                  }}
                >
                  Seller Side
                </p>

                <p className="text-xs text-slate-400 mt-1">Represents commodity sellers</p>
              </button>
            </div>

            {errors.represents && <p style={errorStyle}>{errors.represents}</p>}
          </div>

          <div>
            <label style={labelStyle}>Description</label>

            <textarea
              value={form.description ?? ''}
              onChange={(e) => setField('description', e.target.value)}
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, false)}
              rows={4}
              className="w-full resize-none"
              placeholder="Brief description of the mandate scope"
              style={fieldStyle(false)}
            />
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────
          Company
      ─────────────────────────────────────────────────────────────────── */}

      <section>
        <h4 style={sectionHeadingStyle}>Company</h4>

        <div className="grid grid-cols-2 gap-4">
          {buildField('companyName', 'Company Name *')}

          {buildField('country', 'Country *')}

          {buildField('businessRegistrationNo', 'Reg. Number')}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────
          Contact
      ─────────────────────────────────────────────────────────────────── */}

      <section>
        <h4 style={sectionHeadingStyle}>Contact</h4>

        <div className="grid grid-cols-2 gap-4">
          {buildField('contactPerson', 'Contact Person *')}

          {buildField('email', 'Email', 'email')}

          {buildField('phone', 'Phone')}

          {buildField('whatsapp', 'WhatsApp')}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────
          Internal Notes
      ─────────────────────────────────────────────────────────────────── */}

      <section>
        <h4 style={sectionHeadingStyle}>Notes</h4>

        <label style={labelStyle}>Internal Notes</label>

        <textarea
          value={form.notes ?? ''}
          onChange={(e) => setField('notes', e.target.value)}
          onFocus={onFocus}
          onBlur={(e) => onBlur(e, false)}
          rows={4}
          className="w-full resize-none"
          placeholder="Internal notes about this mandate"
          style={fieldStyle(false)}
        />

        <p className="text-xs text-slate-400 mt-1.5">These notes are for internal staff only.</p>
      </section>

      {/* ───────────────────────────────────────────────────────────────────
          Actions
      ─────────────────────────────────────────────────────────────────── */}

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
          {saving ? 'Saving…' : isEdit ? 'Update Mandate' : 'Add Mandate'}
        </button>
      </div>
    </form>
  )
}
