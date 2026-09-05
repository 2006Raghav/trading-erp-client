// -----------------------------------------------------------------------------
// Registration Types
// Shared request / response contracts for public company registration.
// -----------------------------------------------------------------------------

import type { KycStatus } from '../../lib/types'

// Re-export for consumers that import from here
export type { KycStatus }

// -----------------------------------------------------------------------------
// Registration
// -----------------------------------------------------------------------------

export type RegistrationEntityType = 'buyer' | 'seller' | 'mandate'

export type RegistrationType = RegistrationEntityType

export interface BuyerRegistrationRequest {
  companyName: string
  companyRegistrationNo: string
  tradeLicenseNo: string
  exportLicenseNo: string
  businessType?: string
  annualPurchaseCapacity?: number

  contactPerson: string
  email: string
  phone: string
  whatsapp?: string
  country: string

  password: string
  confirmPassword: string
}

export interface SellerRegistrationRequest {
  companyName: string
  companyRegistrationNo: string
  tradeLicenseNo: string
  exportLicenseNo: string

  contactPerson: string
  email: string
  phone: string
  whatsapp?: string
  country: string

  factoryAddress: string
  warehouseAddress?: string
  monthlyProductionCapacity: number

  bankName: string
  bankAccountNo: string
  bankSwiftCode: string
  bankIban?: string
  bankCountry: string

  password: string
  confirmPassword: string
}

export interface MandateRegistrationRequest {
  companyName: string
  country: string
  companyRegistrationNo?: string
  tradeLicenseNo?: string
  exportLicenseNo?: string

  contactPerson: string
  email: string
  phone: string
  whatsapp?: string

  represents: 'buyer_side' | 'seller_side'
  description?: string

  password: string
  confirmPassword: string
}

// -----------------------------------------------------------------------------
// Registration Response
// -----------------------------------------------------------------------------

export interface RegistrationResponse {
  success: boolean
  message: string

  data?: {
    id: string
    code: string
    entityType: RegistrationEntityType
    kycStatus: KycStatus
  }

  error?: string
}

// -----------------------------------------------------------------------------
// Registration Documents
// -----------------------------------------------------------------------------

export type RegistrationDocumentType =
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

export interface RegistrationDocument {
  id: string
  documentType: RegistrationDocumentType
  fileName: string
  fileUrl?: string | null
  storageKey?: string
  uploadedAt?: string
  verified?: boolean
}

export interface PendingDocument {
  id: string
  documentType: RegistrationDocumentType
  file: File
}

export interface RegistrationDocumentsResponse {
  success: boolean
  data?: RegistrationDocument[]
  error?: string
}

// -----------------------------------------------------------------------------
// Registration Status
// -----------------------------------------------------------------------------

export interface RegistrationStatusResponse {
  success: boolean
  data?: {
    kycStatus: KycStatus
    rejectionReason: string | null
  }
  error?: string
}

// -----------------------------------------------------------------------------
// Final KYC Submission
// -----------------------------------------------------------------------------

export interface RegistrationSubmitResponse {
  success: boolean
  resubmission?: boolean
  missingDocuments?: string[]

  data?: {
    entityType: RegistrationEntityType
    entityId: string
  }

  error?: string
}
