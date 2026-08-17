import { api } from '../../lib/api'
import type { ApiSuccess, ApiSuccessList } from '../../lib/types'

// ─────────────────────────────────────────────────────────────────────────────
// Mandate types
// ─────────────────────────────────────────────────────────────────────────────

export type MandateRepresents = 'buyer_side' | 'seller_side'

export type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected'

export type CommissionStatus = 'pending' | 'processing' | 'paid' | 'cancelled'

// ─────────────────────────────────────────────────────────────────────────────
// Mandate
// ─────────────────────────────────────────────────────────────────────────────

export interface Mandate {
  id: string

  // Identification
  mandateCode: string

  // Company
  companyName: string
  country: string
  businessRegistrationNo: string | null

  // Contact
  contactPerson: string
  email: string | null
  phone: string | null
  whatsapp: string | null

  // Mandate
  represents: MandateRepresents
  description: string | null

  // Access / KYC
  hasExchangeAccess: boolean
  kycStatus: KycStatus
  kycSubmittedAt: string | null
  kycReviewedAt: string | null
  kycReviewedByName: string | null
  rejectionReason: string | null

  // System
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  createdByName: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Mandate detail
// Internal notes are intentionally present ONLY in the detail response.
// They must never be exposed to mandate-facing exchange APIs.
// ─────────────────────────────────────────────────────────────────────────────

export interface MandateDetail extends Mandate {
  notes: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Create / update body
// ─────────────────────────────────────────────────────────────────────────────

export interface MandateCreateBody {
  companyName: string
  country: string
  contactPerson: string
  represents: MandateRepresents

  email?: string
  phone?: string
  whatsapp?: string

  businessRegistrationNo?: string

  description?: string

  // Internal only
  notes?: string
}

export type MandateUpdateBody = Partial<MandateCreateBody>

// ─────────────────────────────────────────────────────────────────────────────
// Filters
// ─────────────────────────────────────────────────────────────────────────────

export interface MandateFilters {
  search?: string
  represents?: MandateRepresents | ''
  kycStatus?: KycStatus | ''
  page?: number
  pageSize?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// KYC documents
// ─────────────────────────────────────────────────────────────────────────────

export interface MandateDocument {
  id: string
  documentType: string
  fileName: string
  fileStorageKey?: string
  downloadUrl?: string
  uploadedAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Commodity requests
//
// The exact request shape can evolve with the commodity-request module.
// Keep this interface focused on fields useful from the mandate detail view.
// ─────────────────────────────────────────────────────────────────────────────

export interface MandateRequest {
  id: string
  requestCode?: string

  categoryName?: string
  productTypeName?: string

  quantity: number
  quantityUnit: string

  targetPriceMin?: number | null
  targetPriceMax?: number | null
  currency: string

  deliveryCountry?: string | null
  deliveryTerms?: string | null
  requiredByDate?: string | null

  purityRequired?: string | null
  gradeRequired?: string | null

  buyerId?: string | null
  buyerCompanyName?: string | null
  buyerCountry?: string | null

  status: string

  createdAt: string
  updatedAt?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Mandate deals
// Internal detail response may contain more fields than this.
// Exchange-facing mandate deal responses MUST NOT expose opposite-party data.
// ─────────────────────────────────────────────────────────────────────────────

export interface MandateDeal {
  id: string

  inquiryCode: string
  productType: string

  quantity: number
  quantityUnit: string
  currency: string

  status: string
  requiredByDate: string | null

  ownPartyName: string

  createdAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Mandate commissions
// ─────────────────────────────────────────────────────────────────────────────

export interface MandateCommission {
  id: string

  commissionCode: string
  inquiryCode: string
  productType: string

  represents: MandateRepresents

  amount: number
  currency: string

  status: CommissionStatus

  dueDate: string | null

  paymentDate: string | null
  paymentReference: string | null

  createdAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────

export const mandatesApi = {
  /**
   * GET /api/mandates
   *
   * Internal mandate directory.
   *
   * Supported filters:
   *   search
   *   represents
   *   kycStatus
   *   page
   *   pageSize
   */
  getAll: (filters: MandateFilters = {}) =>
    api.request<ApiSuccessList<Mandate>>(
      'GET',
      `/mandates?${api.qs(filters as Record<string, string>)}`
    ),

  /**
   * GET /api/mandates/:id
   *
   * Returns the complete internal mandate detail.
   * This response may contain internal notes.
   */
  getById: (id: string) => api.request<ApiSuccess<MandateDetail>>('GET', `/mandates/${id}`),

  /**
   * POST /api/mandates
   *
   * Internal staff can manually create a mandate.
   *
   * Server rules:
   *   kyc_status = approved
   *   is_active = true
   *   password_hash = null
   *
   * Exchange access is therefore NOT automatically granted.
   */
  create: (data: MandateCreateBody) => api.request<ApiSuccess<Mandate>>('POST', '/mandates', data),

  /**
   * PUT /api/mandates/:id
   */
  update: (id: string, data: MandateUpdateBody) =>
    api.request<ApiSuccess<Mandate>>('PUT', `/mandates/${id}`, data),

  /**
   * DELETE /api/mandates/:id
   *
   * Soft delete only.
   */
  remove: (id: string) => api.request<{ success: boolean }>('DELETE', `/mandates/${id}`),

  /**
   * PUT /api/mandates/:id/set-password
   *
   * Admin only.
   *
   * Setting a password grants the mandate Exchange access.
   */
  setPassword: (id: string, password: string) =>
    api.request<{ success: boolean }>('PUT', `/mandates/${id}/set-password`, { password }),

  /**
   * GET /api/mandates/:id/documents
   *
   * KYC documents associated with this mandate.
   */
  getDocuments: (id: string) =>
    api.request<ApiSuccess<MandateDocument[]>>('GET', `/mandates/${id}/documents`),

  /**
   * GET /api/mandates/:id/requests
   *
   * Commodity requests submitted by this mandate.
   */
  getRequests: (id: string) =>
    api.request<ApiSuccessList<MandateRequest>>('GET', `/mandates/${id}/requests`),

  /**
   * GET /api/mandates/:id/deals
   *
   * Inquiries/deals where this mandate is attached on either side.
   */
  getDeals: (id: string) =>
    api.request<ApiSuccessList<MandateDeal>>('GET', `/mandates/${id}/deals`),

  /**
   * GET /api/mandates/:id/commissions
   *
   * Commission records belonging to this mandate.
   */
  getCommissions: (id: string) =>
    api.request<ApiSuccessList<MandateCommission>>('GET', `/mandates/${id}/commissions`)
}
