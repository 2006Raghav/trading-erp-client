import { api } from '../../lib/apiClient'
import type { Buyer, ApiSuccess, ApiSuccessList } from '../../lib/types'

// ── Filter shape — sent as query string to GET /api/buyers ────────────────────
export interface BuyerFilters {
  search?: string
  creditRating?: string
  page?: number
  pageSize?: number
}

// ── Input shape — sent as JSON body to POST/PUT /api/buyers ──────────────────
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

// ── API call functions ────────────────────────────────────────────────────────
// Each function maps 1:1 to a server route.
// Return types match the { success, data } / { success, data, meta } shape
// the Fastify server always returns.

export const buyersApi = {
  /** GET /api/buyers?search=...&page=... */
  getAll: (filters: BuyerFilters = {}) =>
    api.request<ApiSuccessList<Buyer>>('GET', `/api/buyers?${api.qs(filters as Record<string, unknown>)}`),

  /** GET /api/buyers/:id */
  getById: (id: string) => api.request<ApiSuccess<Buyer>>('GET', `/api/buyers/${id}`),

  /** GET /api/buyers/:id/history — returns activity log entries for this buyer */
  getHistory: (id: string) =>
    api.request<ApiSuccess<unknown[]>>('GET', `/api/buyers/${id}/history`),

  /** POST /api/buyers */
  create: (data: BuyerInput) => api.request<ApiSuccess<Buyer>>('POST', '/api/buyers', data),

  /** PUT /api/buyers/:id */
  update: (id: string, data: BuyerInput) =>
    api.request<ApiSuccess<Buyer>>('PUT', `/api/buyers/${id}`, data),

  /** DELETE /api/buyers/:id (soft delete on server) */
  remove: (id: string) => api.request<{ success: boolean }>('DELETE', `/api/buyers/${id}`)
}
