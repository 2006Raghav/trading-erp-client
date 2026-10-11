import type { Notification as AppNotification } from '../modules/notifications/notifications.api'

const PREFERENCE_KEY = 'native-notifications-preference'
type NotificationPreference = 'granted' | 'denied'

function canUseNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

function readPreference(): NotificationPreference | null {
  if (typeof window === 'undefined') return null
  const preference = window.localStorage.getItem(PREFERENCE_KEY)
  return preference === 'granted' || preference === 'denied' ? preference : null
}

function writePreference(preference: NotificationPreference): void {
  window.localStorage.setItem(PREFERENCE_KEY, preference)
}

export function hasNotificationPreference(): boolean {
  return readPreference() !== null
}

export function canRequestNotifications(): boolean {
  return canUseNotifications() && Notification.permission === 'default'
}

export async function requestNativeNotificationPermission(): Promise<boolean> {
  if (!canUseNotifications()) return false

  const savedPreference = readPreference()
  if (savedPreference) return savedPreference === 'granted'

  const permission =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission
  const preference = permission === 'granted' ? 'granted' : 'denied'
  writePreference(preference)
  return preference === 'granted'
}

export function showNativeNotification(
  notification: AppNotification,
  onClick: () => void
): Notification | null {
  if (!canUseNotifications() || Notification.permission !== 'granted') return null

  const nativeNotification = new Notification(notification.title, {
    body: notification.message,
    tag: `notification-${notification.id}`
  })
  nativeNotification.onclick = () => {
    nativeNotification.close()
    const focusWindow = window.electron?.focusWindow
    if (focusWindow) {
      void focusWindow().finally(onClick)
    } else {
      window.focus()
      onClick()
    }
  }
  return nativeNotification
}