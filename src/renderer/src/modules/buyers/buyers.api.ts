import { api } from '../../lib/api'
import type { Buyer, ApiSuccess, ApiSuccessList, ProductCategory } from '../../lib/types'

// ── Filter shape sent as query params to GET /api/buyers ──────────────────────
export interface BuyerFilters {
  search?: string
  creditRating?: string
  page?: number
  pageSize?: number
}

// ── Input shape sent in POST /api/buyers body ─────────────────────────────────
export interface BuyerInput {
  companyName: string
  contactPerson?: string
  country?: string
  email?: string
  phone?: string
  whatsapp?: string
  website?: string
  businessRegistrationNo?: string
  taxNumber?: string
  annualPurchaseCapacity?: number | string
  capacityUnit?: string
  creditRating?: string
  notes?: string
  interestIds: string[]
}

export const buyersApi = {
  /** GET /api/buyers?search=...&page=... */
  getAll: (filters: BuyerFilters = {}) =>
    api.request<ApiSuccessList<Buyer>>(
      'GET',
      `/buyers?${api.qs(filters as Record<string, string>)}`
    ),

  /** GET /api/buyers/:id */
  getById: (id: string) => api.request<ApiSuccess<Buyer>>('GET', `/buyers/${id}`),

  /** GET /api/buyers/:id/history */
  getHistory: (id: string) => api.request<ApiSuccess<unknown[]>>('GET', `/buyers/${id}/history`),

  /** POST /api/buyers */
  create: (data: BuyerInput) => api.request<ApiSuccess<Buyer>>('POST', '/buyers', data),

  /** PUT /api/buyers/:id */
  update: (id: string, data: BuyerInput) =>
    api.request<ApiSuccess<Buyer>>('PUT', `/buyers/${id}`, data),

  /** DELETE /api/buyers/:id (soft delete) */
  remove: (id: string) => api.request<{ success: boolean }>('DELETE', `/buyers/${id}`)
}
