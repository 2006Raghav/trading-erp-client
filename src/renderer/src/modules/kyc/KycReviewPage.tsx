// src/renderer/src/modules/kyc/KycReviewPage.tsx

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  CheckSquare2,
  Clock3,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Mail,
  Phone,
  RefreshCcw,
  ShieldCheck,
  User,
  XCircle,
  AlertCircle,
  Ban,
  Circle
} from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Skeleton } from '../../components/ui/skeleton'
import { KycStatusBadge } from '../../components/ui/StatusBadge'
import { useToast } from '../auth/ToastContext'

import { kycApi } from './kyc.api'
import type { KycDetails, KycDocument, KycEntity } from './kyc.types'

import { useKycActions } from './useKycActions'
import { RejectionModal } from './rejectionModal'

type DocumentVerificationState = Record<string, boolean>

const REQUIRED_DOCUMENT_TYPES = [
  'passport_copy',
  'company_registration',
  'incorporation_doc',
  'export_license',
  'trade_license',
  'bank_reference'
]

const SELLER_DOCUMENT_TYPES = ['analytical_reports', 'past_trade_records', 'availability_statement']

const MANDATE_DOCUMENT_TYPES = ['representation_agreement']

function documentLabel(type: string) {
  const labels: Record<string, string> = {
    passport_copy: 'Passport of Authorized Representative',
    company_registration: 'Company Registration Certificate',
    incorporation_doc: 'Company Incorporation Document',
    export_license: 'Export License',
    trade_license: 'Trade License',
    bank_reference: 'Bank Details / Bank Reference Letter',
    analytical_reports: 'Analytical Reports',
    past_trade_records: 'Past Trade Records',
    availability_statement: 'Goods Availability Statement',
    representation_agreement: 'Representation Agreement'
  }

  return labels[type] ?? type.replace(/_/g, ' ')
}

function formatDate(value?: string | null) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'

  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getDaysWaiting(submittedAt?: string | null) {
  if (!submittedAt) return null

  const submitted = new Date(submittedAt).getTime()
  const now = Date.now()

  if (Number.isNaN(submitted)) return null

  return Math.max(0, Math.floor((now - submitted) / (1000 * 60 * 60 * 24)))
}

function getDocumentType(document: KycDocument) {
  return document.type?.trim() || ''
}

