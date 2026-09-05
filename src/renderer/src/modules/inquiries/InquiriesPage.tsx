// src/renderer/src/modules/inquiries/InquiriesPage.tsx

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  RefreshCw,
  FileText,
  Clock,
  UserCheck,
  DollarSign,
  CheckCircle2,
  Building2,
  Globe2,
  ChevronRight,
  } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'

import {
  adminInquiriesApi,
  type AdminCommodityRequest,
  type AdminCommodityRequestFilters,
  type InquiryStats,
  type RequestStatus
} from './adminInquiries.api'
import { InquiryDetailDrawer } from './InquiryDetailDrawer'
import { AssignSellerModal } from './AssignSellerModal'
import { marketplaceApi } from '../marketplace/marketplace.api'
import type { CatalogueCategory } from '../marketplace/marketplace.api'

const STATUS_BADGE: Record<
  RequestStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  open: { label: 'Open', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  under_review: {
    label: 'Under Review',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  sourcing: {
    label: 'Sourcing (Assigned)',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200'
  },
  quoted: {
    label: 'Quoted',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200'
  },
  closed_won: {
    label: 'Closed Won',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  closed_lost: {
    label: 'Closed Lost',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200'
  }
}

export function InquiriesPage() {
  const [requests, setRequests] = useState<AdminCommodityRequest[]>([])
  const [stats, setStats] = useState<InquiryStats | null>(null)
  const [categories, setCategories] = useState<CatalogueCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned' | 'unassigned'>('all')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize] = useState(15)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Drawer & Modal State
  const [selectedRequest, setSelectedRequest] = useState<AdminCommodityRequest | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignModalRequest, setAssignModalRequest] = useState<AdminCommodityRequest | null>(null)

  // Load Categories for filter
  useEffect(() => {
    marketplaceApi.getCategories().then((res) => {
      if (res.success) setCategories(res.data)
    }).catch(console.error)
  }, [])

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const filters: AdminCommodityRequestFilters = {
        page,
        pageSize,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        assignmentStatus: assignmentFilter !== 'all' ? assignmentFilter : undefined
      }

      const res = await adminInquiriesApi.getAll(filters)
      if (res.success) {
        setRequests(res.data)
        setStats(res.stats)
        setTotal(res.meta.total)
        setTotalPages(res.meta.totalPages)

        // If drawer is open, keep selected request synchronized
        if (selectedRequest) {
          const updated = res.data.find((r) => r.id === selectedRequest.id)
          if (updated) setSelectedRequest(updated)
        }
      }
    } catch (err) {
      console.error('Failed to load inquiries', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, pageSize, search, statusFilter, categoryFilter, assignmentFilter, selectedRequest])

  useEffect(() => {
    loadData()
  }, [page, statusFilter, categoryFilter, assignmentFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      loadData()
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  const handleOpenDetail = (req: AdminCommodityRequest) => {
    setSelectedRequest(req)
    setDrawerOpen(true)
  }

  const handleOpenAssignModal = (req: AdminCommodityRequest) => {
    setAssignModalRequest(req)
    setAssignModalOpen(true)
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setAssignmentFilter('all')
    setPage(1)
  }

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    assignmentFilter !== 'all'

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink-900)]">
              Commodity Inquiries & Requests
            </h1>
            {stats && (
              <Badge variant="secondary" className="font-mono font-semibold text-xs">
                {stats.total} Total
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--color-slate-500)]">
            Review buyer sourcing requests, track procurement pipeline, and pair verified suppliers with deals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="h-9 border-[var(--color-slate-200)]"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── KPI Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Total */}
        <Card className="border-[var(--color-slate-200)] shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wider">
                Total Enquiries
              </span>
              <FileText className="h-4 w-4 text-[var(--color-cobalt-600)]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[var(--color-ink-900)]">
              {stats?.total ?? '—'}
            </p>
            <p className="text-[11px] text-[var(--color-slate-400)] mt-0.5">
              All marketplace requests
            </p>
          </CardContent>
        </Card>

        {/* Open / Under Review */}
        <Card className="border-[var(--color-slate-200)] shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Open / Review
              </span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[var(--color-ink-900)]">
              {stats ? stats.open + stats.underReview : '—'}
            </p>
            <p className="text-[11px] text-[var(--color-slate-400)] mt-0.5">
              Needs supplier assignment
            </p>
          </CardContent>
        </Card>

        {/* Sourcing (Assigned) */}
        <Card className="border-[var(--color-slate-200)] shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                Sourcing Active
              </span>
              <UserCheck className="h-4 w-4 text-purple-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[var(--color-ink-900)]">
              {stats?.sourcing ?? '—'}
            </p>
            <p className="text-[11px] text-[var(--color-slate-400)] mt-0.5">
              Assigned to suppliers
            </p>
          </CardContent>
        </Card>

        {/* Quoted */}
        <Card className="border-[var(--color-slate-200)] shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Quoted
              </span>
              <DollarSign className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[var(--color-ink-900)]">
              {stats?.quoted ?? '—'}
            </p>
            <p className="text-[11px] text-[var(--color-slate-400)] mt-0.5">
              Offers submitted to buyer
            </p>
          </CardContent>
        </Card>

        {/* Deals Won */}
        <Card className="border-[var(--color-slate-200)] shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Closed Won
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[var(--color-ink-900)]">
              {stats?.closedWon ?? '—'}
            </p>
            <p className="text-[11px] text-[var(--color-slate-400)] mt-0.5">
              Successful transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Status Tabs & Filter Controls ────────────────────────────────────── */}
      <div className="space-y-4">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v)
            setPage(1)
          }}
        >
          <TabsList className="bg-[var(--color-canvas-100)] p-1 h-auto flex flex-wrap gap-1">
            <TabsTrigger value="all" className="text-xs py-1.5 px-3">
              All Requests {stats ? `(${stats.total})` : ''}
            </TabsTrigger>
            <TabsTrigger value="open" className="text-xs py-1.5 px-3">
              Open {stats ? `(${stats.open})` : ''}
            </TabsTrigger>
            <TabsTrigger value="under_review" className="text-xs py-1.5 px-3">
              Under Review {stats ? `(${stats.underReview})` : ''}
            </TabsTrigger>
            <TabsTrigger value="sourcing" className="text-xs py-1.5 px-3">
              Sourcing (Assigned) {stats ? `(${stats.sourcing})` : ''}
            </TabsTrigger>
            <TabsTrigger value="quoted" className="text-xs py-1.5 px-3">
              Quoted {stats ? `(${stats.quoted})` : ''}
            </TabsTrigger>
            <TabsTrigger value="closed_won" className="text-xs py-1.5 px-3">
              Closed Won {stats ? `(${stats.closedWon})` : ''}
            </TabsTrigger>
            <TabsTrigger value="closed_lost" className="text-xs py-1.5 px-3">
              Closed Lost {stats ? `(${stats.closedLost})` : ''}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3.5 rounded-xl border border-[var(--color-slate-200)] shadow-sm">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-slate-400)]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search commodity, buyer, country, supplier..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                setCategoryFilter(val)
                setPage(1)
              }}
            >
              <SelectTrigger className="h-9 text-xs w-[160px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Seller Assignment Filter */}
            <Select
              value={assignmentFilter}
              onValueChange={(val: any) => {
                setAssignmentFilter(val)
                setPage(1)
              }}
            >
              <SelectTrigger className="h-9 text-xs w-[170px]">
                <SelectValue placeholder="All Assignments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="unassigned">Unassigned (Needs Seller)</SelectItem>
                <SelectItem value="assigned">Assigned to Seller</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 text-xs text-[var(--color-slate-500)] hover:text-[var(--color-ink-900)]"
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="text-xs text-[var(--color-slate-400)] font-medium">
            Showing {requests.length} of {total}
          </div>
        </div>
      </div>

      {/* ── Enquiries Table ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-slate-200)] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-slate-200)] bg-[var(--color-canvas-50)] text-[11px] font-bold text-[var(--color-slate-500)] uppercase tracking-wider">
                <th className="py-3 px-4">Reference & Date</th>
                <th className="py-3 px-4">Commodity / Specs</th>
                <th className="py-3 px-4">Buyer Company</th>
                <th className="py-3 px-4">Volume & Target Price</th>
                <th className="py-3 px-4">Assigned Supplier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-slate-100)] text-xs">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16 mt-1" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20 mt-1" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-16 mt-1" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16 mt-1" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-7 w-28 rounded-full" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-8 w-16 ml-auto rounded" /></td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--color-slate-500)]">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-10 w-10 text-[var(--color-slate-300)] mb-3" />
                      <p className="font-semibold text-sm text-[var(--color-ink-900)]">No enquiries found</p>
                      <p className="text-xs text-[var(--color-slate-400)] mt-1">
                        {hasActiveFilters
                          ? 'Try adjusting your search criteria or filters.'
                          : 'No buyer commodity requests have been submitted yet.'}
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearFilters}
                          className="mt-3 text-xs"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const statusConfig = STATUS_BADGE[req.status] || STATUS_BADGE.open

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-[var(--color-canvas-50)]/70 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(req)}
                    >
                      {/* Reference & Date */}
                      <td className="py-3.5 px-4 font-mono font-medium text-[var(--color-cobalt-600)]">
                        <div>{req.referenceNumber}</div>
                        <div className="text-[10px] text-[var(--color-slate-400)] font-sans mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>

                      {/* Commodity / Specs */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[var(--color-ink-900)] flex items-center gap-1.5">
                          {req.displayName}
                          {req.isCustomCategory && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1 border-amber-300 text-amber-700 bg-amber-50">
                              Custom
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--color-slate-500)] mt-0.5">
                          {req.purityRequired || req.gradeRequired ? (
                            <span>{req.purityRequired || ''} {req.gradeRequired || ''}</span>
                          ) : (
                            <span>{req.categoryName || 'General Commodity'}</span>
                          )}
                        </div>
                      </td>

                      {/* Buyer Company */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[var(--color-ink-900)]">
                          {req.buyerCompanyName}
                        </div>
                        <div className="text-[11px] text-[var(--color-slate-400)] flex items-center gap-1 mt-0.5">
                          <Globe2 className="h-3 w-3" />
                          {req.deliveryCountry || req.buyerCountry || 'Global'}
                        </div>
                      </td>

                      {/* Volume & Target Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--color-ink-900)]">
                          {req.quantity.toLocaleString()} {req.quantityUnit}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                          {req.targetPriceMin != null || req.targetPriceMax != null ? (
                            <>
                              {req.targetPriceMin != null && req.targetPriceMax != null
                                ? `${req.targetPriceMin} - ${req.targetPriceMax}`
                                : req.targetPriceMin ?? req.targetPriceMax}{' '}
                              {req.currency}
                            </>
                          ) : (
                            <span className="text-[var(--color-slate-400)]">Open Target</span>
                          )}
                        </div>
                      </td>

                      {/* Assigned Supplier */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        {req.assignedSellerId ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                            <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="font-medium truncate max-w-[140px]">
                              {req.sellerCompanyName}
                            </span>
                            <button
                              onClick={() => handleOpenAssignModal(req)}
                              className="ml-1 text-[10px] text-emerald-600 hover:text-emerald-900 font-semibold underline"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-dashed border-[var(--color-slate-300)] text-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-50)]"
                            onClick={() => handleOpenAssignModal(req)}
                          >
                            <UserCheck className="mr-1 h-3 w-3" />
                            + Assign Seller
                          </Button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-semibold text-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-50)]"
                          onClick={() => handleOpenDetail(req)}
                        >
                          Review
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-slate-200)] bg-[var(--color-canvas-50)] text-xs text-[var(--color-slate-600)]">
            <div>
              Page {page} of {totalPages} ({total} entries)
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Drawer ────────────────────────────────────────────────────── */}
      <InquiryDetailDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedRequest(null)
        }}
        request={selectedRequest}
        onRefresh={() => loadData()}
        onOpenAssignModal={(req) => {
          setDrawerOpen(false)
          handleOpenAssignModal(req)
        }}
      />

      {/* ── Assign Seller Modal ──────────────────────────────────────────────── */}
      {assignModalRequest && (
        <AssignSellerModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false)
            setAssignModalRequest(null)
          }}
          requestId={assignModalRequest.id}
          requestTitle={assignModalRequest.displayName}
          buyerName={assignModalRequest.buyerCompanyName}
          quantityStr={`${assignModalRequest.quantity.toLocaleString()} ${assignModalRequest.quantityUnit}`}
          currentSellerId={assignModalRequest.assignedSellerId}
          currentSellerName={assignModalRequest.sellerCompanyName}
          onSuccess={() => {
            loadData()
          }}
        />
      )}
    </div>
  )
}
export default InquiriesPage
