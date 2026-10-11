/* ── Credit Rating ──────────────────────────────────────────────────────── */
const CREDIT_STYLES: Record<string, { bg: string; text: string }> = {
  A: { bg: 'var(--color-success-bg)', text: 'var(--color-success)' },
  B: { bg: 'var(--color-warning-bg)', text: 'var(--color-warning)' },
  C: { bg: 'var(--color-danger-bg)', text: 'var(--color-danger)' },
  Unrated: { bg: 'var(--color-canvas-50)', text: 'var(--color-slate-500)' }
}

export function CreditBadge({ rating }: { rating: string | null }) {
  const r = rating || 'Unrated'
  const s = CREDIT_STYLES[r] ?? CREDIT_STYLES.Unrated
  return (
    <span
      className="inline-flex items-center justify-center text-caption uppercase text-center font-semibold leading-none"
      style={{
        background: s.bg,
        color: s.text,
        padding: '3px 10px',
        borderRadius: '9999px',
        lineHeight: '1'
      }}
    >
      {r}
    </span>
  )
}

/* ── Active / Inactive ──────────────────────────────────────────────────── */
export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center gap-1.5 text-caption uppercase font-semibold leading-none"
      style={{
        background: isActive ? 'var(--color-success-bg)' : 'var(--color-canvas-50)',
        color: isActive ? 'var(--color-success)' : 'var(--color-slate-500)',
        padding: '3px 10px',
        borderRadius: '9999px',
        lineHeight: '1'
      }}
    >
      {/* §5.6: status dot — always paired with a word */}
      <span
        className={isActive ? 'animate-pulse-dot' : ''}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          display: 'inline-block',
          background: isActive ? 'var(--color-success)' : 'var(--color-slate-300)'
        }}
      />
      <span>{isActive ? 'Active' : 'Inactive'}</span>
    </span>
  )
}

/* ── KYC Status ─────────────────────────────────────────────────────────── */

export type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected'

const KYC_STYLES: Record<
  KycStatus,
  {
    bg: string
    text: string
    label: string
  }
> = {
  pending: {
    bg: 'var(--color-warning-bg)',
    text: 'var(--color-warning)',
    label: 'Pending'
  },

  under_review: {
    bg: 'var(--color-info-bg)',
    text: 'var(--color-info)',
    label: 'Under Review'
  },

  approved: {
    bg: 'var(--color-success-bg)',
    text: 'var(--color-success)',
    label: 'Approved'
  },

  rejected: {
    bg: 'var(--color-danger-bg)',
    text: 'var(--color-danger)',
    label: 'Rejected'
  }
}

export function KycStatusBadge({ status }: { status: KycStatus | null }) {
  const s = status ? KYC_STYLES[status] : KYC_STYLES.pending

  return (
    <span
      className="inline-flex items-center justify-center gap-1.5 text-caption uppercase font-semibold leading-none"
      style={{
        background: s.bg,
        color: s.text,
        padding: '3px 10px',
        borderRadius: '9999px',
        lineHeight: '1'
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          display: 'inline-block',
          background: s.text
        }}
      />
      <span>{s.label}</span>
    </span>
  )
}

/* ── Role Badge ──────────────────────────────────────────────────────────── */
export function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className="inline-flex items-center justify-center text-caption uppercase font-semibold leading-none text-center"
      style={{
        background: 'var(--color-cobalt-100)',
        color: 'var(--color-cobalt-700)',
        padding: '3px 10px',
        borderRadius: '9999px',
        lineHeight: '1'
      }}
    >
      {role}
    </span>
  )
}

/* ── Generic Semantic Badge ──────────────────────────────────────────────── */
type SemanticState = 'success' | 'warning' | 'danger' | 'info'

const SEMANTIC_STYLES: Record<SemanticState, { bg: string; text: string }> = {
  success: { bg: 'var(--color-success-bg)', text: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-bg)', text: 'var(--color-warning)' },
  danger: { bg: 'var(--color-danger-bg)', text: 'var(--color-danger)' },
  info: { bg: 'var(--color-info-bg)', text: 'var(--color-info)' }
}

export function SemanticBadge({ state, label }: { state: SemanticState; label: string }) {
  const s = SEMANTIC_STYLES[state]
  return (
    <span
      className="inline-flex items-center justify-center gap-1.5 text-caption uppercase font-semibold leading-none"
      style={{
        background: s.bg,
        color: s.text,
        padding: '3px 10px',
        borderRadius: '9999px',
        lineHeight: '1'
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          display: 'inline-block',
          background: s.text
        }}
      />
      <span>{label}</span>
    </span>
  )
}
