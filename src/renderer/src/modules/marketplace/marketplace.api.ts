// src/renderer/src/modules/marketplace/marketplace.api.ts

import { api } from '../../lib/api'
import type { ApiSuccess, ApiSuccessList, ProductCategory } from '../../lib/types'

export interface MarketplaceFilters {
  categoryId?: string
  purity?: number
  minQuantity?: number
  page?: number
  pageSize?: number
}
export interface CommodityRequestPrefill {
  categoryId: string
  categoryName: string
  productName: string
  purity?: string
  grade?: string
  quantityUnit: string
  currency?: string
}

export interface MarketplaceProduct {
  id: string
  categoryId: string
  categoryName: string
  productName: string
  purity?: string
  grade?: string
  origin?: string
  availableQuantity: number
  quantityUnit: string
  warehouseCountry?: string
  pricePerUnit?: number
  currency?: string
}

export type MarketplaceCategory = ProductCategory

export const marketplaceApi = {
  getCategories: () => api.request<ApiSuccess<ProductCategory[]>>('GET', '/products/categories'),

  getAll: (filters: MarketplaceFilters = {}) => {
    // 1. Create a clean object by stripping out undefined, null, and empty strings
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== '' && value !== undefined && value !== null
      )
    )

    // 2. Pass the safely cleaned object to your query string generator
    return api.request<ApiSuccessList<MarketplaceProduct>>(
      'GET',
      `/exchange/marketplace?${api.qs(cleanFilters as Record<string, string>)}`
    )
  }
}
