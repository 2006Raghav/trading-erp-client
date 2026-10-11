import type { PaginationMeta } from '../../lib/types'

interface PaginationProps {
  meta: PaginationMeta | null
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.totalPages <= 1) return null

  const { page, totalPages, total, pageSize } = meta
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  const btnBase: React.CSSProperties = {
    height: '32px',
    minWidth: '32px',
    padding: '0 10px',
    borderRadius: '8px',
    border: `1px solid var(--border)`,
    background: 'var(--bg-card)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderTop: `1px solid var(--border)` }}
    >
      <span className="text-body-s" style={{ color: 'var(--text-secondary)' }}>
        Showing{' '}
        <span className="font-mono">
          {start}–{end}
        </span>{' '}
        of <span className="font-mono">{total}</span> records
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={{
            ...btnBase,
            opacity: page === 1 ? 0.4 : 1,
            cursor: page === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          ‹ Prev
        </button>
        <span className="text-body-s font-medium" style={{ color: 'var(--text-primary)' }}>
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          style={{
            ...btnBase,
            opacity: page === totalPages ? 0.4 : 1,
            cursor: page === totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          Next ›
        </button>
      </div>
    </div>
  )
}
