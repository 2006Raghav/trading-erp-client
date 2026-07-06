interface Column<T> {
  key: string // Row object key to read for this column
  label: string // Column header text
  width?: number | string // Optional fixed width
  // If provided: called instead of reading row[key] directly.
  // Receives (cellValue, fullRow) so you can access any field for rendering.
  render?: (value: any, row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading: boolean
  onRowClick?: (row: T) => void // If provided, rows are clickable
  emptyMessage?: string
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  loading,
  onRowClick,
  emptyMessage = 'No records found.'
}: DataTableProps<T>) {
  // Loading state: centered spinner with "Loading…" text
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <div className="animate-spin h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full mr-3" />
        Loading…
      </div>
    )
  }

  // Empty state: emoji + message
  if (!data?.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr
              key={(row as any).id ?? i}
              onClick={() => onRowClick?.(row)}
              className={`hover:bg-slate-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-700">
                  {/* If a render function is provided, use it; otherwise read the field directly */}
                  {col.render
                    ? col.render((row as any)[col.key], row)
                    : ((row as any)[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
