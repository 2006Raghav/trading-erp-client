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
    api.request<ApiSuccess<ProductCategory[]>>('GET', '/products/categories'),

  getAll: (filters: ProductFilters = {}) =>
    api.request<ApiSuccessList<Product>>(
      'GET',
      `/products?${api.qs(filters as Record<string, string>)}`
    ),

  getById: (id: string) => api.request<ApiSuccess<Product>>('GET', `/products/${id}`),

  create: (data: ProductInput) => api.request<ApiSuccess<Product>>('POST', '/products', data),

  update: (id: string, data: ProductInput) =>
    api.request<ApiSuccess<Product>>('PUT', `/products/${id}`, data),

  remove: (id: string) => api.request<{ success: boolean }>('DELETE', `/products/${id}`)
}
