import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  ShieldCheck,
  X
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'

import type { KycDetails, KycDocument } from './kyc.types'

type DocumentVerificationStatus = 'unchecked' | 'verified' | 'faulty'

interface KycDocumentsPanelProps {
  applicant: KycDetails

  /**
   * Called whenever an admin changes a document/group verification state.
   *
   * Backend persistence can be connected later without changing
   * the presentation component.
   */
  onVerificationChange?: (
    documentIds: string[],
    status: Exclude<DocumentVerificationStatus, 'unchecked'>,
    note?: string
  ) => void

  onViewDocument?: (document: KycDocument) => void
}

const DOCUMENT_LABELS: Record<string, string> = {
  passport_copy: 'Passport (Authorized Representative)',
  company_registration: 'Company Registration Certificate',
  incorporation_doc: 'Company Incorporation Document',
  export_license: 'Export License',
  trade_license: 'Trade License',
  bank_reference: 'Bank Reference Letter',
  analytical_reports: 'Analytical Report(s)',
  past_trade_records: 'Past Trade Records',
  availability_statement: 'Goods Availability Statement',
  representation_agreement: 'Representation Agreement'
}

const MULTI_FILE_TYPES = new Set(['analytical_reports', 'past_trade_records'])

function documentLabel(type: string) {
  return DOCUMENT_LABELS[type] ?? type.replace(/_/g, ' ')
}

function isMultiFileType(type: string) {
  return MULTI_FILE_TYPES.has(type)
}

function formatDate(value?: string | null) {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getInitialStatus(document: KycDocument): DocumentVerificationStatus {
  return document.verificationStatus ?? 'unchecked'
}

function StatusBadge({ status }: { status: DocumentVerificationStatus }) {
  if (status === 'verified') {
    return (
      <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Verified
      </Badge>
    )
  }

  if (status === 'faulty') {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3.5 w-3.5" />
        Faulty
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1">
      <ShieldCheck className="h-3.5 w-3.5" />
      Not Checked
    </Badge>
  )
}

function DocumentIcon() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
      <FileText className="h-5 w-5 text-primary" />
    </div>
  )
}

