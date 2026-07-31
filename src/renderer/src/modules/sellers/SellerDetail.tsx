import { useState, useEffect } from 'react'
import { sellersApi } from './sellers.api'
import { productsApi } from '../products/products.api'
import { formatDate, formatQuantity, formatCurrency } from '../../lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import type { Seller, Product } from '../../lib/types'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 w-44 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700">{value || '—'}</span>
    </div>
  )
}

const ACTION_BADGE: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100  text-blue-700',
  DELETE: 'bg-red-100   text-red-700'
}

function maskAccount(str: string | null) {
  if (!str) return '—'
  return '*'.repeat(Math.max(0, str.length - 4)) + str.slice(-4)
}

export function SellerDetail({ seller }: { seller: Seller }) {
  const [history, setHistory] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showBanking, setShowBanking] = useState(false)

  useEffect(() => {
    Promise.all([
      sellersApi.getHistory(seller.id).then((r) => {
        if (r.success) setHistory(r.data as any[])
      }),
      productsApi.getAll({ sellerId: seller.id, pageSize: 50 }).then((r) => {
        if (r.success) setProducts(r.data)
      })
    ]).finally(() => setLoading(false))
  }, [seller.id])

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="grid grid-cols-2 gap-x-8">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Company
          </h4>
          <Row label="Seller Code" value={seller.sellerCode} />
          <Row label="Company Name" value={seller.companyName} />
          <Row label="Contact Person" value={seller.contactPerson} />
          <Row label="Country" value={seller.country} />
          <Row label="Email" value={seller.email} />
          <Row label="Phone" value={seller.phone} />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Operations
          </h4>
          <Row
            label="Monthly Capacity"
            value={
              seller.monthlyProductionCapacity
                ? formatQuantity(seller.monthlyProductionCapacity, seller.capacityUnit)
                : null
            }
          />
          <Row label="Added On" value={formatDate(seller.createdAt)} />
        </div>
      </div>

      {/* Addresses */}
      {(seller.factoryAddress || seller.warehouseAddress) && (
        <div className="grid grid-cols-2 gap-4">
          {seller.factoryAddress && (
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Factory</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{seller.factoryAddress}</p>
            </div>
          )}
          {seller.warehouseAddress && (
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Warehouse</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {seller.warehouseAddress}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Certifications + Licenses */}
      {(seller.certifications?.length > 0 || seller.exportLicenses?.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {seller.certifications?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Certifications</p>
              <div className="flex flex-wrap gap-1.5">
                {seller.certifications.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-1 bg-brand-50 text-brand-700
                                            border border-brand-200 rounded-full text-xs"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {seller.exportLicenses?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Export Licenses</p>
              <div className="flex flex-wrap gap-1.5">
                {seller.exportLicenses.map((l) => (
                  <span
                    key={l}
                    className="px-2 py-1 bg-amber-50 text-amber-700
                                            border border-amber-200 rounded-full text-xs"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Banking — hidden by default */}
      {(seller.bankName || seller.bankAccountNo) && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase">Banking Details</p>
            <button
              onClick={() => setShowBanking((v) => !v)}
              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800"
            >
              {showBanking ? (
                <>
                  <EyeOff size={13} /> Hide
                </>
              ) : (
                <>
                  <Eye size={13} /> Reveal
                </>
              )}
            </button>
          </div>
          {showBanking && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 grid grid-cols-2 gap-x-8">
              <Row label="Bank Name" value={seller.bankName} />
              <Row label="Bank Country" value={seller.bankCountry} />
              <Row label="Account Number" value={maskAccount(seller.bankAccountNo)} />
              <Row label="SWIFT / BIC" value={seller.bankSwiftCode} />
              <Row label="IBAN" value={seller.bankIban ? maskAccount(seller.bankIban) : null} />
            </div>
          )}
        </div>
      )}

      {/* Linked Products */}
      {products.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Products ({products.length})
          </h4>
          <div className="space-y-1.5">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm"
              >
                <div>
                  <span className="text-slate-800 font-medium">{p.productName}</span>
                  <span className="text-slate-400 ml-2 text-xs">{p.categoryName}</span>
                </div>
                <span className="text-slate-500 text-xs">
                  {formatQuantity(p.availableQuantity, p.quantityUnit)}
                  {p.pricePerUnit ? ` · ${formatCurrency(p.pricePerUnit, p.currency)}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Change History
        </h4>
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : history.length ? (
          <div className="space-y-2">
            {history.map((log: any, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${ACTION_BADGE[log.action] ?? 'bg-slate-100 text-slate-600'}`}
                >
                  {log.action}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-700">{log.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {log.user_name} · {formatDate(log.created_at, 'datetime')}
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
