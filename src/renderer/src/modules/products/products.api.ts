// src/renderer/src/modules/products/products.api.ts
import { api } from '../../lib/api'
import type { Product, ProductCategory, ApiSuccess, ApiSuccessList } from '../../lib/types'

export interface ProductFilters {
  search?: string
  categoryId?: string
  sellerId?: string
  page?: number
  pageSize?: number
}

export interface ProductInput {
  sellerId: string
  categoryId: string
  productName: string
  purity?: string
  grade?: string
  origin?: string
  availableQuantity?: number | string
  quantityUnit?: string
  pricePerUnit?: number | string
  currency?: string
  warehouseLocation?: string
}

export const productsApi = {
  // Also used by BuyerForm to load the interests category list
  getCategories: () =>
    api.request<ApiSuccess<ProductCategory[]>>('GET', '/api/products/categories'),

  getAll: (filters: ProductFilters = {}) =>
    api.request<ApiSuccessList<Product>>(
      'GET',
      `/api/products?${api.qs(filters as Record<string, string>)}`
    ),

  getById: (id: string) => api.request<ApiSuccess<Product>>('GET', `/api/products/${id}`),

  create: (data: ProductInput) => api.request<ApiSuccess<Product>>('POST', '/api/products', data),

  update: (id: string, data: ProductInput) =>
    api.request<ApiSuccess<Product>>('PUT', `/api/products/${id}`, data),

  remove: (id: string) => api.request<{ success: boolean }>('DELETE', `/api/products/${id}`)
}
