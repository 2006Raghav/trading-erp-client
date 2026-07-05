import { api } from '../../lib/api'
import { tokenStorage } from '../../platform'
import type { User } from '../../lib/types'

export interface LoginResponse {
  success: boolean
  token: string
  user: User
}

export interface MeResponse {
  success: boolean
  user: User
}

export const authApi = {
  /**
   * POST /api/auth/login
   * Sends username + password, receives JWT token + user object.
   * The token is stored by AuthContext after a successful call.
   */
  login: (username: string, password: string) =>
    api.request<LoginResponse>('POST', '/api/auth/login', { username, password }),

  /**
   * POST /api/auth/logout
   * Tells the server to log the logout event in activity_logs.
   * The token is cleared by AuthContext regardless of whether this call succeeds.
   */
  logout: () => api.request<{ success: boolean }>('POST', '/api/auth/logout'),

  /**
   * GET /api/auth/me
   * Called on app startup to check if the stored token is still valid.
   * Returns the current user if valid, throws 401 if expired.
   */
  me: () => api.request<MeResponse>('GET', '/api/auth/me'),

  /**
   * POST /api/auth/change-password
   */
  changePassword: (currentPassword: string, newPassword: string) =>
    api.request<{ success: boolean }>('POST', '/api/auth/change-password', {
      currentPassword,
      newPassword
    })
}
