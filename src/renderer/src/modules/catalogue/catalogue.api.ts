import { api } from '../../lib/api'
import type { ApiSuccess } from '../../lib/types'
import type { CatalogueCategory, CatalogueType } from '../marketplace/marketplace.api'

export interface PromoteCategoryPayload {
  categoryId?: string
  newCategoryName?: string
  typeId?: string
  newTypeName: string
  description?: string
  standardUnit?: string
}

export interface KeepAsOthersPayload {
  note?: string
}

export interface CommodityRequestOthers {
  id: string
  buyer_company_name: string
  custom_family_name: string
  custom_type_name: string
  description: string | null
  quantity: number
  quantity_unit: string
  created_at: string
}

export const catalogueApi = {
  // L1 Categories
  getCategories: () =>
    api.request<ApiSuccess<CatalogueCategory[]>>('GET', '/admin/catalogue/categories'),
  
  createCategory: (data: FormData) =>
    api.request<ApiSuccess<{ id: string }>>('POST', '/admin/catalogue/categories', data),

  updateCategory: (id: string, data: FormData) =>
    api.request<ApiSuccess<null>>('PUT', `/admin/catalogue/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.request<ApiSuccess<null>>('DELETE', `/admin/catalogue/categories/${id}`),

  // L2 Types
  getTypes: (categoryId?: string) =>
    api.request<ApiSuccess<CatalogueType[]>>(
      'GET',
      categoryId ? `/admin/catalogue/types?categoryId=${categoryId}` : '/admin/catalogue/types'
    ),

  createType: (data: FormData) =>
    api.request<ApiSuccess<{ id: string }>>('POST', '/admin/catalogue/types', data),

  updateType: (id: string, data: FormData) =>
    api.request<ApiSuccess<null>>('PUT', `/admin/catalogue/types/${id}`, data),

  deleteType: (id: string) =>
    api.request<ApiSuccess<null>>('DELETE', `/admin/catalogue/types/${id}`),

  // Approvals
  getPendingTypes: () =>
    api.request<ApiSuccess<CatalogueType[]>>('GET', '/admin/catalogue/types/pending-approval'),

  approveType: (id: string, status: 'approved' | 'rejected') =>
    api.request<ApiSuccess<null>>('PUT', `/admin/catalogue/types/${id}/approval`, { status }),

  // Others Flow
  getOthersRequests: () =>
    api.request<ApiSuccess<CommodityRequestOthers[]>>('GET', '/admin/commodity-requests'),

  promoteCategory: (id: string, payload: PromoteCategoryPayload) =>
    api.request<ApiSuccess<null>>('PUT', `/admin/commodity-requests/${id}/promote-category`, payload),

  keepAsOthers: (id: string, payload: KeepAsOthersPayload) =>
    api.request<ApiSuccess<null>>('PUT', `/admin/commodity-requests/${id}/keep-as-others`, payload),
}
