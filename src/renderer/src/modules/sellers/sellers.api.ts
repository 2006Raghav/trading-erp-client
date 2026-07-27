// src/renderer/src/modules/sellers/sellers.api.ts
import { api } from '../../lib/api'
import type { Seller, ApiSuccess, ApiSuccessList } from '../../lib/types'

export interface SellerFilters {
  search?: string
  page?: number
  pageSize?: number
}

export interface SellerInput {
  companyName: string
  country?: string
  contactPerson?: string
  email?: string
  phone?: string
  password?: string
  factoryAddress?: string
  warehouseAddress?: string
  monthlyProductionCapacity?: number | string
  capacityUnit?: string
  certifications: string[]
  exportLicenses: string[]
  bankName?: string
  bankAccountNo?: string
  bankSwiftCode?: string
  bankIban?: string
  bankCountry?: string
  notes?: string
}

export const sellersApi = {
  getAll: (filters: SellerFilters = {}) =>
    api.request<ApiSuccessList<Seller>>(
      'GET',
      `/sellers?${api.qs(filters as Record<string, unknown>)}`
    ),

  getById: (id: string) => api.request<ApiSuccess<Seller>>('GET', `/sellers/${id}`),

  getHistory: (id: string) => api.request<ApiSuccess<unknown[]>>('GET', `/sellers/${id}/history`),

  create: (data: SellerInput) => api.request<ApiSuccess<Seller>>('POST', '/sellers', data),

  update: (id: string, data: SellerInput) =>
    api.request<ApiSuccess<Seller>>('PUT', `/sellers/${id}`, data),

  remove: (id: string) => api.request<{ success: boolean }>('DELETE', `/sellers/${id}`)
}