function DocumentActions({
  document,
  onView
}: {
  document: KycDocument
  onView?: (document: KycDocument) => void
}) {
  const handleView = () => {
    if (onView) {
      onView(document)
      return
    }

    if (document.url) {
      window.open(document.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!document.url && !onView}
        onClick={handleView}
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        View
      </Button>

      {document.url && (
        <Button type="button" variant="ghost" size="sm" asChild>
          <a href={document.url} target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
      )}
    </div>
  )
}

export default function KycDocumentsPanel({
  applicant,
  onVerificationChange,
  onViewDocument
}: KycDocumentsPanelProps) {
  const documents = useMemo<KycDocument[]>(
    () =>
      (applicant.documents ?? []).map((document) => ({
        ...document,
        fileName: document.fileName ?? document.name
      })),
    [applicant.documents]
  )

  const initialStatuses = useMemo(
    () => Object.fromEntries(documents.map((document) => [document.id, getInitialStatus(document)])),
    [documents]
  )

  const initialFaultNotes = useMemo(
    () =>
      Object.fromEntries(
        documents
          .filter((document) => document.verificationNote)
          .map((document) => [document.id, document.verificationNote ?? ''])
      ),
    [documents]
  )

  const [statuses, setStatuses] = useState<Record<string, DocumentVerificationStatus>>(
    initialStatuses
  )

  const [faultNotes, setFaultNotes] = useState<Record<string, string>>(initialFaultNotes)

  useEffect(() => {
    setStatuses(initialStatuses)
    setFaultNotes(initialFaultNotes)
  }, [initialFaultNotes, initialStatuses])

  const groupedDocuments = useMemo(() => {
    const groups = new Map<string, KycDocument[]>()

    for (const document of documents) {
      const existing = groups.get(document.type) ?? []
      existing.push(document)
      groups.set(document.type, existing)
    }

    return Array.from(groups.entries()).map(([type, items]) => ({
      type,
      items,
      multiFile: isMultiFileType(type)
    }))
  }, [documents])

  const verifiedCount = Object.values(statuses).filter((status) => status === 'verified').length

  const faultyCount = Object.values(statuses).filter((status) => status === 'faulty').length

  /*
   * For multi-file document types the specification treats the
   * analytical reports / past trade records as a group.
   *
   * Therefore the UI exposes one verification decision for the group.
   */
  const setGroupStatus = (
    documentIds: string[],
    status: Exclude<DocumentVerificationStatus, 'unchecked'>,
    note?: string
  ) => {
    setStatuses((current) => {
      const next = { ...current }

      for (const id of documentIds) {
        next[id] = status
      }

      return next
    })

    if (status === 'faulty' && note !== undefined) {
      setFaultNotes((current) => {
        const next = { ...current }

        for (const id of documentIds) {
          next[id] = note
        }

        return next
      })
    }

    onVerificationChange?.(documentIds, status, note)
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submitted Documents</CardTitle>

          <CardDescription>Documents submitted with this KYC application.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed">
            <FileText className="h-10 w-10 text-muted-foreground/40" />

            <p className="mt-3 font-medium">No documents available</p>

            <p className="mt-1 text-sm text-muted-foreground">
              No KYC documents have been uploaded for this applicant.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Submitted Documents</CardTitle>

            <CardDescription className="mt-1">
              Verify all submitted KYC documents before making the final application decision.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {documents.length} file{documents.length === 1 ? '' : 's'}
            </Badge>

            <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
              <Check className="h-3.5 w-3.5" />
              {verifiedCount} verified
            </Badge>

            {faultyCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <X className="h-3.5 w-3.5" />
                {faultyCount} faulty
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {groupedDocuments.map((group, index) => {
          const ids = group.items.map((document) => document.id)

          const groupStatuses = ids.map((id) => statuses[id] ?? 'unchecked')

          const groupStatus: DocumentVerificationStatus =
            groupStatuses.length > 0 && groupStatuses.every((status) => status === 'verified')
            ? 'verified'
            : groupStatuses.some((status) => status === 'faulty')
              ? 'faulty'
              : 'unchecked'

          const existingFaultNote =
            group.items.map((document) => faultNotes[document.id]).find(Boolean) ?? ''

          return (
            <div key={group.type}>
              {index > 0 && <Separator className="mb-5" />}

              <div className="rounded-xl border">
                {/* Document group header */}
                <div className="flex flex-col gap-4 border-b bg-muted/30 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck2 className="h-5 w-5 text-primary" />

                    <div>
                      <h3 className="font-semibold">{documentLabel(group.type)}</h3>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {group.multiFile
                          ? `${group.items.length} submitted files · verified as a group`
                          : 'Required KYC document'}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={groupStatus} />
                </div>

                {/* Files */}
                <div className="divide-y">
                  {group.items.map((document) => {
                    const status = statuses[document.id] ?? 'unchecked'

                    return (
                      <div key={document.id} className="p-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                          <div className="flex min-w-0 items-start gap-3">
                            <DocumentIcon />

                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {document.fileName || document.name}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span>{document.name}</span>

                                {formatDate(document.uploadedAt) && (
                                  <>
                                    <span>•</span>
                                    <span>Uploaded {formatDate(document.uploadedAt)}</span>
                                  </>
                                )}
                              </div>

                              <div className="mt-2">
                                <StatusBadge status={status} />
                              </div>
                            </div>
                          </div>

                          <DocumentActions document={document} onView={onViewDocument} />
                        </div>

                        {status === 'faulty' && faultNotes[document.id] && (
                          <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

                              <div>
                                <p className="text-xs font-semibold text-destructive">
                                  Verification issue
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                  {faultNotes[document.id]}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Group verification controls */}
                <div className="border-t bg-muted/20 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-medium">Document verification</p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {group.multiFile
                          ? 'This document type is verified as one group.'
                          : 'Confirm whether the submitted document is acceptable.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={groupStatus === 'verified' ? 'default' : 'outline'}
                        onClick={() => setGroupStatus(ids, 'verified')}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Verify
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant={groupStatus === 'faulty' ? 'destructive' : 'outline'}
                        onClick={() => {
                          const note = window.prompt(
                            'Why is this document faulty?',
                            existingFaultNote
                          )

                          if (note === null) return

                          const trimmed = note.trim()

                          if (!trimmed) return

                          setGroupStatus(ids, 'faulty', trimmed)
                        }}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Mark Faulty
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Verification summary */}
        <div className="rounded-xl border bg-muted/20 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />

            <div>
              <p className="font-semibold">Verification Summary</p>

              <p className="mt-1 text-sm text-muted-foreground">
                {verifiedCount === documents.length
                  ? 'All submitted documents have been verified.'
                  : faultyCount > 0
                    ? `${faultyCount} document${faultyCount === 1 ? '' : 's'} require${faultyCount === 1 ? 's' : ''} correction before approval.`
                    : `${documents.length - verifiedCount} document${documents.length - verifiedCount === 1 ? '' : 's'} still require${documents.length - verifiedCount === 1 ? 's' : ''} verification.`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
