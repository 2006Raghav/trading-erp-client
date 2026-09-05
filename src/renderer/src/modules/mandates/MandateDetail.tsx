// src/renderer/src/modules/mandates/MandateDetail.tsx

import { useEffect, useState } from 'react'

import {
  mandatesApi,
  type Mandate,
  type MandateDetail as MandateDetailType,
  type MandateDocument,
  type MandateRequest,
  type MandateDeal,
  type MandateCommission,
  type KycStatus,
  type MandateRepresents
} from './mandates.api'

import {
  Building2,
  Mail,
  Phone,
  MessageCircle,
  Globe2,
  FileText,
  ShieldCheck,
  KeyRound,
  Eye,
  RefreshCw,
  Clock3,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronLeft
} from 'lucide-react'

import { primaryBtnStyle } from '../cssUtils'

import { useToast } from '../auth/ToastContext'

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface MandateDetailProps {
  mandate: Mandate
  onEdit?: () => void
  onRefresh?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab
// ─────────────────────────────────────────────────────────────────────────────

type DetailTab = 'deals' | 'requests' | 'commissions'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(value: string | null | undefined) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Status badges
// ─────────────────────────────────────────────────────────────────────────────

function RepresentsBadge({ represents }: { represents: MandateRepresents }) {
  const buyer = represents === 'buyer_side'

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
      style={{
        background: buyer ? 'var(--color-cobalt-50)' : 'var(--color-warning-bg)',

        color: buyer ? 'var(--color-cobalt-700)' : 'var(--color-warning)'
      }}
    >
      {buyer ? 'Buyer Side' : 'Seller Side'}
    </span>
  )
}

