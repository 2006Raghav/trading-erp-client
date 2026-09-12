import { api } from '../../lib/api';

export interface Notification {
  id: string;
  recipientType: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  linkType: string | null;
  linkId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationFilters {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}

export const notificationsApi = {
  getNotifications: (filters: NotificationFilters = {}) =>
    api.request<{ success: boolean; data: Notification[]; meta: any }>('GET', `/api/notifications?${api.qs(filters as any)}`),

  getUnreadCount: () =>
    api.request<{ success: boolean; data: { unreadCount: number } }>('GET', '/api/notifications/unread-count'),

  markAsRead: (id: string) =>
    api.request<{ success: boolean }>('PUT', `/api/notifications/${id}/read`),

  markAllAsRead: () =>
    api.request<{ success: boolean; data: { updated: number } }>('PUT', '/api/notifications/read-all'),

  deleteNotification: (id: string) =>
    api.request<{ success: boolean }>('DELETE', `/api/notifications/${id}`),

  removeDealMessageNotifications: (dealId: string) =>
    api.request<{ success: boolean; data: { deletedCount: number } }>('DELETE', `/api/notifications/deals/${dealId}/messages`)
};
