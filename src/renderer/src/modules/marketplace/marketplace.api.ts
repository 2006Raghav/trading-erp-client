// src/renderer/src/modules/marketplace/marketplace.api.ts

import { api } from '../../lib/api'
import type { ApiSuccess, ApiSuccessList } from '../../lib/types'

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

export interface MarketplaceCategory {
  id: string
  name: string
  description: string | null
  image_storage_key: string | null
  imageUrl: string | null
  display_order: number
}

export interface CatalogueCategory {
  id: string
  name: string
  description: string | null
  image_storage_key: string | null
  imageUrl: string | null
  display_order: number
}

export interface CatalogueType {
  id: string
  category_id: string
  category_name?: string
  name: string
  description: string | null
  standard_unit: string
  image_storage_key: string | null
  imageUrl: string | null
  display_order: number
}

export const marketplaceApi = {
  getCategories: () =>
    api.request<ApiSuccess<CatalogueCategory[]>>('GET', '/exchange/marketplace/categories'),

  getTypesByCategory: (categoryId: string) =>
    api.request<ApiSuccess<CatalogueType[]>>('GET', `/exchange/marketplace/categories/${categoryId}/types`),

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
