import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAuth } from '../../modules/auth/AuthContext'
import { KycStatusBanner } from '../../modules/registration/KycStatusBanner'
import { EnableNotificationsBanner } from '../notifications/EnableNotificationsBanner'

export function AppShell() {
  const { kycStatus } = useAuth()

  return (
    <div className="flex h-screen bg-canvas-50 overflow-hidden">
      {/* Fixed-width sidebar — never scrolls */}
      <Sidebar />

      {/* Right-hand content area: header + scrollable page content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <EnableNotificationsBanner />

        {/* KYC status banner — shown for exchange users who are not yet approved */}
        {kycStatus && kycStatus !== 'approved' && <KycStatusBanner kycStatus={kycStatus} />}

        {/* <Outlet /> renders the matched child route component (Dashboard, Buyers, etc.) */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
