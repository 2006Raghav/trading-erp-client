import { AlertCircle, Clock, RefreshCw } from 'lucide-react'
import type { KycStatus } from '../../lib/types'

interface KycStatusBannerProps {
  kycStatus: KycStatus
}

const BANNER_CONFIG: Record<
  Exclude<KycStatus, 'approved'>,
  {
    bg: string
    border: string
    icon: typeof Clock
    iconColor: string
    text: string
    subText: string
  }
> = {
  pending: {
    bg: 'var(--color-canvas-50)',
    border: 'var(--color-slate-200)',
    icon: Clock,
    iconColor: 'var(--color-slate-500)',
    text: 'Application submitted — awaiting review',
    subText:
      'You can explore the platform but cannot submit requests until your KYC is approved.'
  },
  under_review: {
    bg: 'var(--color-canvas-50)',
    border: 'var(--color-cobalt-200)',
    icon: Clock,
    iconColor: 'var(--color-cobalt-600)',
    text: 'Your application is under review',
    subText:
      'Our team is verifying your documents. You can browse the marketplace while you wait.'
  },
  resubmitted: {
    bg: 'var(--color-canvas-50)',
    border: 'var(--color-cobalt-200)',
    icon: RefreshCw,
    iconColor: 'var(--color-cobalt-600)',
    text: 'Documents resubmitted — awaiting review',
    subText:
      'Your updated documents are being reviewed. You can explore the platform but cannot submit requests yet.'
  },
  rejected: {
    bg: 'var(--color-danger-bg)',
    border: 'var(--color-danger)',
    icon: AlertCircle,
    iconColor: 'var(--color-danger)',
    text: 'KYC application rejected',
    subText: 'Your application was rejected. Please review the reason and re-submit your documents.'
  }
}

export function KycStatusBanner({ kycStatus }: KycStatusBannerProps) {
  if (kycStatus === 'approved') return null

  const config = BANNER_CONFIG[kycStatus]
  const Icon = config.icon

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: config.bg,
        borderBottom: `1px solid ${config.border}`,
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        lineHeight: '1.4'
      }}
    >
      <Icon
        style={{
          width: 16,
          height: 16,
          flexShrink: 0,
          color: config.iconColor
        }}
      />
      <span style={{ color: 'var(--color-ink-900)', fontWeight: 600 }}>{config.text}</span>
      <span
        style={{
          color: 'var(--color-slate-500)',
          display: 'none'
        }}
        className="sm:inline"
      >
        — {config.subText}
      </span>
    </div>
  )
}
