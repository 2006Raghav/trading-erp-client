// src/renderer/src/components/ui/Pagination.tsx
// Page navigation bar. Renders nothing if there is only one page.

import type { PaginationMeta } from '../../lib/types'

interface PaginationProps {
  meta: PaginationMeta | null
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  // Don't render anything if there's only one page — no point showing navigation
  if (!meta || meta.totalPages <= 1) return null

  const { page, totalPages, total, pageSize } = meta
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-sm text-slate-500">
      <span>
        Showing {start}–{end} of {total} records
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
        >
          ‹ Prev
        </button>
        <span className="px-3 py-1 text-slate-700 font-medium">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
        >
          Next ›
        </button>
      </div>
    </div>
  )
}
