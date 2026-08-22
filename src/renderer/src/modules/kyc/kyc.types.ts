// src/renderer/src/modules/kyc/kyc.types.ts

// ─────────────────────────────────────────────────────────────
// ENTITY
// ─────────────────────────────────────────────────────────────

export type KycEntity = 'buyer' | 'seller' | 'mandate'

export type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected'

export type MandateRepresentation = 'buyer_side' | 'seller_side'

export type KycDocumentVerificationStatus = 'unchecked' | 'verified' | 'faulty'

// ─────────────────────────────────────────────────────────────
// DOCUMENT TYPES
// ─────────────────────────────────────────────────────────────

export type KycDocumentType =
  | 'passport_copy'
  | 'company_registration'
  | 'incorporation_doc'
  | 'export_license'
  | 'trade_license'
  | 'bank_reference'
  | 'analytical_reports'
  | 'past_trade_records'
  | 'availability_statement'
  | 'representation_agreement'

export interface KycDocument {
  id: string
  name: string
  type: KycDocumentType | string
  url?: string | null
  fileName?: string | null
  uploadedAt?: string | null
  verificationStatus?: KycDocumentVerificationStatus
  verificationNote?: string | null
}

// ─────────────────────────────────────────────────────────────
// DOCUMENT GROUP
// ─────────────────────────────────────────────────────────────

export interface KycDocumentGroup {
  type: KycDocumentType | string

  label: string

  required: boolean

  /**
   * Some document requirements accept multiple files.
   *
   * analytical_reports
   * past_trade_records
   */
  multiple: boolean

  documents: KycDocument[]

  /**
   * Group-level verification is important for multi-file
   * document categories such as analytical reports.
   */
  verificationStatus: KycDocumentVerificationStatus

  verificationNote?: string | null
}

// ─────────────────────────────────────────────────────────────
// QUEUE
// ─────────────────────────────────────────────────────────────

export interface KycQueueItem {
  id: string

  entity: KycEntity

  code: string

  companyName: string

  contactPerson: string | null

  email: string | null

  phone: string | null

  country: string | null

  kycStatus: KycStatus

  kycSubmittedAt: string | null

  kycReviewedAt: string | null

  kycReviewedBy: string | null

  rejectionReason: string | null

  isActive: boolean

  createdAt: string

  updatedAt: string

  /**
   * Only populated for mandate applicants.
   */
  represents: MandateRepresentation | null

  /**
   * Convenience value for UI.
   * Calculated from kycSubmittedAt rather than stored in DB.
   */
  daysWaiting?: number
}

// ─────────────────────────────────────────────────────────────
// DETAILS
// ─────────────────────────────────────────────────────────────

export interface KycDetails extends KycQueueItem {
  documents: KycDocument[]

  /**
   * Optional grouped representation used by KycDocumentsPanel.
   */
  documentGroups?: KycDocumentGroup[]
}

// ─────────────────────────────────────────────────────────────
// FILTERS
// ─────────────────────────────────────────────────────────────

export interface KycFilters {
  entity?: KycEntity
  status?: KycStatus
  country?: string
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────

export interface KycDashboard {
  pending: number
  underReview: number
}

// ─────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────

export type KycAction = 'review' | 'approve' | 'reject'

// ─────────────────────────────────────────────────────────────
// API RESPONSE HELPERS
// ─────────────────────────────────────────────────────────────

export interface KycApiSuccess<T> {
  success: true
  data: T
}

export interface KycApiError {
  success: false
  error: string
}

export type KycApiResponse<T> = KycApiSuccess<T> | KycApiError

// ─────────────────────────────────────────────────────────────
// DOCUMENT LABELS
// ─────────────────────────────────────────────────────────────

export const KYC_DOCUMENT_LABELS: Record<string, string> = {
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

// ─────────────────────────────────────────────────────────────
// REQUIRED DOCUMENTS
// ─────────────────────────────────────────────────────────────

export const REQUIRED_KYC_DOCUMENTS: Record<KycEntity, readonly KycDocumentType[]> = {
  buyer: [
    'passport_copy',
    'company_registration',
    'incorporation_doc',
    'export_license',
    'trade_license',
    'bank_reference'
  ],

  seller: [
    'passport_copy',
    'company_registration',
    'incorporation_doc',
    'export_license',
    'trade_license',
    'bank_reference',
    'analytical_reports',
    'past_trade_records',
    'availability_statement'
  ],

  mandate: [
    'passport_copy',
    'company_registration',
    'incorporation_doc',
    'export_license',
    'trade_license',
    'bank_reference',
    'representation_agreement'
  ]
}

// ─────────────────────────────────────────────────────────────
// MULTI-FILE DOCUMENT TYPES
// ─────────────────────────────────────────────────────────────

export const MULTI_FILE_KYC_DOCUMENT_TYPES: readonly KycDocumentType[] = [
  'analytical_reports',
  'past_trade_records'
]

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

export function isMandateEntity(entity: KycEntity): entity is 'mandate' {
  return entity === 'mandate'
}

export function isMultiFileDocumentType(documentType: string): boolean {
  return MULTI_FILE_KYC_DOCUMENT_TYPES.includes(documentType as KycDocumentType)
}

export function getKycDocumentLabel(documentType: string): string {
  return (
    KYC_DOCUMENT_LABELS[documentType] ??
    documentType.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  )
}

export function getDaysWaiting(submittedAt: string | null): number {
  if (!submittedAt) return 0

  const submitted = new Date(submittedAt).getTime()

  if (Number.isNaN(submitted)) return 0

  const difference = Date.now() - submitted

  return Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24)))
}
