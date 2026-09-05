import { useState } from 'react'
import { CheckCircle2, FileText, Loader2, Trash2, Upload } from 'lucide-react'
import type { RegistrationDocument, RegistrationDocumentType, PendingDocument } from './registration.types'

interface DocumentUploadRowProps {
  documentType: RegistrationDocumentType
  label: string
  documents: (RegistrationDocument | PendingDocument)[]
  multiple: boolean
  uploading: boolean
  onUpload: (documentType: RegistrationDocumentType, file: File) => Promise<void> | void
  onRemove: (document: RegistrationDocument | PendingDocument) => Promise<void> | void
  kycStatus?: string
}

const MAX_FILE_SIZE = 20 * 1024 * 1024

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const

function isAllowedMimeType(file: File): boolean {
  return ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])
}

function isAllowedFileSize(file: File): boolean {
  return Number.isFinite(file.size) && file.size > 0 && file.size <= MAX_FILE_SIZE
}

export function DocumentUploadRow({
  documentType,
  label,
  documents,
  multiple,
  uploading,
  onUpload,
  onRemove,
  kycStatus
}: DocumentUploadRowProps) {
  const [isDragging, setIsDragging] = useState(false)

  const inputId = `registration-document-${documentType}`

  const hasDocuments = documents.length > 0

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      event.target.value = ''
      return
    }

    void processFiles(files)

    event.target.value = ''
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)

    if (uploading) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    void processFiles(files)
  }

  async function processFiles(files: File[]) {
    for (const file of files) {
      if (!isAllowedMimeType(file)) {
        continue
      }

      if (!isAllowedFileSize(file)) {
        continue
      }

      await onUpload(documentType, file)

      if (!multiple) {
        break
      }
    }
  }

  const isFlagged =
    kycStatus === 'rejected' &&
    (!hasDocuments ||
      documents.some((doc) => {
        if ('file' in doc) return false // Pending document (just uploaded by user)
        return doc.verified !== true
      }))

  return (
    <div 
      className={[
        'rounded-lg border p-4 transition-colors',
        isDragging
          ? 'border-[var(--color-slate-400)] bg-[var(--color-canvas-50)]'
          : isFlagged
            ? 'border-[var(--color-danger)] bg-[var(--color-danger-bg)]'
            : 'border-[var(--color-slate-200)] bg-white'
      ].join(' ')}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* DOCUMENT INFORMATION */}

        <div className="flex min-w-0 gap-3">
          <div
            className={[
              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
              hasDocuments
                ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                : 'bg-[var(--color-canvas-50)] text-[var(--color-slate-500)]'
            ].join(' ')}
          >
            {hasDocuments ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold text-[var(--color-ink-900)]">{label}</h4>

              <span
                className={[
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  isFlagged
                    ? 'bg-[var(--color-danger)] text-white'
                    : hasDocuments
                      ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                      : 'bg-[var(--color-slate-100)] text-[var(--color-slate-600)]'
                ].join(' ')}
              >
                {isFlagged ? 'Action Required' : hasDocuments ? 'Uploaded' : 'Required'}
              </span>
            </div>

            <p className="mt-1 text-xs text-[var(--color-slate-500)]">
              PDF, JPG, PNG, or DOCX · Max 20MB
            </p>

            {/* UPLOADED FILES */}

            {documents.length > 0 && (
              <div className="mt-3 space-y-2">
                {documents.map((document) => {
                  if (!document?.id) {
                    return null
                  }

                  const name = 'file' in document ? document.file.name : document.fileName

                  return (
                    <div
                      key={document.id}
                      className="flex items-center gap-2 rounded-md bg-[var(--color-canvas-50)] px-3 py-2"
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--color-slate-500)]" />

                      <span className="min-w-0 flex-1 truncate text-xs text-[var(--color-ink-900)]">
                        {name || 'Uploaded document'}
                      </span>

                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => void onRemove(document)}
                        aria-label={`Remove ${name || 'document'}`}
                        className="shrink-0 text-[var(--color-slate-500)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* MULTI FILE NOTE */}

            {multiple && (
              <p className="mt-3 text-[11px] leading-5 text-[var(--color-slate-500)]">
                Multiple files may be uploaded for this document type.
              </p>
            )}
          </div>
        </div>

        {/* UPLOAD */}

        <div className="shrink-0">
          <input
            id={inputId}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            multiple={multiple}
            disabled={uploading}
            onChange={handleFileChange}
          />

          <label
            htmlFor={inputId}
            className={[
              'inline-flex h-9 items-center rounded-md border px-3 text-xs font-semibold transition-colors',
              uploading
                ? 'pointer-events-none border-[var(--color-slate-200)] text-[var(--color-slate-500)]'
                : 'cursor-pointer border-[var(--color-slate-200)] bg-white text-[var(--color-ink-900)] hover:bg-[var(--color-canvas-50)]'
            ].join(' ')}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Uploading
              </>
            ) : (
              <>
                <Upload className="mr-2 h-3.5 w-3.5" />
                {hasDocuments && !multiple ? 'Replace' : 'Upload File'}
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  )
}
