import { api } from '../../lib/api'

import type {
  BuyerRegistrationRequest,
  SellerRegistrationRequest,
  RegistrationResponse
} from './registration.types'

export const registrationApi = {
  registerBuyer(data: BuyerRegistrationRequest) {
    return api.request<RegistrationResponse>('POST', '/public/register/buyer', data)
  },

  registerSeller(data: SellerRegistrationRequest) {
    return api.request<RegistrationResponse>('POST', '/public/register/seller', data)
  }
}
