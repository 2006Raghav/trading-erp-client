import { api } from '../../../lib/api'

import type { Product, ProductCategory, ApiSuccess, ApiSuccessList } from '../../../lib/types'

export interface SellerProductFilters {
  search?: string
  page?: number
  pageSize?: number
}

export interface SellerProductInput {
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

export const sellerProductsApi = {
  getCategories: () =>
    api.request<ApiSuccess<ProductCategory[]>>('GET', '/exchange/my-products/categories'),

  getAll: (filters: SellerProductFilters = {}) =>
    api.request<ApiSuccessList<Product>>(
      'GET',
      `/exchange/my-products?${api.qs(filters as Record<string, string>)}`
    ),

  getById: (id: string) => api.request<ApiSuccess<Product>>('GET', `/exchange/my-products/${id}`),

  create: (data: SellerProductInput) =>
    api.request<ApiSuccess<Product>>('POST', '/exchange/my-products', data),

  update: (id: string, data: SellerProductInput) =>
    api.request<ApiSuccess<Product>>('PUT', `/exchange/my-products/${id}`, data),

  remove: (id: string) => api.request<{ success: boolean }>('DELETE', `/exchange/my-products/${id}`)
}
