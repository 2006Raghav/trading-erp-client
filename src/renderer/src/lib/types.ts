// src/renderer/src/lib/types.ts
// Entity types shared across modules.
// These mirror the camelCase shapes that the Fastify server returns in JSON.

export type InternalRole = 'admin' | 'sales' | 'accounts' | 'documents'

export interface InternalUser {
  id: string
  userType: 'internal'

  username: string
  fullName: string
  email: string | null

  role: InternalRole

  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

export interface BuyerUser {
  id: string
  userType: 'buyer'

  buyerId: string

  companyName: string
  fullName: string
  email: string | null

  isActive: boolean
}

export interface SellerUser {
  id: string
  userType: 'seller'

  sellerId: string

  companyName: string
  fullName: string
  email: string | null

  isActive: boolean
}

export type User = InternalUser | BuyerUser | SellerUser

export interface Buyer {
  id: string
  buyerCode: string
  companyName: string
  contactPerson: string | null
  country: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  website: string | null
  businessRegistrationNo: string | null
  taxNumber: string | null
  annualPurchaseCapacity: number | null
  capacityUnit: string
  creditRating: 'A' | 'B' | 'C' | 'Unrated'
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  interests: Array<{ id: string; name: string }>
}

export interface Seller {
  id: string
  sellerCode: string
  companyName: string
  country: string | null
  contactPerson: string | null
  email: string | null
  phone: string | null
  factoryAddress: string | null
  warehouseAddress: string | null
  monthlyProductionCapacity: number | null
  capacityUnit: string
  certifications: string[]
  exportLicenses: string[]
  bankName: string | null
  bankAccountNo: string | null
  bankSwiftCode: string | null
  bankIban: string | null
  bankCountry: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  sellerId: string
  categoryId: string
  productName: string
  purity: string | null
  grade: string | null
  origin: string | null
  availableQuantity: number
  quantityUnit: string
  pricePerUnit: number | null
  currency: string
  warehouseLocation: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Joined fields from server
  sellerName: string
  sellerCode: string
  categoryName: string
}

export interface ProductCategory {
  id: string
  name: string
  unit: string
}

// Generic paginated response shape — matches the server's meta object
export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Helper type for API responses
export type ApiSuccess<T> = { success: true; data: T }
export type ApiSuccessList<T> = { success: true; data: T[]; meta: PaginationMeta }
export type ApiError = { success: false; error: string }
