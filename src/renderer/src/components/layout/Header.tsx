import { useLocation } from 'react-router-dom'

// Maps URL prefixes to human-readable page titles.
// Header.tsx is the only file that cares about this mapping.
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/buyers': 'Buyer Management',
  '/sellers': 'Seller Management',
  '/products': 'Product Management',
  '/users': 'User Management'
}

export function Header() {
  const location = useLocation()

  // Find the title for the current path.
  // startsWith() handles sub-routes like /buyers/123 → "Buyer Management"
  const title =
    PAGE_TITLES[location.pathname] ??
    Object.entries(PAGE_TITLES).find(([k]) => location.pathname.startsWith(k))?.[1] ??
    'Trading ERP'

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 shrink-0">
      <h2 className="text-base font-semibold text-slate-700">{title}</h2>
      <div className="ml-auto text-sm text-slate-400">
        {new Date().toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      </div>
    </header>
  )
}
