import { notificationsApi } from '../modules/notifications/notifications.api';
import type { Notification } from '../modules/notifications/notifications.api';

const POLL_INTERVAL = 30_000; // 30 seconds

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startNotificationPolling(
  onUpdate: (unreadCount: number) => void,
  onNewNotifications?: (notifications: Notification[]) => void
) {
  let previousUnreadCount: number | null = null
  const notifiedIds = new Set<string>()

  // Poll immediately on start, then every 30s
  const poll = async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      if (!res.success) return

      const unreadCount = res.data.unreadCount
      onUpdate(unreadCount)

      if (previousUnreadCount !== null && unreadCount > previousUnreadCount && onNewNotifications) {
        const delta = await notificationsApi.getNotifications({
          page: 1,
          pageSize: unreadCount - previousUnreadCount,
          unreadOnly: true
        })
        if (delta.success) {
          const newNotifications = delta.data.filter((notification) => {
            if (notifiedIds.has(notification.id)) return false
            notifiedIds.add(notification.id)
            return true
          })
          if (newNotifications.length > 0) onNewNotifications(newNotifications)
        }
      }

      previousUnreadCount = unreadCount
    } catch {
      // Silent fail — polling should never crash the app
    }
  };

  poll();
  intervalId = setInterval(poll, POLL_INTERVAL);
}

export function stopNotificationPolling() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function triggerNotificationRefresh() {
  window.dispatchEvent(new CustomEvent('notifications:refresh'));
}
