import { useLocation } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/buyers': 'Buyer Directory',
  '/sellers': 'Seller Directory',
  '/products': 'Product Catalogue',
  '/users': 'User Management'
}

export function Header() {
  const location = useLocation()
  const title =
    PAGE_TITLES[location.pathname] ??
    Object.entries(PAGE_TITLES).find(([k]) => location.pathname.startsWith(k))?.[1] ??
    'Commodity ERP'

  return (
    <header
      className="flex items-center px-6 shrink-0"
      style={{
        height: '56px',
        background: 'var(--color-white)',
        borderBottom: '1px solid var(--color-slate-200)'
      }}
    >
      <h1 className="text-heading-s" style={{ color: 'var(--color-ink-900)' }}>
        {title}
      </h1>
      <div className="ml-auto text-body-s" style={{ color: 'var(--color-slate-500)' }}>
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
