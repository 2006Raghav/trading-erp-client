// src/renderer/src/modules/dashboard/dashboard.api.ts
import { api } from '../../lib/api'

export interface DashboardSummary {
  totalBuyers: number
  totalSellers: number
  totalProducts: number
  recentActivity: ActivityLog[]
  productsByCategory: CategoryCount[]
}

interface ActivityLog {
  action: string
  entity_type: string
  description: string | null
  created_at: string
  user_name: string | null
}

interface CategoryCount {
  category: string
  count: number
}

export const dashboardApi = {
  getSummary: () =>
    api.request<{ success: boolean; data: DashboardSummary }>('GET', '/api/dashboard/summary')
}
