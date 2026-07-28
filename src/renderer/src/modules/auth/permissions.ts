import type { User, InternalRole } from '../../lib/types'
import { ROLE_PERMISSIONS } from '../../lib/constants'

const BUYER_PERMISSIONS: readonly string[] = [
  'buyer-dashboard',
  'buyer-profile',
  'buyer-orders',
  'buyer-documents',
  'marketplace' // <-- ADDED: Grants access to the marketplace
]

const SELLER_PERMISSIONS: readonly string[] = [
  'seller-dashboard',
  'seller-profile',
  'seller-products',
  'seller-orders',
  'seller-documents',
  'marketplace' // <-- ADDED: Grants access to the marketplace
]

export function hasPermission(user: User | null, module: string): boolean {
  if (!user) return false

  switch (user.userType) {
    case 'internal':
      return ROLE_PERMISSIONS[user.role as InternalRole]?.includes(module) ?? false

    case 'buyer':
      return BUYER_PERMISSIONS.includes(module)

    case 'seller':
      return SELLER_PERMISSIONS.includes(module)

    default:
      return false
  }
}
