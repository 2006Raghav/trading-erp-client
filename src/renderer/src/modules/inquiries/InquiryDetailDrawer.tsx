// src/renderer/src/modules/inquiries/InquiryDetailDrawer.tsx

import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '../../components/ui/sheet'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select'
import {
  Building2,
  Calendar,
  Globe2,
  Mail,
  User,
  Package,
  DollarSign,
  Truck,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCheck,
  Trash2,
  } from 'lucide-react'
import {
  adminInquiriesApi,
  type AdminCommodityRequest,
  type RequestStatus
} from './adminInquiries.api'
import { DocumentPanel } from './DocumentPanel'

interface InquiryDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  request: AdminCommodityRequest | null
  onRefresh: () => void
  onOpenAssignModal: (req: AdminCommodityRequest) => void
}

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  open: {
    label: 'Open',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Clock
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock
  },
  sourcing: {
    label: 'Sourcing (Assigned)',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: UserCheck
  },
  quoted: {
    label: 'Quoted',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: DollarSign
  },
  closed_won: {
    label: 'Closed Won (Deal)',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2
  },
  closed_lost: {
    label: 'Closed Lost',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle
  }
}

export function InquiryDetailDrawer({
  isOpen,
  onClose,
  request,
  onRefresh,
  onOpenAssignModal
}: InquiryDetailDrawerProps) {
  const [internalNotes, setInternalNotes] = useState(request?.internalNotes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [unassigning, setUnassigning] = useState(false)

  React.useEffect(() => {
    if (request) {
      setInternalNotes(request.internalNotes || '')
    }
  }, [request])

  if (!request) return null

  const statusInfo = STATUS_CONFIG[request.status] || STATUS_CONFIG.open
  const StatusIcon = statusInfo.icon

  const handleStatusChange = async (newStatus: RequestStatus) => {
    try {
      setUpdatingStatus(true)
      await adminInquiriesApi.update(request.id, { status: newStatus })
      onRefresh()
    } catch (err) {
      console.error('Failed to update status', err)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSaveInternalNotes = async () => {
    try {
      setSavingNotes(true)
      await adminInquiriesApi.update(request.id, { internalNotes: internalNotes.trim() || null })
      onRefresh()
    } catch (err) {
      console.error('Failed to save internal notes', err)
    } finally {
      setSavingNotes(false)
    }
  }

  const handleUnassignSeller = async () => {
    if (!window.confirm('Are you sure you want to remove the assigned seller from this enquiry?')) {
      return
    }

    try {
      setUnassigning(true)
      await adminInquiriesApi.unassignSeller(request.id)
      onRefresh()
    } catch (err) {
      console.error('Failed to unassign seller', err)
    } finally {
      setUnassigning(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-6xl overflow-y-auto p-0 border-l border-[var(--color-slate-200)] shadow-2xl flex flex-col bg-white">
        {/* Header */}
        <SheetHeader className="p-6 border-b border-[var(--color-slate-100)] bg-[var(--color-canvas-50)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[var(--color-cobalt-600)] tracking-wider">
                  {request.referenceNumber}
                </span>
                <span className="text-[var(--color-slate-300)]">·</span>
                <span className="text-xs text-[var(--color-slate-500)] flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(request.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <SheetTitle className="text-xl font-bold text-[var(--color-ink-900)] mt-1">
                {request.displayName}
              </SheetTitle>
              <SheetDescription className="text-xs text-[var(--color-slate-500)]">
                Submitted by {request.buyerCompanyName} ({request.buyerCountry || 'Global'})
              </SheetDescription>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-2">
              <span
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold leading-none border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{statusInfo.label}</span>
              </span>
            </div>
          </div>

          {/* Quick status updater */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--color-slate-200)]">
            <span className="text-xs font-semibold text-[var(--color-slate-600)]">
              Update Status:
            </span>
            <Select
              value={request.status}
              onValueChange={(val) => handleStatusChange(val as RequestStatus)}
              disabled={updatingStatus}
            >
              <SelectTrigger className="h-8 text-xs w-[180px] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open (New)</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="sourcing">Sourcing (Assigned)</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="closed_won">Closed Won (Deal)</SelectItem>
                <SelectItem value="closed_lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>

            {updatingStatus && <Loader2 className="h-4 w-4 animate-spin text-[var(--color-cobalt-600)]" />}
          </div>
        </SheetHeader>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {/* Left Column: Documents */}
          <div className="col-span-1 space-y-6">
            <DocumentPanel inquiryId={request.id} />
          </div>

          {/* Right Column: Existing Details */}
          <div className="col-span-2 space-y-6">
            {/* Custom Category Banner */}
          {request.isCustomCategory && (
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Custom Category Sourcing Request
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  Family: <strong>{request.customFamilyName}</strong> · Type:{' '}
                  <strong>{request.customTypeName}</strong>
                </p>
                {request.customCategoryNote && (
                  <p className="text-xs text-amber-700 mt-1 italic">
                    Note: "{request.customCategoryNote}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Assigned Seller Card */}
          <div className="rounded-xl border border-[var(--color-slate-200)] bg-[var(--color-canvas-50)]/50 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[var(--color-cobalt-600)]" />
                <h4 className="text-sm font-bold text-[var(--color-ink-900)]">
                  Assigned Seller / Supplier
                </h4>
              </div>

              {request.assignedSellerId && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onOpenAssignModal(request)}
                  >
                    Change
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleUnassignSeller}
                    disabled={unassigning}
                  >
                    {unassigning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              )}
            </div>

            {request.assignedSellerId ? (
              <div className="mt-3 p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[var(--color-ink-900)]">
                        {request.sellerCompanyName}
                      </p>
                      <Badge variant="outline" className="text-[10px] font-mono uppercase">
                        {request.sellerCode || 'SELLER'}
                      </Badge>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px]">
                        Active Supplier
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-[var(--color-slate-600)]">
                      {request.sellerCountry && (
                        <span className="flex items-center gap-1">
                          <Globe2 className="h-3 w-3" />
                          {request.sellerCountry}
                        </span>
                      )}
                      {request.sellerContactPerson && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {request.sellerContactPerson}
                        </span>
                      )}
                      {request.sellerEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {request.sellerEmail}
                        </span>
                      )}
                    </div>

                    {request.sellerAssignmentNotes && (
                      <div className="mt-2.5 p-2 rounded bg-white/80 border border-emerald-200 text-xs text-[var(--color-slate-700)]">
                        <span className="font-semibold text-[var(--color-ink-900)]">Handover Note: </span>
                        {request.sellerAssignmentNotes}
                      </div>
                    )}
                  </div>
                </div>

                {request.assignedSellerAt && (
                  <p className="text-[10px] text-[var(--color-slate-400)] mt-2">
                    Assigned on {new Date(request.assignedSellerAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3 p-4 rounded-lg border border-dashed border-[var(--color-slate-300)] bg-white text-center">
                <p className="text-xs text-[var(--color-slate-500)] mb-3">
                  No verified seller has been assigned to source this enquiry yet.
                </p>
                <Button
                  size="sm"
                  className="bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)] text-white text-xs h-8"
                  onClick={() => onOpenAssignModal(request)}
                >
                  <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                  Assign Verified Seller
                </Button>
              </div>
            )}
          </div>

          {/* Specifications & Commercials Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="p-3.5 rounded-lg border border-[var(--color-slate-200)] bg-white">
              <span className="text-[11px] font-semibold text-[var(--color-slate-400)] uppercase tracking-wider flex items-center gap-1">
                <Package className="h-3.5 w-3.5 text-[var(--color-cobalt-600)]" />
                Required Quantity
              </span>
              <p className="mt-1 text-lg font-bold text-[var(--color-ink-900)]">
                {request.quantity.toLocaleString()} {request.quantityUnit}
              </p>
            </div>

            {/* Target Price */}
            <div className="p-3.5 rounded-lg border border-[var(--color-slate-200)] bg-white">
              <span className="text-[11px] font-semibold text-[var(--color-slate-400)] uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                Target Price Range
              </span>
              <p className="mt-1 text-lg font-bold text-[var(--color-ink-900)]">
                {request.targetPriceMin != null || request.targetPriceMax != null ? (
                  <>
                    {request.targetPriceMin != null && request.targetPriceMax != null
                      ? `${request.targetPriceMin.toLocaleString()} - ${request.targetPriceMax.toLocaleString()}`
                      : (request.targetPriceMin ?? request.targetPriceMax)?.toLocaleString()}{' '}
                    <span className="text-xs font-medium text-[var(--color-slate-500)]">
                      {request.currency}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-normal text-[var(--color-slate-400)]">Open Market</span>
                )}
              </p>
            </div>
          </div>

          {/* Logistics & Delivery Details */}
          <div className="p-4 rounded-xl border border-[var(--color-slate-200)] bg-white space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-ink-900)] uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-[var(--color-cobalt-600)]" />
              Delivery & Logistics Specifications
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[var(--color-slate-400)] block">Destination Country:</span>
                <span className="font-semibold text-[var(--color-ink-900)]">
                  {request.deliveryCountry || 'Not Specified'}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-slate-400)] block">Delivery Terms (Incoterms):</span>
                <span className="font-semibold text-[var(--color-ink-900)]">
                  {request.deliveryTerms || 'FOB / CIF Negotiable'}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-slate-400)] block">Required By Date:</span>
                <span className="font-semibold text-[var(--color-ink-900)]">
                  {request.requiredByDate
                    ? new Date(request.requiredByDate).toLocaleDateString()
                    : 'Immediate / As Soon As Possible'}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-slate-400)] block">Purity / Grade:</span>
                <span className="font-semibold text-[var(--color-ink-900)]">
                  {request.purityRequired || request.gradeRequired
                    ? `${request.purityRequired || ''} ${request.gradeRequired || ''}`.trim()
                    : 'Standard Export Grade'}
                </span>
              </div>
            </div>

            {request.notes && (
              <div className="mt-2 pt-2 border-t border-[var(--color-slate-100)]">
                <span className="text-[var(--color-slate-400)] text-xs block">Buyer Special Notes:</span>
                <p className="text-xs text-[var(--color-slate-700)] mt-0.5 bg-[var(--color-canvas-50)] p-2.5 rounded">
                  {request.notes}
                </p>
              </div>
            )}
          </div>

          {/* Buyer Information */}
          <div className="p-4 rounded-xl border border-[var(--color-slate-200)] bg-white space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-ink-900)] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[var(--color-cobalt-600)]" />
              Applicant / Buyer Profile
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[var(--color-slate-400)] block">Company:</span>
                <span className="font-semibold text-[var(--color-ink-900)]">
                  {request.buyerCompanyName}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-slate-400)] block">Country:</span>
                <span className="font-semibold text-[var(--color-ink-900)]">
                  {request.buyerCountry || '—'}
                </span>
              </div>
              {request.buyerContactPerson && (
                <div>
                  <span className="text-[var(--color-slate-400)] block">Contact Person:</span>
                  <span className="font-semibold text-[var(--color-ink-900)]">
                    {request.buyerContactPerson}
                  </span>
                </div>
              )}
              {request.buyerEmail && (
                <div>
                  <span className="text-[var(--color-slate-400)] block">Email:</span>
                  <span className="font-semibold text-[var(--color-ink-900)]">
                    {request.buyerEmail}
                  </span>
                </div>
              )}
              {request.buyerPhone && (
                <div>
                  <span className="text-[var(--color-slate-400)] block">Phone:</span>
                  <span className="font-semibold text-[var(--color-ink-900)]">
                    {request.buyerPhone}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[var(--color-slate-400)] block">Submitted By:</span>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {request.submittedByType} {request.mandateCompanyName ? `(${request.mandateCompanyName})` : ''}
                </Badge>
              </div>
            </div>
          </div>

          {/* Internal Administrative Notes */}
          <div className="p-4 rounded-xl border border-[var(--color-slate-200)] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[var(--color-ink-900)] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[var(--color-slate-500)]" />
                Internal Staff Notes
              </h4>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={handleSaveInternalNotes}
                disabled={savingNotes}
              >
                {savingNotes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Notes'}
              </Button>
            </div>

            <Textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Record negotiation status, supplier pricing feedback, or verification remarks..."
              className="text-xs h-24 resize-none"
            />
          </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
