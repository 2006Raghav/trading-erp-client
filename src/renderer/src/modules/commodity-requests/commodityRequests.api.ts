// src/renderer/src/modules/commodity-requests/commodityRequests.api.ts

import { api } from '../../lib/api'
import type { ApiSuccess, ApiSuccessList } from '../../lib/types'

export type CommodityRequestStatus =
  'open' | 'assigned' | 'inquiry_created' | 'closed' | 'cancelled'

export interface CommodityRequestDetailModel {
  id: string

  categoryName: string
  productName?: string

  quantity: number
  quantityUnit: string

  purityRequired?: string
  gradeRequired?: string

  targetPriceMin?: number
  targetPriceMax?: number
  currency: string

  deliveryCountry?: string
  deliveryTerms?: string
  requiredByDate?: string

  notes?: string

  status: CommodityRequestStatus

  createdAt: string
  updatedAt: string
}

export interface CommodityRequestInput {
  categoryId?: string
  isCustomCategory?: boolean
  customFamilyName?: string
  customTypeName?: string

  quantity: number
  quantityUnit: string

  targetPriceMin?: number
  targetPriceMax?: number

  currency: string

  deliveryCountry?: string
  deliveryTerms?: string

  requiredByDate?: string

  purityRequired?: string
  gradeRequired?: string

  notes?: string
}

export interface CommodityRequestFilters {
  search?: string
  status?: string
  categoryId?: string

  page?: number
  pageSize?: number
}

export interface CommodityRequest {
  id: string

  buyerId: string

  categoryId: string
  categoryName: string

  quantity: number
  quantityUnit: string

  targetPriceMin?: number
  targetPriceMax?: number

  currency: string

  deliveryCountry?: string
  deliveryTerms?: string

  requiredByDate?: string

  purityRequired?: string
  gradeRequired?: string

  notes?: string

  status: CommodityRequestStatus

  createdAt: string
  updatedAt: string
}

export const commodityRequestsApi = {
  create: (data: CommodityRequestInput) =>
    api.request<ApiSuccess<CommodityRequest>>('POST', '/exchange/commodity-requests', data),

  getAll: (filters: CommodityRequestFilters = {}) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== '' && value !== undefined && value !== null
      )
    )

    return api.request<ApiSuccessList<CommodityRequest>>(
      'GET',
      `/exchange/commodity-requests?${api.qs(cleanFilters as Record<string, string>)}`
    )
  },

  getById: (id: string) =>
    api.request<ApiSuccess<CommodityRequest>>('GET', `/exchange/commodity-requests/${id}`)
}
