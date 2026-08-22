import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Building2,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react'

import { useAuth } from '../auth/AuthContext'
import { useToast } from '../auth/ToastContext'
import { registrationApi } from './registration.api'
import { RegistrationDocuments } from './RegistrationDocuments'
import { Button } from '../../components/ui/button'

import type {
  RegistrationDocument,
  RegistrationDocumentType,
  RegistrationEntityType,
  KycStatus
} from './registration.types'

// ─────────────────────────────────────────────────────────────────────────────
// Required documents per entity — mirrored from server auth.documents.ts
// ─────────────────────────────────────────────────────────────────────────────

const DOCUMENTS_BY_TYPE: Record<
  RegistrationEntityType,
  readonly { type: RegistrationDocumentType; label: string }[]
> = {
  buyer: [
    { type: 'passport_copy', label: 'Passport (Authorized Representative)' },
    { type: 'company_registration', label: 'Company Registration Certificate' },
    { type: 'incorporation_doc', label: 'Company Incorporation Document' },
    { type: 'export_license', label: 'Export License' },
    { type: 'trade_license', label: 'Trade License' },
    { type: 'bank_reference', label: 'Bank Reference Letter' }
  ],
  seller: [
    { type: 'passport_copy', label: 'Passport (Authorized Representative)' },
    { type: 'company_registration', label: 'Company Registration Certificate' },
    { type: 'incorporation_doc', label: 'Company Incorporation Document' },
    { type: 'export_license', label: 'Export License' },
    { type: 'trade_license', label: 'Trade License' },
    { type: 'bank_reference', label: 'Bank Reference Letter' },
    { type: 'analytical_reports', label: 'Analytical Report(s)' },
    { type: 'past_trade_records', label: 'Past Trade Records' },
    { type: 'availability_statement', label: 'Goods Availability Statement' }
  ],
  mandate: [
    { type: 'passport_copy', label: 'Passport (Authorized Representative)' },
    { type: 'company_registration', label: 'Company Registration Certificate' },
    { type: 'incorporation_doc', label: 'Company Incorporation Document' },
    { type: 'export_license', label: 'Export License' },
    { type: 'trade_license', label: 'Trade License' },
    { type: 'bank_reference', label: 'Bank Reference Letter' },
    { type: 'representation_agreement', label: 'Representation Agreement' }
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Resubmission Page
// ─────────────────────────────────────────────────────────────────────────────

type PageState = 'loading' | 'error' | 'ineligible' | 'documents' | 'success'

export function ResubmissionPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, kycStatus: contextKycStatus, rejectionReason: contextRejectionReason } = useAuth()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(contextKycStatus)
  const [rejectionReason, setRejectionReason] = useState<string | null>(
    contextRejectionReason
  )

  const [documents, setDocuments] = useState<RegistrationDocument[]>([])
  const [uploading, setUploading] = useState<RegistrationDocumentType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ── Resolve entity info from user ──────────────────────────────────────────
  const entityType: RegistrationEntityType | null =
    user?.userType === 'buyer' || user?.userType === 'seller' || user?.userType === 'mandate'
      ? user.userType
      : null

  const entityId: string | null = user?.id ?? null

  const companyName: string =
    user && 'companyName' in user ? (user.companyName ?? '') : ''

  // ── Load status + documents on mount ──────────────────────────────────────
  const loadPage = useCallback(async () => {
    if (!entityType || !entityId) {
      setPageState('ineligible')
      return
    }

    setPageState('loading')

    try {
      // Load live status (for the rejection reason, which is not in JWT)
      const statusRes = await registrationApi.getRegistrationStatus(entityType, entityId)

      if (!statusRes.success || !statusRes.data) {
        throw new Error(statusRes.error ?? 'Could not load registration status')
      }

      const { kycStatus: liveStatus, rejectionReason: liveReason } = statusRes.data

      setKycStatus(liveStatus)
      setRejectionReason(liveReason)

      // Only rejected entities can resubmit
      if (liveStatus !== 'rejected') {
        setPageState('ineligible')
        return
      }

      // Load current documents
      const docsRes = await registrationApi.getDocuments(entityType, entityId)

      if (docsRes.success && docsRes.data) {
        setDocuments(docsRes.data)
      }

      setPageState('documents')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load resubmission page')
      setPageState('error')
    }
  }, [entityType, entityId])

  useEffect(() => {
    void loadPage()
  }, [loadPage])

  // ── Upload handler ─────────────────────────────────────────────────────────
  async function handleUpload(documentType: RegistrationDocumentType, file: File) {
    if (!entityId || !entityType) return

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Use PDF, JPG, or PNG files')
      return
    }
    if (file.size <= 0 || file.size > 20 * 1024 * 1024) {
      toast.error('File must be between 0 and 20 MB')
      return
    }

    try {
      setUploading(documentType)

      const response = await registrationApi.uploadDocument(
        entityId,
        entityType,
        documentType,
        file
      )

      if (!response.success) {
        throw new Error(response.error ?? 'Upload failed')
      }

      const uploaded = response.data
      const isMulti =
        documentType === 'analytical_reports' || documentType === 'past_trade_records'

      setDocuments((current) => {
        if (isMulti) return [...current, uploaded]
        return [...current.filter((d) => d.documentType !== documentType), uploaded]
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Document upload failed')
    } finally {
      setUploading(null)
    }
  }

  // ── Remove handler ─────────────────────────────────────────────────────────
  async function handleRemove(document: RegistrationDocument) {
    if (!entityType || !entityId) return

    try {
      const response = await registrationApi.removeDocument(
        document.id,
        entityType,
        entityId,
        document.documentType
      )

      if (!response.success) {
        throw new Error('Could not remove document')
      }

      setDocuments((current) => current.filter((d) => d.id !== document.id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not remove document')
    }
  }

  // ── Submit handler ─────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!entityType || !entityId) return

    try {
      setSubmitting(true)

      const response = await registrationApi.submitApplication({
        entityType,
        entityId
      })

      if (!response.success) {
        if (response.missingDocuments && response.missingDocuments.length > 0) {
          toast.error(`Missing required documents: ${response.missingDocuments.join(', ')}`)
          return
        }
        throw new Error(response.error ?? 'Submission failed')
      }

      setPageState('success')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Loading
  // ─────────────────────────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas-50)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-cobalt-600)]" />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Error
  // ─────────────────────────────────────────────────────────────────────────

  if (pageState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-canvas-50)] p-8 text-center">
        <AlertCircle className="h-12 w-12 text-[var(--color-danger)]" />
        <h2 className="mt-4 text-lg font-semibold text-[var(--color-ink-900)]">
          Could not load resubmission
        </h2>
        <p className="mt-2 text-sm text-[var(--color-slate-500)]">
          {errorMessage ?? 'An unexpected error occurred.'}
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => void loadPage()}
        >
          Try again
        </Button>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Ineligible (status is not "rejected")
  // ─────────────────────────────────────────────────────────────────────────

  if (pageState === 'ineligible') {
    const statusLabel: Record<string, string> = {
      pending: 'pending review',
      under_review: 'under review',
      resubmitted: 'already resubmitted and awaiting review',
      approved: 'approved'
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-canvas-50)] p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-[var(--color-success)]" />
        <h2 className="mt-4 text-lg font-semibold text-[var(--color-ink-900)]">
          No action needed
        </h2>
        <p className="mt-2 max-w-sm text-sm text-[var(--color-slate-500)]">
          Your application is{' '}
          {kycStatus ? statusLabel[kycStatus] ?? kycStatus : 'not in a rejected state'}.
          Resubmission is only available for rejected applications.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Success
  // ─────────────────────────────────────────────────────────────────────────

  if (pageState === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-canvas-50)] p-8 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: 'var(--color-success-bg)' }}
        >
          <CheckCircle2
            className="h-10 w-10"
            style={{ color: 'var(--color-success)' }}
          />
        </div>

        <h2
          className="mt-6 text-2xl font-semibold"
          style={{ color: 'var(--color-ink-900)' }}
        >
          Documents resubmitted successfully
        </h2>

        <p
          className="mt-3 max-w-md text-sm leading-6"
          style={{ color: 'var(--color-slate-500)' }}
        >
          Your application is now awaiting review. Our team will verify your updated documents
          and notify you of the outcome. You can explore the marketplace in the meantime.
        </p>

        <Button
          id="resubmission-go-to-marketplace"
          onClick={() => navigate('/marketplace')}
          className="mt-8"
          style={{ background: 'var(--color-cobalt-600)', color: 'white' }}
        >
          Browse Marketplace
          <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
        </Button>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Documents (main view)
  // ─────────────────────────────────────────────────────────────────────────

  const requiredDocuments = entityType ? DOCUMENTS_BY_TYPE[entityType] : []

  return (
    <div className="min-h-screen bg-[var(--color-canvas-50)]">
      <div className="mx-auto max-w-3xl px-6 py-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-slate-200)] bg-white hover:bg-[var(--color-canvas-50)]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--color-slate-500)]" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[var(--color-cobalt-600)]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-cobalt-600)]">
                KYC Resubmission
              </span>
            </div>

            <h1 className="mt-0.5 text-xl font-semibold text-[var(--color-ink-900)]">
              Re-submit Your Documents
            </h1>
          </div>
        </div>

        {/* ── Rejection Reason Banner ──────────────────────────────────── */}
        {rejectionReason && (
          <div
            className="mb-6 rounded-lg border p-4"
            style={{
              borderColor: 'var(--color-danger)',
              background: 'var(--color-danger-bg)'
            }}
          >
            <div className="flex gap-3">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: 'var(--color-danger)' }}
              />
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-danger)' }}
                >
                  Reason for Rejection
                </p>
                <p
                  className="mt-1 text-sm leading-6"
                  style={{ color: 'var(--color-ink-900)' }}
                >
                  {rejectionReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Instruction ───────────────────────────────────────────────── */}
        <div
          className="mb-6 rounded-lg border border-[var(--color-slate-200)] bg-white p-4"
        >
          <div className="flex gap-3">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-cobalt-600)]" />
            <div>
              <p className="text-xs font-semibold text-[var(--color-ink-900)]">
                What to do
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-slate-500)]">
                Replace only the document(s) that were flagged. Your other accepted
                documents remain. Once all required documents are present, click{' '}
                <strong>Re-submit Documents</strong> to send your application back for review.
              </p>
            </div>
          </div>
        </div>

        {/* ── Document upload list (reuses existing component) ──────────── */}
        <div className="rounded-xl border border-[var(--color-slate-200)] bg-white p-6 shadow-sm">
          <RegistrationDocuments
            registrationType={entityType ?? 'buyer'}
            documents={documents}
            requiredDocuments={requiredDocuments}
            uploading={uploading}
            allRequiredUploaded={requiredDocuments.every((d) =>
              documents.some((doc) => doc.documentType === d.type)
            )}
            onUpload={handleUpload}
            onRemove={handleRemove}
            onBack={() => navigate(-1)}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel={
              submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resubmitting…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-submit Documents
                </>
              )
            }
          />
        </div>

      </div>
    </div>
  )
}
