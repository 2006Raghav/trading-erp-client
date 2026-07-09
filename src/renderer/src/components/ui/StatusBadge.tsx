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
      className="inline-flex items-center text-caption uppercase"
      style={{
        background: s.bg,
        color: s.text,
        padding: '2px 10px',
        borderRadius: '9999px',
        lineHeight: '16px'
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
      className="inline-flex items-center gap-1.5 text-caption uppercase"
      style={{
        background: isActive ? 'var(--color-success-bg)' : 'var(--color-canvas-50)',
        color: isActive ? 'var(--color-success)' : 'var(--color-slate-500)',
        padding: '2px 10px',
        borderRadius: '9999px',
        lineHeight: '16px'
      }}
    >
      {/* §5.6: status dot — always paired with a word */}
      <span
        className={isActive ? 'animate-pulse-dot' : ''}
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          display: 'inline-block',
          background: isActive ? 'var(--color-success)' : 'var(--color-slate-300)'
        }}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

/* ── Role Badge ──────────────────────────────────────────────────────────── */
export function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className="inline-flex items-center text-caption uppercase"
      style={{
        background: 'var(--color-cobalt-100)',
        color: 'var(--color-cobalt-700)',
        padding: '2px 10px',
        borderRadius: '9999px',
        lineHeight: '16px'
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
      className="inline-flex items-center gap-1.5 text-caption uppercase"
      style={{
        background: s.bg,
        color: s.text,
        padding: '2px 10px',
        borderRadius: '9999px',
        lineHeight: '16px'
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          display: 'inline-block',
          background: s.text
        }}
      />
      {label}
    </span>
  )
}
