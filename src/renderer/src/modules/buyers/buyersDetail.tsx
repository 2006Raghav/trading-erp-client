// src/renderer/src/modules/buyers/BuyerDetail.tsx
// Read-only detail + activity history view. Receives a Buyer as a prop.

import { useState, useEffect } from 'react'
import { buyersApi } from './buyers.api'
import { CreditBadge } from '../../components/ui/StatusBadge'
import { formatDate, formatQuantity } from '../../lib/utils'
import type { Buyer } from '../../lib/types'

// Action badge colors for the history log
const ACTION_BADGE: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100  text-blue-700',
  DELETE: 'bg-red-100   text-red-700',
  LOGIN: 'bg-slate-100 text-slate-600'
}

// ── Reusable detail row — label + value ───────────────────────────────────────
// Defined as a nested component inside this file because only BuyerDetail uses it.
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 w-44 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700">{value || '—'}</span>
    </div>
  )
}

export function BuyerDetail({ buyer }: { buyer: Buyer }) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buyersApi
      .getHistory(buyer.id)
      .then((res) => {
        if (res.success) setHistory(res.data as any[])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [buyer.id])

  return (
    <div className="space-y-6">
      {/* ── Profile columns ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-x-8">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Company
          </h4>
          <DetailRow label="Buyer Code" value={buyer.buyerCode} />
          <DetailRow label="Company Name" value={buyer.companyName} />
          <DetailRow label="Contact" value={buyer.contactPerson} />
          <DetailRow label="Country" value={buyer.country} />
          <DetailRow label="Email" value={buyer.email} />
          <DetailRow label="Phone" value={buyer.phone} />
          <DetailRow label="WhatsApp" value={buyer.whatsapp} />
          <DetailRow label="Website" value={buyer.website} />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Legal & Trade
          </h4>
          <DetailRow label="Business Reg." value={buyer.businessRegistrationNo} />
          <DetailRow label="Tax Number" value={buyer.taxNumber} />
          <DetailRow label="Credit Rating" value={<CreditBadge rating={buyer.creditRating} />} />
          <DetailRow
            label="Annual Capacity"
            value={
              buyer.annualPurchaseCapacity
                ? formatQuantity(buyer.annualPurchaseCapacity, buyer.capacityUnit)
                : null
            }
          />
          <DetailRow label="Interested In" value={buyer.interests?.map((i) => i.name).join(', ')} />
          <DetailRow label="Added On" value={formatDate(buyer.createdAt)} />
        </div>
      </div>

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      {buyer.notes && (
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Notes</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{buyer.notes}</p>
        </div>
      )}

      {/* ── Activity History ──────────────────────────────────────────────── */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Change History
        </h4>
        {loading ? (
          <div className="text-center py-4 text-slate-400 text-sm">Loading history…</div>
        ) : history.length ? (
          <div className="space-y-2">
            {history.map((log: any, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${ACTION_BADGE[log.action] ?? 'bg-slate-100 text-slate-600'}`}
                >
                  {log.action}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">
                    {log.description || `${log.action} record`}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    by {log.user_name} · {formatDate(log.created_at, 'datetime')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No history available.</p>
        )}
      </div>
    </div>
  )
}
