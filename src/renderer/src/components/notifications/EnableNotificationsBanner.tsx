import { Bell, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  canRequestNotifications,
  hasNotificationPreference,
  requestNativeNotificationPermission
} from '../../lib/nativeNotifications'

export function EnableNotificationsBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!hasNotificationPreference() && canRequestNotifications())
  }, [])

  if (!visible) return null

  const handleEnable = async () => {
    await requestNativeNotificationPermission()
    setVisible(false)
  }

  const handleDismiss = () => {
    window.localStorage.setItem('native-notifications-preference', 'denied')
    setVisible(false)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 border-b px-6 py-2.5"
      style={{ background: 'var(--info-bg)', borderColor: 'var(--border)' }}
    >
      <Bell size={16} style={{ color: 'var(--info-text)', flexShrink: 0 }} />
      <span className="text-body-s flex-1" style={{ color: 'var(--text-primary)' }}>
        Enable desktop notifications to stay informed about new activity.
      </span>
      <button
        type="button"
        onClick={handleEnable}
        className="text-body-s font-semibold text-cobalt-600 hover:underline"
      >
        Enable
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        className="rounded p-1 hover:bg-hover"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Dismiss notification prompt"
      >
        <X size={16} />
      </button>
    </div>
  )
}
