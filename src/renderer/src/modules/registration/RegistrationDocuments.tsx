import React from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react'

import { Button } from '../../components/ui/button'

import { DocumentUploadRow } from './DocumentUploadRow'

import type {
  RegistrationDocument,
  RegistrationDocumentType,
  RegistrationType
} from './registration.types'

export interface RequiredDocument {
  type: RegistrationDocumentType
  label: string
}

interface RegistrationDocumentsProps {
  registrationType: RegistrationType
  documents: RegistrationDocument[]
  requiredDocuments: readonly RequiredDocument[]
  uploading: RegistrationDocumentType | null
  allRequiredUploaded: boolean
  onUpload: (type: RegistrationDocumentType, file: File) => void
  onRemove: (document: RegistrationDocument) => void
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
  /** Optional override for the submit button label. Defaults to 'Submit Application'. */
  submitLabel?: React.ReactNode
}

const MULTI_FILE_DOCUMENT_TYPES: readonly RegistrationDocumentType[] = [
  'analytical_reports',
  'past_trade_records'
]

function isMultiFileDocumentType(documentType: RegistrationDocumentType): boolean {
  return MULTI_FILE_DOCUMENT_TYPES.includes(documentType)
}

export function RegistrationDocuments({
  registrationType,
  documents,
  requiredDocuments,
  uploading,
  submitting,
  onUpload,
  onRemove,
  onBack,
  onSubmit,
  submitLabel
}: RegistrationDocumentsProps) {
  const uploadedTypes = new Set(documents.map((document) => document.documentType))

  const allRequiredUploaded = requiredDocuments.every((document) =>
    uploadedTypes.has(document.type)
  )

  return (
    <div className="space-y-7">
      {/* HEADER */}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-cobalt-600)]">
          KYC verification
        </p>

        <h3 className="mt-2 text-xl font-semibold text-[var(--color-ink-900)]">
          Required Documents
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-slate-500)]">
          Upload the documents required for your{' '}
          <span className="font-semibold capitalize">{registrationType}</span> registration. Your
          documents will be reviewed by our verification team.
        </p>
      </div>

      {/* DOCUMENT LIST */}

      <div className="space-y-3">
        {requiredDocuments.map((document) => {
          const uploadedDocuments = documents.filter((item) => item.documentType === document.type)

          return (
            <DocumentUploadRow
              key={document.type}
              documentType={document.type}
              label={document.label}
              documents={uploadedDocuments}
              multiple={isMultiFileDocumentType(document.type)}
              uploading={uploading === document.type}
              onUpload={onUpload}
              onRemove={onRemove}
            />
          )
        })}
      </div>

      {/* INFORMATION */}

      <div className="rounded-lg border border-[var(--color-slate-200)] bg-[var(--color-canvas-50)] p-4">
        <div className="flex gap-3">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-cobalt-600)]" />

          <div>
            <p className="text-xs font-semibold text-[var(--color-ink-900)]">
              Document requirements
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--color-slate-500)]">
              Accepted formats are PDF, JPG, PNG, and DOCX. Each file must be no larger than 20MB.
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--color-slate-500)]">
              Your application cannot be submitted until all required document types have been
              uploaded.
            </p>
          </div>
        </div>
      </div>

      {/* COMPLETION STATUS */}

      <div
        className={[
          'flex items-center gap-3 rounded-lg border p-4',
          allRequiredUploaded
            ? 'border-[var(--color-success)] bg-[var(--color-success-bg)]'
            : 'border-[var(--color-slate-200)] bg-white'
        ].join(' ')}
      >
        <CheckCircle2
          className={[
            'h-5 w-5 shrink-0',
            allRequiredUploaded ? 'text-[var(--color-success)]' : 'text-[var(--color-slate-300)]'
          ].join(' ')}
        />

        <div>
          <p className="text-sm font-semibold text-[var(--color-ink-900)]">
            {allRequiredUploaded
              ? 'All required documents uploaded'
              : 'Documents required before submission'}
          </p>

          {!allRequiredUploaded && (
            <p className="mt-0.5 text-xs text-[var(--color-slate-500)]">
              Upload the remaining required documents to continue.
            </p>
          )}
        </div>
      </div>

      {/* ACTIONS */}

      <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-slate-200)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={onBack}
          className="border-[var(--color-slate-200)]"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>

        <Button
          type="button"
          disabled={!allRequiredUploaded || submitting}
          onClick={onSubmit}
          className="bg-[var(--color-cobalt-600)] text-white hover:bg-[var(--color-cobalt-700)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel ?? (
            submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Application
              </>
            ) : (
              <>
                Submit Application
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )
          )}
        </Button>
      </div>
    </div>
  )
}
