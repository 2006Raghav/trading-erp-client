// src/renderer/src/modules/kyc/kyc.api.ts

import { api } from '../../lib/api'
import type { ApiSuccess } from '../../lib/types'

export type KycEntity = 'buyer' | 'seller'

export type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected'

export interface KycFilters {
  entity?: KycEntity
  status?: KycStatus
}

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

  rejectionReason: string | null

  isActive: boolean
}

export interface KycDashboard {
  pending: number
  underReview: number
}

export interface KycDetails extends KycQueueItem {
  createdAt: string
  updatedAt: string

  kycReviewedBy: string | null
  documents?: { id: string; name: string; type: string; url?: string }[]
}

export const kycApi = {
  /**
   * GET /api/kyc
   */
  getQueue: (filters: KycFilters = {}) =>
    api.request<ApiSuccess<KycQueueItem[]>>(
      'GET',
      `/kyc?${api.qs(filters as Record<string, string>)}`
    ),

  /**
   * GET /api/kyc/dashboard
   */
  getDashboard: () => api.request<ApiSuccess<KycDashboard>>('GET', '/kyc/dashboard'),

  /**
   * GET /api/kyc/:entity/:id
   */
  getById: (entity: KycEntity, id: string) =>
    api.request<ApiSuccess<KycDetails>>('GET', `/kyc/${entity}/${id}`),

  /**
   * PATCH /api/kyc/:entity/:id/review
   */
  moveToReview: (entity: KycEntity, id: string) =>
    // Passing a dummy key forces the frontend api wrapper to stringify the body
    api.request<ApiSuccess<KycDetails>>('PATCH', `/kyc/${entity}/${id}/review`, { _force: true }),

  /**
   * PATCH /api/kyc/:entity/:id/approve
   */
  approve: (entity: KycEntity, id: string) =>
    // Passing a dummy key forces the frontend api wrapper to stringify the body
    api.request<ApiSuccess<KycDetails>>('PATCH', `/kyc/${entity}/${id}/approve`, { _force: true }),

  /**
   * PATCH /api/kyc/:entity/:id/reject
   */
  reject: (entity: KycEntity, id: string, reason: string) =>
    api.request<ApiSuccess<KycDetails>>('PATCH', `/kyc/${entity}/${id}/reject`, { reason })
}
