import { api } from '../../lib/api'

export interface InternalDashboardData {
  summaryCards: {
    totalBuyers: number
    totalSellers: number
    totalMandates: number
    pendingKyc: number
    activeDeals: number
    dealsAssignedToMe: number
    openRequests: number
    docsAwaitingReview: number
    contractsExpiringSoon: number
  }
  unreadMessages: any[]
  kycQueuePreview: any[]
  chartData: {
    dealsByStatus: any[]
    requestsByCategory: any[]
    dealsPerMonth: any[]
  }
  recentActivity: any[]
}

export interface BuyerDashboardData {
  summaryCards: {
    activeDeals: number
    openRequests: number
    docsNeedingAction: number
    completedDeals: number
  }
  recentDeals: any[]
}

export interface SellerDashboardData {
  summaryCards: {
    activeDeals: number
    activeListings: number
    inactiveListings: number
    docsNeedingAction: number
    completedDeals: number
  }
  recentDeals: any[]
  productListings: any[]
}

export interface MandateDashboardData {
  summaryCards: {
    activeDeals: number
    openRequests: number
    completedDeals: number
  }
  recentDeals: any[]
}

export const dashboardApi = {
  getInternalDashboard: () =>
    api.request<{ success: boolean; data: InternalDashboardData }>('GET', '/dashboard/internal'),
  
  getBuyerDashboard: () =>
    api.request<{ success: boolean; data: BuyerDashboardData }>('GET', '/dashboard/buyer'),
    
  getSellerDashboard: () =>
    api.request<{ success: boolean; data: SellerDashboardData }>('GET', '/dashboard/seller'),
    
  getMandateDashboard: () =>
    api.request<{ success: boolean; data: MandateDashboardData }>('GET', '/dashboard/mandate'),

  toggleProductListing: (id: string, isActive: boolean) =>
    api.request<{ success: boolean }>('PUT', `/exchange/my-products/${id}`, { isActive })
}