function KycBadge({ status }: { status: KycStatus }) {
  const config: Record<
    KycStatus,
    {
      label: string
      background: string
      color: string
    }
  > = {
    pending: {
      label: 'Pending',
      background: 'var(--color-warning-bg)',
      color: 'var(--color-warning)'
    },

    under_review: {
      label: 'Under Review',
      background: 'var(--color-info-bg)',
      color: 'var(--color-info)'
    },

    approved: {
      label: 'Approved',
      background: 'var(--color-success-bg)',
      color: 'var(--color-success)'
    },

    rejected: {
      label: 'Rejected',
      background: 'var(--color-danger-bg)',
      color: 'var(--color-danger)'
    }
  }

  const current = config[status]

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
      style={{
        background: current.background,
        color: current.color
      }}
    >
      {status === 'approved' && <CheckCircle2 size={13} />}

      {status === 'under_review' && <Clock3 size={13} />}

      {status === 'pending' && <AlertCircle size={13} />}

      {status === 'rejected' && <XCircle size={13} />}

      {current.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail row
// ─────────────────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="w-36 shrink-0 text-xs text-slate-400 pt-0.5">{label}</span>

      <span className="text-sm text-slate-700 min-w-0 break-words">{value || '—'}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section card
// ─────────────────────────────────────────────────────────────────────────────

function Card({
  title,
  icon,
  children,
  action
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-400">{icon}</span>}

          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        </div>

        {action}
      </div>

      <div className="p-5">{children}</div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function MandateDetail({ mandate, onEdit, onRefresh }: MandateDetailProps) {
  const toast = useToast()

  const [detail, setDetail] = useState<MandateDetailType | null>(null)

  const [documents, setDocuments] = useState<MandateDocument[]>([])

  const [requests, setRequests] = useState<MandateRequest[]>([])

  const [deals, setDeals] = useState<MandateDeal[]>([])

  const [commissions, setCommissions] = useState<MandateCommission[]>([])

  const [loading, setLoading] = useState(true)

  const [tab, setTab] = useState<DetailTab>('deals')

  const [password, setPassword] = useState('')

  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  const [settingPassword, setSettingPassword] = useState(false)

  // ─────────────────────────────────────────────────────────────────────────
  // Load
  // ─────────────────────────────────────────────────────────────────────────

  async function loadDetail() {
    setLoading(true)

    try {
      const [detailRes, documentsRes, requestsRes, dealsRes, commissionsRes] = await Promise.all([
        mandatesApi.getById(mandate.id),

        mandatesApi.getDocuments(mandate.id),

        mandatesApi.getRequests(mandate.id),

        mandatesApi.getDeals(mandate.id),

        mandatesApi.getCommissions(mandate.id)
      ])

      if (detailRes.success) {
        setDetail(detailRes.data)
      }

      if (documentsRes.success) {
        setDocuments(documentsRes.data)
      }

      if (requestsRes.success) {
        setRequests(requestsRes.data)
      }

      if (dealsRes.success) {
        setDeals(dealsRes.data)
      }

      if (commissionsRes.success) {
        setCommissions(commissionsRes.data)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load mandate details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetail()
  }, [mandate.id])

  // ─────────────────────────────────────────────────────────────────────────
  // Set password
  // ─────────────────────────────────────────────────────────────────────────

  async function handleSetPassword() {
    if (!password.trim()) {
      toast.error('Password is required')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSettingPassword(true)

    try {
      const res = await mandatesApi.setPassword(mandate.id, password)

      if (res.success) {
        toast.success('Exchange access password updated')

        setPassword('')
        setConfirmPassword('')

        await loadDetail()

        onRefresh?.()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to set Exchange access password')
    } finally {
      setSettingPassword(false)
    }
  }

  const current = detail ?? mandate

  // ─────────────────────────────────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────────────────────────────────

  if (loading && !detail) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <RefreshCw size={15} className="animate-spin" />
          Loading mandate details
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ───────────────────────────────────────────────────────────────────
          Header
      ─────────────────────────────────────────────────────────────────── */}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand-600 transition-colors mb-3"
            onClick={() => window.history.back()}
          >
            <ChevronLeft size={14} />
            Back to Mandates
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-slate-500">{current.mandateCode}</span>

            <RepresentsBadge represents={current.represents} />

            <KycBadge status={current.kycStatus} />

            <span
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
              style={{
                background: current.hasExchangeAccess
                  ? 'var(--color-success-bg)'
                  : 'var(--color-slate-100)',

                color: current.hasExchangeAccess ? 'var(--color-success)' : 'var(--color-slate-600)'
              }}
            >
              Exchange: {current.hasExchangeAccess ? 'Active' : 'Inactive'}
            </span>
          </div>

          <h2 className="text-lg font-semibold text-slate-900 mt-2">{current.companyName}</h2>

          <p className="text-sm text-slate-400 mt-0.5">{current.country}</p>
        </div>

        {onEdit && (
          <button type="button" onClick={onEdit} className="shrink-0" style={primaryBtnStyle}>
            Edit Mandate
          </button>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          Two-column layout
      ─────────────────────────────────────────────────────────────────── */}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)] gap-5">
        {/* ─────────────────────────────────────────────────────────────────
            LEFT
        ──────────────────────────────────────────────────────────────── */}

        <div className="space-y-5">
          {/* Tabs */}

          <div className="bg-white border border-slate-100 rounded-xl shadow-sm">
            <div className="flex items-center border-b border-slate-100 px-4">
              <button
                type="button"
                onClick={() => setTab('deals')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'deals'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Deals
              </button>

              <button
                type="button"
                onClick={() => setTab('requests')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'requests'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Requests
              </button>

              <button
                type="button"
                onClick={() => setTab('commissions')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'commissions'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Commissions
              </button>

              <button
                type="button"
                onClick={loadDetail}
                className="ml-auto p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
                title="Refresh"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="p-5">
              {/* Deals */}

              {tab === 'deals' && (
                <div className="space-y-3">
                  {deals.length ? (
                    deals.map((deal) => (
                      <div
                        key={deal.id}
                        className="border border-slate-100 rounded-lg p-4 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-mono text-xs text-slate-400">{deal.inquiryCode}</p>

                            <p className="text-sm font-semibold text-slate-800 mt-1">
                              {deal.productType}
                            </p>
                          </div>

                          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                            {deal.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-4">
                          <div>
                            <p className="text-xs text-slate-400">Quantity</p>

                            <p className="text-sm text-slate-700 mt-0.5">
                              {deal.quantity} {deal.quantityUnit}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Currency</p>

                            <p className="text-sm text-slate-700 mt-0.5">{deal.currency}</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Required By</p>

                            <p className="text-sm text-slate-700 mt-0.5">
                              {formatDate(deal.requiredByDate)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-400">Represented Party</p>

                          <p className="text-sm text-slate-700 mt-0.5">{deal.ownPartyName}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No deals"
                      message="This mandate is not attached to any deals yet."
                    />
                  )}
                </div>
              )}

              {/* Requests */}

              {tab === 'requests' && (
                <div className="space-y-3">
                  {requests.length ? (
                    requests.map((request) => (
                      <div key={request.id} className="border border-slate-100 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            {request.requestCode && (
                              <p className="font-mono text-xs text-slate-400">
                                {request.requestCode}
                              </p>
                            )}

                            <p className="text-sm font-semibold text-slate-800 mt-1">
                              {(request as any).productType ?? (request as any).category ?? 'Commodity Request'}
                            </p>
                          </div>

                          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                            {request.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                          <div>
                            <p className="text-xs text-slate-400">Quantity</p>

                            <p className="text-sm text-slate-700 mt-0.5">
                              {request.quantity} {request.quantityUnit}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Currency</p>

                            <p className="text-sm text-slate-700 mt-0.5">{request.currency}</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Delivery</p>

                            <p className="text-sm text-slate-700 mt-0.5">
                              {request.deliveryCountry ?? '—'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Required By</p>

                            <p className="text-sm text-slate-700 mt-0.5">
                              {formatDate(request.requiredByDate)}
                            </p>
                          </div>
                        </div>

                        {request.buyerCompanyName && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-400">Buyer Client</p>

                            <p className="text-sm text-slate-700 mt-0.5">
                              {request.buyerCompanyName}
                              {request.buyerCountry ? ` · ${request.buyerCountry}` : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No requests"
                      message="This mandate has not submitted any commodity requests."
                    />
                  )}
                </div>
              )}

              {/* Commissions */}

              {tab === 'commissions' && (
                <div className="space-y-3">
                  {commissions.length ? (
                    commissions.map((commission) => (
                      <div key={commission.id} className="border border-slate-100 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-mono text-xs text-slate-400">
                              {commission.commissionCode}
                            </p>

                            <p className="text-sm font-semibold text-slate-800 mt-1">
                              {commission.productType}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">{commission.inquiryCode}</p>
                          </div>

                          <span
                            className="px-2 py-1 rounded-md text-xs font-medium"
                            style={{
                              background:
                                commission.status === 'paid'
                                  ? 'var(--color-success-bg)'
                                  : commission.status === 'cancelled'
                                    ? 'var(--color-danger-bg)'
                                    : 'var(--color-warning-bg)',

                              color:
                                commission.status === 'paid'
                                  ? 'var(--color-success)'
                                  : commission.status === 'cancelled'
                                    ? 'var(--color-danger)'
                                    : 'var(--color-warning)'
                            }}
                          >
                            {commission.status}
                          </span>
                        </div>

                        <div className="flex items-end justify-between mt-4">
                          <div>
                            <p className="text-xs text-slate-400">Commission</p>

                            <p className="text-base font-semibold text-slate-800 mt-0.5">
                              {formatAmount(commission.amount, commission.currency)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-slate-400">Payment Date</p>

                            <p className="text-sm text-slate-700 mt-0.5">
                              {formatDate(commission.paymentDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No commissions"
                      message="No commission records exist for this mandate."
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Documents */}

          <Card title="KYC Documents" icon={<FileText size={16} />}>
            {documents.length ? (
              <div className="space-y-2">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100">
                        <FileText size={15} className="text-slate-400" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {(document as any).documentLabel ?? document.documentType}
                        </p>

                        <p className="text-xs text-slate-400 truncate">{document.fileName}</p>
                      </div>
                    </div>

                    {document.downloadUrl && (
                      <a
                        href={document.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        <Eye size={14} />
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No documents"
                message="No KYC documents have been uploaded for this mandate."
              />
            )}
          </Card>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            RIGHT
        ──────────────────────────────────────────────────────────────── */}

        <div className="space-y-5">
          {/* Company */}

          <Card title="Company Details" icon={<Building2 size={16} />}>
            <DetailRow
              label="Mandate Code"
              value={<span className="font-mono">{current.mandateCode}</span>}
            />

            <DetailRow label="Company" value={current.companyName} />

            <DetailRow label="Country" value={current.country} />

            <DetailRow label="Reg. Number" value={current.businessRegistrationNo} />

            <DetailRow
              label="Represents"
              value={<RepresentsBadge represents={current.represents} />}
            />

            <DetailRow label="Contact" value={current.contactPerson} />

            <DetailRow
              label="Email"
              value={
                current.email ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" />
                    {current.email}
                  </span>
                ) : null
              }
            />

            <DetailRow
              label="Phone"
              value={
                current.phone ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    {current.phone}
                  </span>
                ) : null
              }
            />

            <DetailRow
              label="WhatsApp"
              value={
                current.whatsapp ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle size={13} className="text-slate-400" />
                    {current.whatsapp}
                  </span>
                ) : null
              }
            />
          </Card>

          {/* Mandate description */}

          {current.description && (
            <Card title="Mandate Scope" icon={<Globe2 size={16} />}>
              <p className="text-sm leading-6 text-slate-600 whitespace-pre-wrap">
                {current.description}
              </p>
            </Card>
          )}

          {/* KYC */}

          <Card title="KYC" icon={<ShieldCheck size={16} />}>
            <DetailRow label="Status" value={<KycBadge status={current.kycStatus} />} />

            <DetailRow label="Submitted" value={formatDate(current.kycSubmittedAt)} />

            <DetailRow label="Reviewed" value={formatDate(current.kycReviewedAt)} />

            <DetailRow label="Reviewed By" value={current.kycReviewedByName} />

            {current.rejectionReason && (
              <div className="mt-3 p-3 rounded-lg bg-danger-bg">
                <p className="text-xs font-semibold text-danger">Rejection Reason</p>

                <p className="text-sm text-danger mt-1">{current.rejectionReason}</p>
              </div>
            )}
          </Card>

          {/* Exchange Access */}

          <Card title="Exchange Access" icon={<KeyRound size={16} />}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Exchange login</p>

                <p className="text-xs text-slate-400 mt-0.5">
                  Access is granted when an Exchange password exists.
                </p>
              </div>

              <span
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                style={{
                  background: current.hasExchangeAccess
                    ? 'var(--color-success-bg)'
                    : 'var(--color-slate-100)',

                  color: current.hasExchangeAccess
                    ? 'var(--color-success)'
                    : 'var(--color-slate-600)'
                }}
              >
                {current.hasExchangeAccess ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 mb-3">
                {current.hasExchangeAccess ? 'Reset Exchange Password' : 'Set Exchange Password'}
              </p>

              <div className="space-y-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700"
                  >
                    <Eye size={14} />

                    {showPassword ? 'Hide password' : 'Show password'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSetPassword}
                    disabled={settingPassword}
                    className="disabled:opacity-50"
                    style={primaryBtnStyle}
                  >
                    {settingPassword
                      ? 'Saving…'
                      : current.hasExchangeAccess
                        ? 'Reset Password'
                        : 'Set Password'}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Internal notes */}

          {(current as any).notes && (
            <Card title="Internal Notes" icon={<FileText size={16} />}>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-6">
                {(current as any).notes}
              </p>
            </Card>
          )}

          {/* System information */}

          <Card title="System Information" icon={<CalendarDays size={16} />}>
            <DetailRow label="Created" value={formatDateTime(current.createdAt)} />

            <DetailRow label="Created By" value={current.createdByName} />

            <DetailRow label="Updated" value={formatDateTime(current.updatedAt)} />

            <DetailRow label="Last Login" value={formatDateTime(current.lastLoginAt)} />

            <DetailRow label="Active" value={current.isActive ? 'Yes' : 'No'} />
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="text-center py-10">
      <div className="w-10 h-10 mx-auto rounded-full bg-slate-50 flex items-center justify-center">
        <FileText size={17} className="text-slate-300" />
      </div>

      <p className="text-sm font-medium text-slate-500 mt-3">{title}</p>

      <p className="text-xs text-slate-400 mt-1">{message}</p>
    </div>
  )
}