export default function KycReviewPage() {
  const navigate = useNavigate()
  const { entity, id } = useParams<{
    entity: KycEntity
    id: string
  }>()

  const toast = useToast()

  const [application, setApplication] = useState<KycDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [activeTab, setActiveTab] = useState('documents')

  /**
   * UI-only verification state.
   *
   * This intentionally does not pretend that document verification
   * is persisted by the current API contract.
   */
  const [verifiedDocuments, setVerifiedDocuments] = useState<DocumentVerificationState>({})

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)

  const fetchApplication = useCallback(async () => {
    if (!entity || !id) return

    setIsFetching(true)

    try {
      const response = await kycApi.getById(entity, id)

      if (!response.success) {
        toast.error('Failed to load KYC application')
        return
      }

      setApplication(response.data)

      const nextVerifiedState: DocumentVerificationState = {}
      response.data.documents.forEach((doc) => {
        if (doc.verificationStatus === 'verified') {
          nextVerifiedState[doc.id] = true
        }
      })
      setVerifiedDocuments(nextVerifiedState)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load KYC application')
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }, [entity, id])

  useEffect(() => {
    fetchApplication()
  }, [fetchApplication])

  const { handleKycAction, isActionLoading } = useKycActions(fetchApplication)

  const documents = useMemo<KycDocument[]>(() => {
    return application?.documents ?? []
  }, [application])

  const applicantDocumentTypes = useMemo(() => {
    return new Set(documents.map((document) => getDocumentType(document)))
  }, [documents])

  const requiredDocuments = useMemo(() => {
    const base = [...REQUIRED_DOCUMENT_TYPES]

    if (application?.entity === 'seller') {
      base.push(...SELLER_DOCUMENT_TYPES)
    }

    if (application?.entity === 'mandate') {
      base.push(...MANDATE_DOCUMENT_TYPES)
    }

    return base
  }, [application?.entity])

  const missingDocuments = useMemo(() => {
    return requiredDocuments.filter((type) => !applicantDocumentTypes.has(type))
  }, [requiredDocuments, applicantDocumentTypes])

  const verificationGroups = useMemo(() => {
    const byType: Record<string, KycDocument[]> = {}
    documents.forEach((doc) => {
      let type = getDocumentType(doc)
      if (type === 'analytical_report') type = 'analytical_reports'
      if (!byType[type]) byType[type] = []
      byType[type].push(doc)
    })

    const singleDocuments: KycDocument[] = []
    const documentGroups: { type: string; documents: KycDocument[] }[] = []

    for (const [type, docs] of Object.entries(byType)) {
      if (docs.length === 1) {
        singleDocuments.push(docs[0])
      } else if (docs.length > 1) {
        documentGroups.push({ type, documents: docs })
      }
    }

    return {
      singleDocuments,
      documentGroups
    }
  }, [documents])

  const verifiedDocumentCount = useMemo(() => {
    return Object.values(verifiedDocuments).filter(Boolean).length
  }, [verifiedDocuments])

  const totalDocumentsForVerification = documents.length

  const allUploadedDocumentsVerified = useMemo(() => {
    if (documents.length === 0) return false

    return documents.every((document) => verifiedDocuments[document.id] === true)
  }, [documents, verifiedDocuments])

  const canApprove =
    application?.kycStatus === 'under_review' &&
    missingDocuments.length === 0 &&
    allUploadedDocumentsVerified

  const daysWaiting = getDaysWaiting(application?.kycSubmittedAt)

  const initials = useMemo(() => {
    if (!application?.companyName) return '--'

    return application.companyName
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
  }, [application?.companyName])

  const toggleDocumentVerification = async (documentId: string) => {
    const isCurrentlyVerified = !!verifiedDocuments[documentId]
    const nextState = !isCurrentlyVerified

    setVerifiedDocuments((current) => ({
      ...current,
      [documentId]: nextState
    }))

    if (entity && id) {
      try {
        await kycApi.verifyDocument(entity, id, documentId, nextState)
      } catch {
        toast.error('Failed to save document verification')
        setVerifiedDocuments((current) => ({
          ...current,
          [documentId]: isCurrentlyVerified
        }))
      }
    }
  }

  const verifyAllDocuments = async () => {
    if (!entity || !id) return

    const unverifiedDocs = documents.filter(doc => !verifiedDocuments[doc.id])
    if (unverifiedDocs.length === 0) return

    const nextState: DocumentVerificationState = { ...verifiedDocuments }
    unverifiedDocs.forEach((doc) => {
      nextState[doc.id] = true
    })
    setVerifiedDocuments(nextState)

    try {
      await Promise.all(unverifiedDocs.map(doc => kycApi.verifyDocument(entity, id, doc.id, true)))
    } catch {
      toast.error('Failed to save some document verifications')
      fetchApplication()
    }
  }

  const clearVerification = async () => {
    if (!entity || !id) return

    const verifiedDocs = documents.filter(doc => verifiedDocuments[doc.id])
    if (verifiedDocs.length === 0) return

    setVerifiedDocuments({})

    try {
      await Promise.all(verifiedDocs.map(doc => kycApi.verifyDocument(entity, id, doc.id, false)))
    } catch {
      toast.error('Failed to clear some document verifications')
      fetchApplication()
    }
  }

  const handleApprove = async () => {
    if (!entity || !id) {
      toast.error('Invalid KYC application')
      return
    }

    if (missingDocuments.length > 0) {
      toast.error('Cannot approve: required KYC documents are missing.')
      setActiveTab('documents')
      return
    }

    if (!allUploadedDocumentsVerified) {
      toast.error('Verify every uploaded document before approving.')
      setActiveTab('documents')
      return
    }

    await handleKycAction(entity, id, 'approve')
  }

  const handleMoveToReview = async () => {
    if (!entity || !id) {
      toast.error('Invalid KYC application')
      return
    }

    await handleKycAction(entity, id, 'review')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (!application || !entity || !id) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />

        <div>
          <h2 className="text-lg font-semibold">KYC application not found</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            The requested application could not be loaded.
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate('/kyc')}>
          Back to KYC Queue
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* HEADER */}
      {/* ─────────────────────────────────────────────────────────── */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">KYC Review</h1>

              <KycStatusBadge status={application.kycStatus} />
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Verify the submitted application and documents before making a KYC decision.
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={fetchApplication} disabled={isFetching}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* APPLICANT SUMMARY */}
      {/* ─────────────────────────────────────────────────────────── */}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                {initials}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{application.companyName}</h2>

                  <Badge>
                    {application.entity === 'buyer'
                      ? 'Buyer'
                      : application.entity === 'seller'
                        ? 'Seller'
                        : 'Mandate'}
                  </Badge>

                  {application.entity === 'mandate' && application.represents && (
                    <Badge variant="secondary">
                      {application.represents === 'buyer_side' ? 'Buyer Side' : 'Seller Side'}
                    </Badge>
                  )}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">{application.code}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <SummaryValue label="Country" value={application.country || '—'} />

              <SummaryValue label="Submitted" value={formatDate(application.kycSubmittedAt)} />

              <SummaryValue
                label="Days Waiting"
                value={
                  daysWaiting === null ? '—' : `${daysWaiting} day${daysWaiting === 1 ? '' : 's'}`
                }
              />

              <SummaryValue
                label="Documents"
                value={`${verifiedDocumentCount}/${totalDocumentsForVerification}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* REJECTION NOTICE */}
      {/* ─────────────────────────────────────────────────────────── */}

      {application.kycStatus === 'rejected' && application.rejectionReason && (
        <Card className="border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)]">
          <CardContent className="flex gap-4 p-5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-danger)]" />

            <div>
              <p className="font-semibold">Previous Rejection Reason</p>

              <p className="mt-1 text-sm text-muted-foreground">{application.rejectionReason}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MAIN REVIEW AREA */}
      {/* ─────────────────────────────────────────────────────────── */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="documents">Documents</TabsTrigger>

              <TabsTrigger value="applicant">Applicant</TabsTrigger>

              <TabsTrigger value="history">Review History</TabsTrigger>
            </TabsList>

            {/* ─────────────────────────────────────────────── */}
            {/* DOCUMENTS */}
            {/* ─────────────────────────────────────────────── */}

            <TabsContent value="documents" className="mt-6 space-y-5">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>Document Verification</CardTitle>

                      <CardDescription>
                        Every submitted document must be checked before approval.
                      </CardDescription>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={verifyAllDocuments}
                        disabled={documents.length === 0}
                      >
                        <CheckSquare2 className="mr-2 h-4 w-4" />
                        Verify All
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearVerification}
                        disabled={verifiedDocumentCount === 0}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Missing documents */}
                  {missingDocuments.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />

                        <div>
                          <p className="font-medium text-amber-900">Missing required documents</p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {missingDocuments.map((type) => (
                              <Badge
                                key={type}
                                variant="outline"
                                className="border-amber-300 text-amber-800"
                              >
                                {documentLabel(type)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {documents.length === 0 ? (
                    <EmptyDocuments />
                  ) : (
                    <>
                      {verificationGroups.singleDocuments.map((document) => (
                        <DocumentVerificationRow
                          key={document.id}
                          document={document}
                          verified={verifiedDocuments[document.id] === true}
                          onVerify={() => toggleDocumentVerification(document.id)}
                        />
                      ))}

                      {verificationGroups.documentGroups.map((group) => {
                        const verified = group.documents.every(
                          (doc) => verifiedDocuments[doc.id] === true
                        )
                        return (
                          <DocumentGroup
                            key={group.type}
                            type={group.type}
                            documents={group.documents}
                            verified={verified}
                            verifiedDocuments={verifiedDocuments}
                            onVerify={(documentId) => toggleDocumentVerification(documentId)}
                            onVerifyGroup={async () => {
                              if (!entity || !id) return

                              const unverified = group.documents.filter(
                                (doc) => !verifiedDocuments[doc.id]
                              )
                              if (unverified.length === 0) return

                              setVerifiedDocuments((current) => {
                                const next = { ...current }
                                unverified.forEach((doc) => {
                                  next[doc.id] = true
                                })
                                return next
                              })

                              try {
                                await Promise.all(
                                  unverified.map((doc) =>
                                    kycApi.verifyDocument(entity, id, doc.id, true)
                                  )
                                )
                              } catch {
                                toast.error('Failed to save group verification')
                                fetchApplication()
                              }
                            }}
                          />
                        )
                      })}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─────────────────────────────────────────────── */}
            {/* APPLICANT */}
            {/* ─────────────────────────────────────────────── */}

            <TabsContent value="applicant" className="mt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>Information submitted during registration.</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <InfoRow label="Company" value={application.companyName} />

                    <Separator />

                    <InfoRow label="Code" value={application.code} />

                    <Separator />

                    <InfoRow label="Country" value={application.country} />

                    <Separator />

                    <InfoRow
                      label="Entity"
                      value={
                        application.entity === 'buyer'
                          ? 'Buyer'
                          : application.entity === 'seller'
                            ? 'Seller'
                            : 'Mandate'
                      }
                    />

                    {application.entity === 'mandate' && application.represents && (
                      <>
                        <Separator />

                        <InfoRow
                          label="Represents"
                          value={
                            application.represents === 'buyer_side' ? 'Buyer Side' : 'Seller Side'
                          }
                        />
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <ContactRow
                      icon={<User className="h-4 w-4" />}
                      label="Contact Person"
                      value={application.contactPerson}
                    />

                    <ContactRow
                      icon={<Mail className="h-4 w-4" />}
                      label="Email"
                      value={application.email}
                    />

                    <ContactRow
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone"
                      value={application.phone}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ─────────────────────────────────────────────── */}
            {/* HISTORY */}
            {/* ─────────────────────────────────────────────── */}

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review History</CardTitle>
                  <CardDescription>Current application timeline.</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    <TimelineItem
                      icon={<Clock3 className="h-4 w-4" />}
                      title="KYC Submitted"
                      description={formatDateTime(application.kycSubmittedAt)}
                    />

                    {application.kycReviewedAt && (
                      <TimelineItem
                        icon={<ShieldCheck className="h-4 w-4" />}
                        title="KYC Reviewed"
                        description={formatDateTime(application.kycReviewedAt)}
                      />
                    )}

                    {application.rejectionReason && (
                      <TimelineItem
                        icon={<XCircle className="h-4 w-4" />}
                        title="Application Rejected"
                        description={application.rejectionReason}
                        danger
                      />
                    )}

                    {!application.kycReviewedAt && !application.rejectionReason && (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Circle className="h-4 w-4" />
                        No review action has been recorded yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* ─────────────────────────────────────────────────────── */}
        {/* DECISION PANEL */}
        {/* ─────────────────────────────────────────────────────── */}

        <div className="space-y-5">
          <Card className="xl:sticky xl:top-6">
            <CardHeader>
              <CardTitle>Review Decision</CardTitle>

              <CardDescription>
                Complete document verification before approving this application.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Verification progress */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Verification Progress</span>

                  <span className="text-sm font-semibold">
                    {verifiedDocumentCount}/{totalDocumentsForVerification}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width:
                        totalDocumentsForVerification === 0
                          ? '0%'
                          : `${Math.min(
                              100,
                              (verifiedDocumentCount / totalDocumentsForVerification) * 100
                            )}%`
                    }}
                  />
                </div>
              </div>

              {/* Missing docs */}
              {missingDocuments.length > 0 && (
                <StatusMessage
                  icon={<AlertCircle className="h-4 w-4" />}
                  title="Missing documents"
                  description={`${missingDocuments.length} required document${
                    missingDocuments.length === 1 ? '' : 's'
                  } missing.`}
                  variant="warning"
                />
              )}

              {/* Verification incomplete */}
              {missingDocuments.length === 0 && !allUploadedDocumentsVerified && (
                <StatusMessage
                  icon={<FileText className="h-4 w-4" />}
                  title="Verification incomplete"
                  description="Every uploaded document must be checked."
                  variant="warning"
                />
              )}

              {/* Ready */}
              {canApprove && (
                <StatusMessage
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  title="Ready for approval"
                  description="All required documents have been verified."
                  variant="success"
                />
              )}

              <Separator />

              {application.kycStatus === 'pending' && (
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleMoveToReview}
                  disabled={isActionLoading}
                >
                  <Clock3 className="mr-2 h-4 w-4" />
                  Mark Under Review
                </Button>
              )}

              {application.kycStatus === 'under_review' && (
                <div className="space-y-3">
                  <Button
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                    onClick={handleApprove}
                    disabled={isActionLoading || !canApprove}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve Application
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isActionLoading}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject with Reason
                  </Button>
                </div>
              )}

              {application.kycStatus === 'approved' && (
                <StatusMessage
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Application approved"
                  description="This applicant has Exchange access."
                  variant="success"
                />
              )}

              {application.kycStatus === 'rejected' && (
                <StatusMessage
                  icon={<Ban className="h-4 w-4" />}
                  title="Application rejected"
                  description="The applicant must resubmit corrected documents."
                  variant="danger"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* REJECTION MODAL */}
      {/* ─────────────────────────────────────────────────────────── */}

      <RejectionModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        isSubmitting={isActionLoading}
        onConfirm={async (reason) => {
          if (!entity || !id) {
            toast.error('Invalid KYC application')
            return
          }

          const success = await handleKycAction(entity, id, 'reject', reason)

          if (success) {
            setIsRejectModalOpen(false)
          }
        }}
      />
    </div>
  )
}

/* ================================================================== */
/* COMPONENTS                                                         */
/* ================================================================== */

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>

      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span className="text-right text-sm font-medium">{value || '—'}</span>
    </div>
  )
}

function ContactRow({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>

        <p className="truncate text-sm font-medium">{value || '—'}</p>
      </div>
    </div>
  )
}

function TimelineItem({
  icon,
  title,
  description,
  danger = false
}: {
  icon: React.ReactNode
  title: string
  description: string
  danger?: boolean
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          danger ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-medium">{title}</p>

        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function StatusMessage({
  icon,
  title,
  description,
  variant
}: {
  icon: React.ReactNode
  title: string
  description: string
  variant: 'warning' | 'success' | 'danger'
}) {
  const styles = {
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    success: 'border-green-200 bg-green-50 text-green-900',
    danger: 'border-red-200 bg-red-50 text-red-900'
  }

  return (
    <div className={`rounded-lg border p-4 ${styles[variant]}`}>
      <div className="flex gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>

        <div>
          <p className="text-sm font-semibold">{title}</p>

          <p className="mt-1 text-xs opacity-80">{description}</p>
        </div>
      </div>
    </div>
  )
}

function EmptyDocuments() {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed text-center">
      <FileText className="h-10 w-10 text-muted-foreground/50" />

      <p className="mt-3 font-medium">No documents uploaded</p>

      <p className="mt-1 text-sm text-muted-foreground">
        This application cannot be approved without the required KYC documents.
      </p>
    </div>
  )
}

function DocumentVerificationRow({
  document,
  verified,
  onVerify
}: {
  document: KycDocument
  verified: boolean
  onVerify: () => void
}) {
  const type = getDocumentType(document)

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        verified ? 'border-green-200 bg-green-50/40' : 'bg-background'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
              verified ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
            }`}
          >
            {verified ? <FileCheck2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
          </div>

          <div className="min-w-0">
            <p className="font-medium">{documentLabel(type)}</p>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">{document.name}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {document.url && (
            <>
              <Button variant="outline" size="sm" asChild>
                <a href={document.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </a>
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <a href={document.url} target="_blank" rel="noreferrer" download>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </>
          )}

          <Button variant={verified ? 'default' : 'outline'} size="sm" onClick={onVerify}>
            {verified ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verified
              </>
            ) : (
              <>
                <CheckSquare2 className="mr-2 h-4 w-4" />
                Verify
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DocumentGroup({
  type,
  documents,
  verified,
  verifiedDocuments,
  onVerify,
  onVerifyGroup
}: {
  type: string
  documents: KycDocument[]
  verified: boolean
  verifiedDocuments: DocumentVerificationState
  onVerify: (documentId: string) => void
  onVerifyGroup: () => void
}) {
  return (
    <div className={`rounded-xl border p-5 ${verified ? 'border-green-200 bg-green-50/40' : ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" />

            <h3 className="font-semibold">{documentLabel(type)}</h3>

            <Badge variant="secondary">
              {documents.length} {documents.length === 1 ? 'file' : 'files'}
            </Badge>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            These documents are verified as one document group.
          </p>
        </div>

        <Button variant={verified ? 'default' : 'outline'} size="sm" onClick={onVerifyGroup}>
          {verified ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Group Verified
            </>
          ) : (
            <>
              <CheckSquare2 className="mr-2 h-4 w-4" />
              Verify Group
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {documents.map((document) => (
          <div
            key={document.id}
            className="flex flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              {verifiedDocuments[document.id] ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}

              <span className="truncate text-sm">{document.name}</span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {document.url && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={document.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View
                  </a>
                </Button>
              )}

              <Button
                variant={verifiedDocuments[document.id] ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onVerify(document.id)}
              >
                {verifiedDocuments[document.id] ? 'Verified' : 'Check'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
