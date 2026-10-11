import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { notificationsApi, Notification } from '../../modules/notifications/notifications.api'
import { useAuth } from '../../modules/auth/AuthContext'
import { useToast } from '../../modules/auth/ToastContext'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  onUnreadCountUpdate: (count: number) => void
}

export function getNotificationTarget(
  notif: Notification,
  isInternal: boolean
): { path: string; label: string } | null {
  const isDeal =
    notif.linkType === 'deal' ||
    [
      'deal_status_changed',
      'new_message',
      'document_shared',
      'document_revision_requested',
      'new_document_received',
      'deal_closed'
    ].includes(notif.type)

  if (isDeal) {
    if (notif.linkId) {
      return {
        path: isInternal
          ? `/inquiries/${encodeURIComponent(notif.linkId)}`
          : `/my-deals/${encodeURIComponent(notif.linkId)}`,
        label: 'deal'
      }
    }
    return {
      path: isInternal ? '/inquiries' : '/my-deals',
      label: 'deals'
    }
  }

  const isRequest =
    notif.linkType === 'request' ||
    ['request_status_changed', 'new_request_submitted'].includes(notif.type)

  if (isRequest) {
    return {
      path: isInternal
        ? notif.linkId
          ? `/inquiries/${encodeURIComponent(notif.linkId)}`
          : '/inquiries'
        : '/commodity-requests',
      label: 'commodity request'
    }
  }

  const isKyc =
    notif.linkType === 'kyc' || ['kyc_submitted', 'kyc_status_changed'].includes(notif.type)

  if (isKyc) {
    return {
      path: isInternal ? '/kyc' : '/kyc-status',
      label: 'KYC status'
    }
  }

  if (notif.linkType === 'product_type' || notif.type === 'product_type_proposed') {
    return {
      path: isInternal ? '/products' : '/myproducts',
      label: 'products'
    }
  }

  return null
}

export function NotificationPanel({
  isOpen,
  onClose,
  onUnreadCountUpdate
}: NotificationPanelProps) {
  const { isInternal } = useAuth()
  const toast = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setPage(1)
      loadNotifications(1, true)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleRefresh = () => {
      loadNotifications(1, true)
    }
    window.addEventListener('notifications:refresh', handleRefresh)
    return () => window.removeEventListener('notifications:refresh', handleRefresh)
  }, [isOpen])

  const loadNotifications = async (targetPage: number, reset: boolean = false) => {
    setLoading(true)
    try {
      const res = await notificationsApi.getNotifications({ page: targetPage, pageSize: 20 })
      if (res.success) {
        setNotifications((prev) => (reset ? res.data : [...prev, ...res.data]))
        setHasMore(res.meta.total > targetPage * 20)
        onUnreadCountUpdate(res.meta.unreadCount)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    if (markingAllRead) return

    setMarkingAllRead(true)
    try {
      const res = await notificationsApi.markAllAsRead()
      if (res.success) {
        await loadNotifications(1, true)
        toast.success('All notifications marked as read')
      } else {
        toast.error('Failed to mark notifications as read')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to mark notifications as read')
    } finally {
      setMarkingAllRead(false)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await notificationsApi.deleteNotification(id).catch(() => {})
    notificationsApi
      .getUnreadCount()
      .then((res) => {
        if (res.success) onUnreadCountUpdate(res.data.unreadCount)
      })
      .catch(() => {})
  }

  const handleNotificationClick = async (notif: Notification) => {
    const isMessageNotif = notif.type === 'new_message'

    if (isMessageNotif) {
      // Remove message notification as the user is navigating to see the message
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
      notificationsApi.deleteNotification(notif.id).catch(() => {})
    } else if (!notif.isRead) {
      notificationsApi.markAsRead(notif.id).catch(() => {})
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)))
    }

    // Update unread count immediately
    notificationsApi
      .getUnreadCount()
      .then((res) => {
        if (res.success) onUnreadCountUpdate(res.data.unreadCount)
      })
      .catch(() => {})

    onClose()

    const target = getNotificationTarget(notif, isInternal)
    if (target) {
      navigate(target.path)
    }
  }

  if (!isOpen) return null

  const displayedNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink-900/20 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed top-0 right-0 z-50 h-full w-[420px] shadow-2xl flex flex-col"
        style={{ backgroundColor: 'var(--bg-elevated)', borderLeft: '1px solid var(--border)' }}
      >
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-heading-s font-semibold" style={{ color: 'var(--text-primary)' }}>
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cobalt-50 text-cobalt-600 border border-cobalt-200">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markingAllRead}
              >
                {markingAllRead ? 'Marking...' : 'Mark all read'}
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-hover transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* All vs Unread Filter Tabs */}
        <div className="flex border-b px-4 gap-4" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setFilter('all')}
            className={`py-2 text-body-s font-medium border-b-2 transition-colors ${
              filter === 'all'
                ? 'border-cobalt-600 text-cobalt-600'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`py-2 text-body-s font-medium border-b-2 transition-colors ${
              filter === 'unread'
                ? 'border-cobalt-600 text-cobalt-600'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {displayedNotifications.length === 0 && !loading && (
            <div
              className="text-center py-12 text-body-s"
              style={{ color: 'var(--text-secondary)' }}
            >
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {displayedNotifications.map((notif) => {
              const target = getNotificationTarget(notif, isInternal)
              return (
                <div
                  key={notif.id}
                  className="group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                  style={{ backgroundColor: notif.isRead ? 'transparent' : 'var(--bg-hover)' }}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="mt-1">
                    {notif.isRead ? (
                      <div className="w-2 h-2 rounded-full border border-slate-300" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-cobalt-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="font-medium text-body-m truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {notif.title}
                      </span>
                      <span
                        className="text-body-s shrink-0"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p
                      className="text-body-s mt-1 line-clamp-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {notif.message}
                    </p>
                    {target && (
                      <span className="text-body-s text-cobalt-600 mt-2 inline-block font-medium hover:underline">
                        → Go to {target.label}
                      </span>
                    )}
                  </div>

                  {/* Dismiss / Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNotification(notif.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-hover transition-all text-secondary absolute top-3 right-3"
                    title="Dismiss notification"
                  >
                    <X size={14} />
                  </button>
                </div>
              )
            })}
          </div>

          {hasMore && filter === 'all' && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => {
                  setPage((p) => p + 1)
                  loadNotifications(page + 1)
                }}
              >
                {loading ? 'Loading...' : 'Load more notifications'}
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  )
}
