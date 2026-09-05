// src/renderer/src/modules/kyc/kyc.api.ts

import { api } from '../../lib/api'
import type { ApiSuccess } from '../../lib/types'

import type {
  KycAction,
  KycDashboard,
  KycDetails,
  KycEntity,
  KycFilters,
  KycQueueItem
} from './kyc.types'

export type {
  KycAction,
  KycDashboard,
  KycDetails,
  KycEntity,
  KycFilters,
  KycQueueItem,
  KycStatus
} from './kyc.types'

// ─────────────────────────────────────────────────────────────
// RESPONSE TYPES
// ─────────────────────────────────────────────────────────────

type KycResponse<T> = ApiSuccess<T>

// ─────────────────────────────────────────────────────────────
// QUERY BUILDER
// ─────────────────────────────────────────────────────────────

function buildQueueQuery(filters: KycFilters = {}) {
  const params = new URLSearchParams()

  if (filters.entity) {
    params.set('entity', filters.entity)
  }

  if (filters.status) {
    params.set('status', filters.status)
  }

  if (filters.country) {
    params.set('country', filters.country)
  }

  const query = params.toString()

  return query ? `?${query}` : ''
}

// ─────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────

export const kycApi = {
  /**
   * GET /kyc
   *
   * Returns the unified Buyer + Seller + Mandate KYC queue.
   */
  getQueue: (filters: KycFilters = {}) =>
    api.request<KycResponse<KycQueueItem[]>>('GET', `/kyc${buildQueueQuery(filters)}`),

  /**
   * GET /kyc/dashboard
   *
   * Returns pending and under-review counts.
   */
  getDashboard: () => api.request<KycResponse<KycDashboard>>('GET', '/kyc/dashboard'),

  /**
   * GET /kyc/:entity/:id
   *
   * Returns complete applicant details.
   */
  getById: (entity: KycEntity, id: string) =>
    api.request<KycResponse<KycDetails>>('GET', `/kyc/${entity}/${id}`),

  /**
   * PATCH /kyc/:entity/:id/review
   *
   * pending → under_review
   */
  moveToReview: (entity: KycEntity, id: string) =>
    api.request<KycResponse<KycDetails>>('PATCH', `/kyc/${entity}/${id}/review`, { _force: true }),

  /**
   * PATCH /kyc/:entity/:id/approve
   *
   * under_review → approved
   */
  approve: (entity: KycEntity, id: string) =>
    api.request<KycResponse<KycDetails>>('PATCH', `/kyc/${entity}/${id}/approve`, { _force: true }),

  /**
   * PATCH /kyc/:entity/:id/reject
   *
   * under_review → rejected
   */
  reject: (entity: KycEntity, id: string, reason: string) =>
    api.request<KycResponse<KycDetails>>('PATCH', `/kyc/${entity}/${id}/reject`, {
      reason: reason.trim()
    }),

  /**
   * PATCH /kyc/:entity/:id/documents/:documentId/verify
   *
   * Toggle document verification state
   */
  verifyDocument: (entity: KycEntity, id: string, documentId: string, verified: boolean) =>
    api.request<KycResponse<KycDetails>>('PATCH', `/kyc/${entity}/${id}/documents/${documentId}/verify`, {
      verified
    })
}

// ─────────────────────────────────────────────────────────────
// ACTION DISPATCHER
// ─────────────────────────────────────────────────────────────

export async function executeKycAction(
  action: KycAction,
  entity: KycEntity,
  id: string,
  rejectionReason?: string
) {
  switch (action) {
    case 'review':
      return kycApi.moveToReview(entity, id)

    case 'approve':
      return kycApi.approve(entity, id)

    case 'reject':
      if (!rejectionReason?.trim()) {
        throw new Error('Rejection reason is required.')
      }

      return kycApi.reject(entity, id, rejectionReason)
  }
}
