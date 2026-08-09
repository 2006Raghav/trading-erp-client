// src/modules/commodity-requests/CommodityRequestsPage.tsx

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, Search, ClipboardList, Filter } from 'lucide-react'

import { commodityRequestsApi } from './commodityRequests.api'
import { marketplaceApi, type MarketplaceCategory } from '../marketplace/marketplace.api'

import { CommodityRequestSheet } from './CommodityRequestSheet'
import { CommodityRequestDetail } from './CommodityRequestDetail'

import { useToast } from '../auth/ToastContext'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select'

import { Badge } from '../../components/ui/badge'

import { Skeleton } from '../../components/ui/skeleton'

import type {
  CommodityRequest,
  CommodityRequestDetailModel,
  CommodityRequestFilters
} from './commodityRequests.api'

import type { ProductCategory } from '../../lib/types'

export function CommodityRequestsPage() {
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [sheetOpen, setSheetOpen] = useState(false)

  const [detailOpen, setDetailOpen] = useState(false)

  const [selectedRequest, setSelectedRequest] = useState<CommodityRequestDetailModel | null>(null)

  const [categories, setCategories] = useState<ProductCategory[]>([])

  const [requests, setRequests] = useState<CommodityRequest[]>([])

  const [meta, setMeta] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 1
  })

  const [filters, setFilters] = useState<CommodityRequestFilters>({
    page: 1,
    pageSize: 12
  })
  const activeFilters = useMemo(() => {
    let count = 0

    if (filters.search) count++
    if (filters.status) count++
    if (filters.categoryId) count++

    return count
  }, [filters])

  const loadCategories = useCallback(async () => {
    try {
      const res = await marketplaceApi.getCategories()

      if (res.success) {
        setCategories(res.data)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const loadRequests = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      try {
        const res = await commodityRequestsApi.getAll(filters)

        if (res.success) {
          setRequests(res.data)
          setMeta(res.meta)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load commodity requests')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [filters, toast]
  )

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  useEffect(() => {
    marketplaceApi
      .getCategories()
      .then((res) => {
        if (res.success) {
          setCategories(res.data)
        }
      })
      .catch(() => {
        toast.error('Failed to load commodity categories')
      })
  }, [])

  function updateFilters(values: Partial<CommodityRequestFilters>) {
    setFilters((prev) => ({
      ...prev,
      ...values,
      page: 1
    }))
  }

  function resetFilters() {
    setFilters({
      page: 1,
      pageSize: 12
    })
  }

  function handleRefresh() {
    loadRequests(true)
  }

  function handleView(request: CommodityRequest) {
    setSelectedRequest(request)
    setDetailOpen(true)
  }

  function handleCreated() {
    setSheetOpen(false)

    toast.success('Commodity request submitted successfully.')

    loadRequests(true)
  }

  function changePage(page: number) {
    setFilters((prev) => ({
      ...prev,
      page
    }))
  }

  const hasRequests = requests.length > 0

  const canPrevious = meta.page > 1

  const canNext = meta.page < meta.totalPages

  function statusVariant(status: string) {
    switch (status.toLowerCase()) {
      case 'open':
        return 'default'

      case 'assigned':
        return 'secondary'

      case 'in_progress':
        return 'outline'

      case 'closed':
        return 'secondary'

      case 'cancelled':
        return 'destructive'

      default:
        return 'outline'
    }
  }
  return (
    <>
      <div className="space-y-6">
        {/* Header */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Commodity Requests</h1>

            <p className="mt-1 text-muted-foreground">
              Track all procurement requests submitted to the Exchange.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              onClick={() => setSheetOpen(true)}
              className="bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>
        </div>

        {/* Filters */}

        <Card>
          <CardContent className="p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="xl:col-span-2">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Search
                </label>

                <div className="relative">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />

                  <Input
                    className="pl-9"
                    placeholder="Search category or notes..."
                    value={filters.search ?? ''}
                    onChange={(e) =>
                      updateFilters({
                        search: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </label>

                <Select
                  value={filters.status ?? 'all'}
                  onValueChange={(value) =>
                    updateFilters({
                      status: value === 'all' ? '' : value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Category
                </label>

                <Select
                  value={filters.categoryId ?? 'all'}
                  onValueChange={(value) =>
                    updateFilters({
                      categoryId: value === 'all' ? '' : value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>

                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFilters > 0 && (
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <Filter className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading */}

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>

                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty */}

        {!loading && !hasRequests && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <ClipboardList className="mb-5 h-14 w-14 text-muted-foreground" />

              <h2 className="text-xl font-semibold">No Commodity Requests</h2>

              <p className="mt-2 max-w-md text-muted-foreground">
                Submit your first procurement request and our exchange team will begin sourcing
                suitable suppliers.
              </p>

              <Button
                className="mt-6 bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)]"
                onClick={() => setSheetOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Request Commodity
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cards */}

        {!loading && hasRequests && (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {requests.map((request) => (
                <Card
                  key={request.id}
                  className="transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{request.categoryName}</CardTitle>

                        <CardDescription className="mt-1">
                          {request.quantity} {request.quantityUnit}
                        </CardDescription>
                      </div>

                      <Badge variant={statusVariant(request.status) as any}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Purity</span>

                      <span>{request.purityRequired || '—'}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Grade</span>

                      <span>{request.gradeRequired || '—'}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>

                      <span>{request.deliveryCountry || '—'}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>

                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>

                    <Button
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={() => handleView(request)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}

            <div className="flex items-center justify-between border-t pt-5">
              <p className="text-sm text-muted-foreground">
                Showing page {meta.page} of {meta.totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!canPrevious}
                  onClick={() => changePage(meta.page - 1)}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  disabled={!canNext}
                  onClick={() => changePage(meta.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Request Sheet */}

      <CommodityRequestSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        categories={categories}
        onSuccess={handleCreated}
      />

      {/* Detail */}

      {selectedRequest && (
        <CommodityRequestDetail
          open={detailOpen}
          onOpenChange={setDetailOpen}
          request={selectedRequest}
        />
      )}
    </>
  )
}
