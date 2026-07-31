// src/renderer/src/modules/kyc/KycQueuePage.tsx
// PART 1/2

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CheckCircle2, Clock3, XCircle, ShieldCheck, Eye, RefreshCcw } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select'

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '../../components/ui/table'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu'

import { MoreHorizontal, Building2 } from 'lucide-react'

import { KycStatusBadge } from '../../components/ui/StatusBadge'
import { Pagination } from '../../components/ui/Pagination'
import { useToast } from '../auth/ToastContext'
import { kycApi, type KycEntity, type KycStatus, type KycQueueItem } from './kyc.api'
import { useCallback, useEffect } from 'react'
import { useKycActions } from './useKycActions'
import { RejectionModal } from './rejectionModal'

type EntityFilter = 'all' | 'buyer' | 'seller'
type StatusFilter = 'all' | 'pending' | 'under_review' | 'approved' | 'rejected'

export function KycQueuePage() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')

  const [entity, setEntity] = useState<EntityFilter>('all')

  const [status, setStatus] = useState<StatusFilter>('pending')
  const [page, setPage] = useState(1)

  const toast = useToast()
  const [rawRows, setRawRows] = useState<KycQueueItem[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, review: 0, approved: 0, rejected: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)

  const fetchData = useCallback(async () => {
    setIsFetching(true)
    try {
      const [queueRes, dashRes] = await Promise.all([
        kycApi.getQueue({
          entity: entity === 'all' ? undefined : (entity as KycEntity),
          status: status === 'all' ? undefined : (status as KycStatus)
        }),
        kycApi.getDashboard()
      ])

      if (queueRes.success) setRawRows(queueRes.data)
      if (dashRes.success) {
        setStats({
          total: queueRes.success ? queueRes.data.length : 0,
          pending: dashRes.data.pending,
          review: dashRes.data.underReview,
          approved: queueRes.success
            ? queueRes.data.filter((r) => r.kycStatus === 'approved').length
            : 0,
          rejected: queueRes.success
            ? queueRes.data.filter((r) => r.kycStatus === 'rejected').length
            : 0
        })
      }
    } catch (err) {
      toast.error('Failed to load KYC queue')
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }, [entity, status])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Client-side search logic
  const filteredRows = useMemo(() => {
    if (!search) return rawRows
    const lower = search.toLowerCase()
    return rawRows.filter(
      (r) => r.companyName.toLowerCase().includes(lower) || r.code.toLowerCase().includes(lower)
    )
  }, [rawRows, search])

  // Client-side pagination logic
  const PAGE_SIZE = 24
  const rows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE) || 1

  const { handleKycAction, isActionLoading } = useKycActions(fetchData)
  const [rejectTarget, setRejectTarget] = useState<{ entity: KycEntity; id: string } | null>(null)
  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KYC Approval Queue</h1>

          <p className="text-muted-foreground mt-2">
            Review buyer and seller verification requests before granting Exchange access.
          </p>
        </div>

        <Button variant="outline" onClick={fetchData} disabled={isFetching}>
          {' '}
          <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI */}

      <div className="grid gap-5 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>

              <h2 className="mt-2 text-3xl font-bold">{stats.pending}</h2>
            </div>

            <Clock3 className="h-10 w-10 text-amber-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Under Review</p>

              <h2 className="mt-2 text-3xl font-bold">{stats.review}</h2>
            </div>

            <ShieldCheck className="h-10 w-10 text-blue-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>

              <h2 className="mt-2 text-3xl font-bold">{stats.approved}</h2>
            </div>

            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>

              <h2 className="mt-2 text-3xl font-bold">{stats.rejected}</h2>
            </div>

            <XCircle className="h-10 w-10 text-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company..."
                className="pl-10"
              />
            </div>

            <Select value={entity} onValueChange={(v) => setEntity(v as EntityFilter)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>

                <SelectItem value="buyer">Buyers</SelectItem>

                <SelectItem value="seller">Sellers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>

              <TabsTrigger value="under_review">Under Review</TabsTrigger>

              <TabsTrigger value="approved">Approved</TabsTrigger>

              <TabsTrigger value="rejected">Rejected</TabsTrigger>

              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Table */}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>

                <TableHead>Type</TableHead>

                <TableHead>Country</TableHead>

                <TableHead>Submitted</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                [...Array(8)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <div className="h-12 animate-pulse rounded-md bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-72">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Building2 className="h-14 w-14 text-muted-foreground/40" />

                      <div className="space-y-1 text-center">
                        <h3 className="font-semibold">No KYC applications found</h3>

                        <p className="text-sm text-muted-foreground">
                          Try changing the selected filters or search keyword.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((application: any) => (
                  <TableRow
                    key={`${application.entity}-${application.id}`}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{application.companyName}</p>
                        <p className="text-xs text-muted-foreground">{application.code}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={application.entity === 'buyer' ? 'default' : 'secondary'}>
                        {application.entity === 'buyer' ? 'Buyer' : 'Seller'}
                      </Badge>
                    </TableCell>

                    <TableCell>{application.country || '—'}</TableCell>

                    <TableCell>
                      {application.kycSubmittedAt
                        ? new Date(application.kycSubmittedAt).toLocaleDateString()
                        : '—'}
                    </TableCell>

                    <TableCell>
                      <KycStatusBadge status={application.kycStatus} />
                    </TableCell>
                    <TableCell align="right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => navigate(`/kyc/${application.entity}/${application.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          {/* ONLY show Move To Review when Pending */}
                          {application.kycStatus === 'pending' && (
                            <DropdownMenuItem
                              className="hover:bg-canvas-50 cursor-pointer"
                              disabled={isActionLoading}
                              onClick={() =>
                                handleKycAction(application.entity, application.id, 'review')
                              }
                            >
                              <Clock3 size={16} strokeWidth={1.5} className="mr-2 text-warning" />{' '}
                              Move To Review
                            </DropdownMenuItem>
                          )}

                          {/* ONLY show Approve/Reject when Under Review */}
                          {application.kycStatus === 'under_review' && (
                            <>
                              <DropdownMenuItem
                                className="text-success hover:bg-success-bg cursor-pointer"
                                disabled={isActionLoading}
                                onClick={() =>
                                  handleKycAction(application.entity, application.id, 'approve')
                                }
                              >
                                <CheckCircle2 size={16} strokeWidth={1.5} className="mr-2" />{' '}
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-danger hover:bg-danger-bg cursor-pointer"
                                disabled={isActionLoading}
                                onClick={() =>
                                  setRejectTarget({
                                    entity: application.entity,
                                    id: application.id
                                  })
                                }
                              >
                                <XCircle size={16} strokeWidth={1.5} className="mr-2" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>{' '}
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{rows.length}</span> of{' '}
          <span className="font-medium">{stats.total}</span> applications
        </p>

        <Pagination
          meta={{
            page,
            totalPages,
            total: filteredRows.length,
            pageSize: PAGE_SIZE
          }}
          onPageChange={setPage}
        />
      </div>

      <RejectionModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        isSubmitting={isActionLoading}
        onConfirm={async (reason) => {
          if (!rejectTarget) return
          const success = await handleKycAction(
            rejectTarget.entity,
            rejectTarget.id,
            'reject',
            reason
          )
          if (success) setRejectTarget(null)
        }}
      />
    </div>
  )
}

export default KycQueuePage
