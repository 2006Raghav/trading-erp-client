// src/renderer/src/modules/inquiries/adminInquiries.api.ts

import { api } from '../../lib/api'
import type { ApiSuccess } from '../../lib/types'

export type RequestStatus =
  | 'open'
  | 'under_review'
  | 'sourcing'
  | 'quoted'
  | 'closed_won'
  | 'closed_lost'

export interface AdminCommodityRequest {
  id: string
  referenceNumber: string
  buyerId: string
  buyerCompanyName: string
  buyerCountry: string | null
  buyerContactPerson: string | null
  buyerEmail: string | null
  buyerPhone: string | null
  buyerCode: string | null
  submittedByType: 'buyer' | 'mandate'
  mandateId: string | null
  mandateCompanyName: string | null
  mandateCode: string | null

  // Commodity Info
  commodityTypeId: string | null
  commodityTypeName: string | null
  categoryId: string | null
  categoryName: string | null
  isCustomCategory: boolean
  customFamilyName: string | null
  customTypeName: string | null
  customCategoryStatus: string | null
  customCategoryNote: string | null
  displayName: string

  // Quantity & Pricing
  quantity: number
  quantityUnit: string
  targetPriceMin: number | null
  targetPriceMax: number | null
  currency: string

  // Logistics & Requirements
  deliveryCountry: string | null
  deliveryTerms: string | null
  requiredByDate: string | null
  purityRequired: string | null
  gradeRequired: string | null
  notes: string | null

  // Workflow
  status: RequestStatus
  internalNotes: string | null
  rejectionReason: string | null
  assignedTo: string | null
  assignedUserName: string | null

  // Assigned Seller
  assignedSellerId: string | null
  assignedSellerAt: string | null
  sellerAssignmentNotes: string | null
  sellerCompanyName: string | null
  sellerCountry: string | null
  sellerCode: string | null
  sellerContactPerson: string | null
  sellerEmail: string | null
  sellerPhone: string | null

  createdAt: string
  updatedAt: string
}

export interface InquiryStats {
  total: number
  open: number
  underReview: number
  sourcing: number
  quoted: number
  closedWon: number
  closedLost: number
  assigned: number
  unassigned: number
}

export interface AdminCommodityRequestFilters {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  categoryId?: string
  commodityTypeId?: string
  deliveryCountry?: string
  assignmentStatus?: 'all' | 'assigned' | 'unassigned'
  sellerId?: string
  buyerId?: string
}

export interface SellerLookupItem {
  id: string
  companyName: string
  sellerCode: string
  country: string
  contactPerson: string | null
  email: string
  phone: string
  monthlyCapacity: number | null
  capacityUnit: string | null
  kycStatus: string
}

export const adminInquiriesApi = {
  getAll: (filters: AdminCommodityRequestFilters = {}) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== '' && value !== undefined && value !== null
      )
    )

    return api.request<{
      success: boolean
      data: AdminCommodityRequest[]
      meta: { page: number; pageSize: number; total: number; totalPages: number }
      stats: InquiryStats
    }>('GET', `/admin/inquiries?${api.qs(cleanFilters as Record<string, string>)}`)
  },

  getStats: () => api.request<ApiSuccess<InquiryStats>>('GET', '/admin/inquiries/stats'),

  getById: (id: string) =>
    api.request<ApiSuccess<AdminCommodityRequest>>('GET', `/admin/inquiries/${id}`),

  update: (
    id: string,
    data: {
      status?: RequestStatus
      internalNotes?: string | null
      rejectionReason?: string | null
      assignedTo?: string | null
    }
  ) => api.request<ApiSuccess<AdminCommodityRequest>>('PATCH', `/admin/inquiries/${id}`, data),

  assignSeller: (id: string, payload: { sellerId: string; notes?: string }) =>
    api.request<ApiSuccess<AdminCommodityRequest>>(
      'POST',
      `/admin/inquiries/${id}/assign-seller`,
      payload
    ),

  unassignSeller: (id: string) =>
    api.request<ApiSuccess<AdminCommodityRequest>>(
      'DELETE',
      `/admin/inquiries/${id}/assign-seller`
    ),

  getSellersLookup: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : ''
    return api.request<ApiSuccess<SellerLookupItem[]>>(
      'GET',
      `/admin/inquiries/sellers-lookup${qs}`
    )
  }
}
