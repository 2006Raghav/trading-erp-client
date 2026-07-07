import { api } from '../../lib/api'
import type { User, ApiSuccess } from '../../lib/types'

export interface UserInput {
  fullName: string
  username: string
  email?: string
  role: string
  password?: string
  newPassword?: string
}

export interface UserFilters {
  search?: string
  role?: string
}

export const usersApi = {
  getAll: (filters: UserFilters = {}) =>
    api.request<{ success: boolean; data: User[] }>(
      'GET',
      `/users?${api.qs(filters as Record<string, string>)}`
    ),

  create: (data: UserInput) => api.request<ApiSuccess<User>>('POST', '/users', data),

  update: (id: string, data: UserInput) =>
    api.request<ApiSuccess<User>>('PUT', `/users/${id}`, data),

  toggleActive: (id: string, isActive: boolean) =>
    api.request<{ success: boolean }>('PATCH', `/users/${id}/active`, { isActive })
}
