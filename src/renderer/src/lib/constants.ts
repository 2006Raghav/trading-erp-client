// src/renderer/src/lib/constants.ts
//
// Application-wide constants used by the React UI.
// These are display/UX values — the server enforces the real rules server-side.

// User roles available in the system
export const USER_ROLES = ['admin', 'sales', 'accounts', 'documents'] as const
export type UserRole = (typeof USER_ROLES)[number]

// Human-readable labels for each role
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  sales: 'Sales Executive',
  accounts: 'Accounts Officer',
  documents: 'Document Officer'
}

// Which modules each role can see in the sidebar and navigate to.
// This is UX-only enforcement — the server enforces permissions on every API call.
// A motivated user could bypass this client-side check, but the server will 403 them.
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'buyers', 'sellers', 'products', 'users', 'marketPlace', 'kyc'],
  sales: ['dashboard', 'buyers', 'sellers', 'products', 'marketPlace'],
  accounts: ['dashboard', 'buyers', 'sellers', 'marketPlace'],
  documents: ['dashboard', 'buyers', 'sellers', 'marketplace', 'products']
}

// Credit rating options for buyer forms and filters
export const CREDIT_RATINGS = ['A', 'B', 'C', 'Unrated'] as const
export type CreditRating = (typeof CREDIT_RATINGS)[number]

// Commodity quantity units used in product and buyer forms
export const COMMODITY_UNITS = ['MT', 'KG', 'Oz', 'LB', 'Tonne'] as const

// Currencies used in product pricing
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'INR', 'CNY'] as const
