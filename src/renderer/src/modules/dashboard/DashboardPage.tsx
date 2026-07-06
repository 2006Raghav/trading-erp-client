// src/renderer/src/modules/dashboard/DashboardPage.tsx
//
// Summary cards + recent activity feed + products-by-category chart.
// All data comes from a single API call to GET /api/dashboard/summary.

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { dashboardApi, type DashboardSummary } from './Dashboard.api'
import { formatDate } from '../../lib/utils'
import { Users, Building2, Package, TrendingUp, AlertCircle, Clock } from 'lucide-react'

// ── Sub-components (private to this file) ─────────────────────────────────────
// Defined here rather than in separate files because they're only used on this page.

interface SummaryCardProps {
  label: string
  value: number | string | undefined
  icon: React.ComponentType<{ size: number }>
  color: 'blue' | 'green' | 'purple' | 'orange'
}

// Color map for icon container: bg, text, ring
const CARD_COLORS: Record<SummaryCardProps['color'], string> = {
  blue: 'bg-blue-50   text-blue-600   ring-blue-100',
  green: 'bg-green-50  text-green-600  ring-green-100',
  purple: 'bg-purple-50 text-purple-600 ring-purple-100',
  orange: 'bg-orange-50 text-orange-600 ring-orange-100'
}

function SummaryCard({ label, value, icon: Icon, color }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-800">{value ?? '—'}</p>
        </div>
        <div className={`p-2.5 rounded-xl ring-4 ${CARD_COLORS[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

// Color map for activity log action badges
const ACTION_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  CREATE: { label: 'Created', bg: 'bg-green-100', text: 'text-green-600' },
  UPDATE: { label: 'Updated', bg: 'bg-blue-100', text: 'text-blue-600' },
  DELETE: { label: 'Deleted', bg: 'bg-red-100', text: 'text-red-600' },
  LOGIN: { label: 'Login', bg: 'bg-slate-100', text: 'text-slate-600' }
}

// ── Main page component ───────────────────────────────────────────────────────
export function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Single fetch on mount — dashboard data doesn't auto-refresh in V1
    dashboardApi
      .getSummary()
      .then((res) => {
        if (res.success) setSummary(res.data)
      })
      .catch((err) => console.error('Dashboard load failed:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Welcome back, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Here's what's happening in your trading system.
        </p>
      </div>

      {/* Four summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {/* <SummaryCard
          label="Total Buyers"
          value={loading ? '…' : summary?.totalBuyers}
          icon={Users}
          color="blue"
        /> */}
        {/* <SummaryCard
          label="Total Sellers"
          value={loading ? '…' : summary?.totalSellers}
          icon={Building2}
          color="green"
        /> */}
        {/* <SummaryCard
          label="Total Products"
          value={loading ? '…' : summary?.totalProducts}
        //   icon={Package}
          color="purple" */}
        {/* /> */}
        {/* Active Deals is a V2 metric — show placeholder */}
        {/* <SummaryCard label="Active Deals" value="—" icon={TrendingUp} color="orange" /> */}
      </div>

      {/* V2 notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">More metrics coming in Version 2</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Active Deals, Pending Payments, and Upcoming Shipments will be available once the
            Inquiry and Deal modules are built.
          </p>
        </div>
      </div>

      {/* Two-column: activity feed + category chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : summary?.recentActivity?.length ? (
              summary.recentActivity.map((log, i) => {
                const style = ACTION_STYLES[log.action] ?? {
                  label: log.action,
                  bg: 'bg-slate-100',
                  text: 'text-slate-600'
                }
                return (
                  <div key={i} className="flex items-start gap-3 px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 ${style.bg} ${style.text}`}
                    >
                      {style.label}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 truncate">
                        {log.description || `${log.action} on ${log.entity_type}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {log.user_name} · {formatDate(log.created_at, 'datetime')}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">No activity yet</div>
            )}
          </div>
        </div>

        {/* Products by Category — horizontal bar chart (CSS only, no chart library) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">Products by Category</h3>
          </div>
          <div className="p-5 space-y-3">
            {loading ? (
              <div className="text-center text-slate-400 text-sm">Loading…</div>
            ) : summary?.productsByCategory?.length ? (
              (() => {
                // Calculate max once — used to normalise bar widths
                const max = Math.max(...summary.productsByCategory.map((x) => x.count))
                return summary.productsByCategory.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{item.category}</span>
                      <span className="text-slate-800 font-medium">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${(item.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              })()
            ) : (
              <div className="text-center text-slate-400 text-sm py-4">No products yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
