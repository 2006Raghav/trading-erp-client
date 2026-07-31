// -----------------------------------------------------------------------------
// Registration Types
// Shared request / response contracts for public company registration.
// -----------------------------------------------------------------------------

export interface BuyerRegistrationRequest {
  companyName: string
  companyRegistrationNumber: string
  businessType: string

  contactPerson: string
  email: string
  phone: string
  country: string

  password: string
  confirmPassword: string
}

export interface SellerRegistrationRequest {
  companyName: string
  companyRegistrationNumber: string
  productionFocus: string[]

  contactPerson: string
  email: string
  phone: string
  country: string

  password: string
  confirmPassword: string
}

export interface RegistrationResponse {
  success: boolean
  message: string

  result?: {
    registrationId?: string
    status?: 'pending'
  }
}
