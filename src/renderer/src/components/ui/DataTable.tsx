import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  label: string
  width?: number | string
  numeric?: boolean // right-align + monospace — §5.5
  render?: (value: any, row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading: boolean
  onRowClick?: (row: T) => void
  rowHeight?: 56 | 48 // 56 = entity tables, 48 = compact/log tables — §5.5
  emptyMessage?: string
  emptyHint?: string // action hint for empty state
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  loading,
  onRowClick,
  rowHeight = 56,
  emptyMessage = 'No records found.',
  emptyHint
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        style={{ color: 'var(--color-slate-500)' }}
      >
        <div
          className="animate-spin rounded-full mr-3"
          style={{
            width: 20,
            height: 20,
            border: `2px solid var(--color-slate-200)`,
            borderTopColor: 'var(--color-cobalt-600)'
          }}
        />
        <span className="text-body-s">Loading…</span>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        {/* Empty state icon — §6: simple two-color line illustration */}
        <div
          className="flex items-center justify-center rounded-full mb-4"
          style={{
            width: 56,
            height: 56,
            background: 'var(--color-cobalt-50)',
            color: 'var(--color-cobalt-600)'
          }}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 13h4" />
          </svg>
        </div>
        <p className="text-body-m font-medium mb-1" style={{ color: 'var(--color-ink-900)' }}>
          {emptyMessage}
        </p>
        {emptyHint && (
          <p className="text-body-s" style={{ color: 'var(--color-slate-500)' }}>
            {emptyHint}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {/* §5.5 header: canvas-50 bg, caption scale, slate-500 text */}
        <thead>
          <tr
            style={{
              background: 'var(--bg-canvas)',
              borderBottom: `1px solid var(--border)`
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-caption uppercase px-4 text-left"
                style={{
                  height: '40px',
                  color: 'var(--text-secondary)',
                  textAlign: col.numeric ? 'right' : 'left',
                  width: col.width ?? undefined
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr
              key={(row as any).id ?? i}
              onClick={() => onRowClick?.(row)}
              className="transition-colors"
              style={{
                height: `${rowHeight}px`,
                borderBottom: `1px solid var(--border)`,
                background: 'var(--bg-card)',
                cursor: onRowClick ? 'pointer' : undefined
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'
              }}
            >
              {columns.map((col) => {
                const value = (row as any)[col.key]
                const content = col.render ? col.render(value, row) : (value ?? '—')
                return (
                  <td
                    key={col.key}
                    className={col.numeric ? 'font-mono' : ''}
                    style={{
                      padding: '0 16px',
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: 'var(--text-primary)',
                      textAlign: col.numeric ? 'right' : 'left'
                    }}
                  >
                    {content}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
