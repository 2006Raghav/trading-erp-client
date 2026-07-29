import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppShell() {
  return (
    <div className="flex h-screen bg-canvas-50 overflow-hidden">
      {/* Fixed-width sidebar — never scrolls */}
      <Sidebar />

      {/* Right-hand content area: header + scrollable page content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {/* <Outlet /> renders the matched child route component (Dashboard, Buyers, etc.) */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
