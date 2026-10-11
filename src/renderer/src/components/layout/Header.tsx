import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, User as UserIcon, Key, LogOut } from 'lucide-react'
import { getNotificationTarget, NotificationPanel } from '../notifications/NotificationPanel'
import { startNotificationPolling, stopNotificationPolling } from '../../lib/notifications'
import { notificationsApi, type Notification } from '../../modules/notifications/notifications.api'
import { useAuth } from '../../modules/auth/AuthContext'
import { showNativeNotification } from '../../lib/nativeNotifications'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { ChangePasswordModal } from '../../modules/auth/ChangePasswordModal'
import { ProfileModal } from '../../modules/auth/ProfileModal'
import { ThemeToggle } from '../ui/ThemeToggle'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/buyers': 'Buyer Directory',
  '/sellers': 'Seller Directory',
  '/mandates': 'Mandates',
  '/products': 'Product Catalogue',
  '/catalogue': 'Catalogue',
  '/myproducts': 'My Products',
  '/marketplace': 'Marketplace',
  '/commodity-requests': 'Commodity Requests',
  '/my-deals': 'My Deals',
  '/inquiries': 'Inquiries',
  '/users': 'User Management',
  '/kyc': 'KYC Queue',
  '/change-password': 'Change Password',
  '/profile': 'Profile'
}

/**
 * Format: "Wednesday, 09 Sep 2026" — spec §1.1
 */
function formatHeaderDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Generate a deterministic avatar color based on name.
 * Colors: cobalt (default), gold, copper, slate.
 */
function getAvatarStyle(name: string): { bg: string; text: string } {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const palettes = [
    { bg: 'bg-cobalt-100', text: 'text-cobalt-700' }, // Cobalt
    { bg: 'bg-metal-gold', text: 'text-white' }, // Gold
    { bg: 'bg-metal-copper', text: 'text-white' }, // Copper
    { bg: 'bg-slate-300', text: 'text-ink-900' } // Slate
  ]
  return palettes[hash % palettes.length]
}

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isInternal } = useAuth()

  const title =
    PAGE_TITLES[location.pathname] ??
    Object.entries(PAGE_TITLES).find(([k]) => location.pathname.startsWith(k))?.[1] ??
    'Xclamation'

  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  useEffect(() => {
    startNotificationPolling(setUnreadCount, (newNotifications: Notification[]) => {
      newNotifications.forEach((notification) => {
        const target = getNotificationTarget(notification, isInternal)
        showNativeNotification(notification, () => {
          navigate(target?.path ?? '/dashboard')
        })
      })
    })
    const handleRefresh = () => {
      notificationsApi
        .getUnreadCount()
        .then((res) => {
          if (res.success) setUnreadCount(res.data.unreadCount)
        })
        .catch(() => {})
    }
    window.addEventListener('notifications:refresh', handleRefresh)
    return () => {
      stopNotificationPolling()
      window.removeEventListener('notifications:refresh', handleRefresh)
    }
  }, [isInternal, navigate])

  return (
    <header
      id="global-header"
      className="flex items-center shrink-0 justify-between px-6"
      style={{
        height: '56px',
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--header-border)',
        // Explicit transition for header surface — supplements global transition
        transition: 'background-color 200ms ease, border-color 200ms ease'
      }}
    >
      {/* Page title — left side */}
      <h1 className="text-heading-s font-semibold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h1>

      {/* Right-side elements: Date · Notifications · User */}
      <div className="flex items-center" style={{ gap: '16px', paddingRight: '0px' }}>
        {/* Date display — body-s, text-secondary */}
        <span
          id="header-date"
          className="text-body-s select-none"
          style={{ color: 'var(--text-secondary)' }}
        >
          {formatHeaderDate()}
        </span>

        {/* Dark mode toggle — Sun (dark) / Moon (light), 20px, text-secondary */}
        <ThemeToggle />

        {/* Notification Bell */}
        <button
          onClick={() => setIsNotifOpen(true)}
          className="relative p-1 rounded-md hover:bg-hover transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-cobalt-600 border border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        <NotificationPanel
          isOpen={isNotifOpen}
          onClose={() => setIsNotifOpen(false)}
          onUnreadCountUpdate={setUnreadCount}
        />

        {/* User Menu */}
        {user &&
          (() => {
            // Determine display name depending on user type
            const name =
              user.userType === 'internal'
                ? user.username
                : (user as any).fullName || (user as any).companyName || 'User'
            const initial = name.charAt(0).toUpperCase()
            const { bg, text } = getAvatarStyle(name)

            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-hover p-1 rounded-md transition-colors outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`${bg} ${text} text-body-s font-semibold`}>
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="text-body-s font-medium hidden sm:inline-block"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {name}
                    </span>
                    <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => setIsProfileOpen(true)}
                    className="cursor-pointer"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="cursor-pointer"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    <span>Change Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-danger-text focus:text-danger-text focus:bg-danger-bg"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })()}
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />
    </header>
  )
}
