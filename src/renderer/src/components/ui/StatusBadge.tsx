// Tailwind classes per credit rating — defined as a lookup to keep render() clean
const RATING_STYLES: Record<string, string> = {
  A: 'bg-green-100  text-green-700  border-green-200',
  B: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  C: 'bg-orange-100 text-orange-700 border-orange-200',
  Unrated: 'bg-slate-100  text-slate-500  border-slate-200'
}

export function CreditBadge({ rating }: { rating: string | null }) {
  const r = rating || 'Unrated'
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${RATING_STYLES[r] ?? RATING_STYLES.Unrated}`}
    >
      {r}
    </span>
  )
}

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
