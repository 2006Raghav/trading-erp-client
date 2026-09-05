import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Clock3,
  Eye,
  MoreHorizontal,
  RefreshCcw,
  Search,
  ShieldCheck,
  } from 'lucide-react'

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

import { KycStatusBadge } from '../../components/ui/StatusBadge'
import { Pagination } from '../../components/ui/Pagination'
import { useToast } from '../auth/ToastContext'

import { kycApi } from './kyc.api'
import type { KycEntity, KycQueueItem } from './kyc.types'

import { useKycActions } from './useKycActions'
import { RejectionModal } from './rejectionModal'

type EntityFilter = 'all' | KycEntity
type StatusFilter = 'all' | 'pending' | 'under_review' | 'approved' | 'rejected'

const PAGE_SIZE = 24

function getDaysWaiting(date: string | null | undefined): number | null {
  if (!date) return null

  const submitted = new Date(date)

  if (Number.isNaN(submitted.getTime())) {
    return null
  }

  const diff = Date.now() - submitted.getTime()

  if (diff <= 0) {
    return 0
  }

  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function formatDate(date: string | null | undefined) {
  if (!date) return '—'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return '—'
  }

  return parsed.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function getEntityLabel(entity: KycEntity) {
  switch (entity) {
    case 'buyer':
      return 'Buyer'
    case 'seller':
      return 'Seller'
    case 'mandate':
      return 'Mandate'
    default:
      return entity
  }
}

function getRepresentsLabel(entity: KycEntity, represents?: 'buyer_side' | 'seller_side' | null) {
  if (entity !== 'mandate' || !represents) {
    return '—'
  }

  return represents === 'buyer_side' ? 'Buyer Side' : 'Seller Side'
}

export function KycQueuePage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [entity, setEntity] = useState<EntityFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('pending')
  const [page, setPage] = useState(1)

  const [rawRows, setRawRows] = useState<KycQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)

  const [dashboard, setDashboard] = useState({
    pending: 0,
    underReview: 0
  })

  const [rejectTarget, setRejectTarget] = useState<{
    entity: KycEntity
    id: string
  } | null>(null)

  const fetchData = useCallback(async () => {
    setIsFetching(true)

    try {
      const [queueRes, dashboardRes] = await Promise.all([
        kycApi.getQueue({
          entity: entity === 'all' ? undefined : entity,
          status: status === 'all' ? undefined : status
        }),
        kycApi.getDashboard()
      ])

      if (queueRes.success) {
        setRawRows(queueRes.data)
      }

      if (dashboardRes.success) {
        setDashboard({
          pending: dashboardRes.data.pending,
          underReview: dashboardRes.data.underReview
        })
      }

      setPage(1)
    } catch {
      toast.error('Failed to load KYC queue')
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }, [entity, status, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filtered = !normalizedSearch
      ? rawRows
      : rawRows.filter((row) => {
          const values = [row.companyName, row.contactPerson, row.code, row.email, row.country]

          return values.some((value) => value?.toLowerCase().includes(normalizedSearch))
        })

    return [...filtered].sort((a, b) => {
      const aTime = a.kycSubmittedAt
        ? new Date(a.kycSubmittedAt).getTime()
        : Number.POSITIVE_INFINITY

      const bTime = b.kycSubmittedAt
        ? new Date(b.kycSubmittedAt).getTime()
        : Number.POSITIVE_INFINITY

      return aTime - bTime
    })
  }, [rawRows, search])

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE) || 1

  const rows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const { handleKycAction, isActionLoading } = useKycActions(fetchData)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KYC Approval Queue</h1>

          <p className="mt-2 text-muted-foreground">
            Review buyer, seller, and mandate applications before granting Exchange access.
          </p>
        </div>

        <Button variant="outline" onClick={fetchData} disabled={isFetching}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <h2 className="mt-2 text-3xl font-bold">{dashboard.pending}</h2>
            </div>

            <Clock3 className="h-10 w-10 text-amber-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Under Review</p>
              <h2 className="mt-2 text-3xl font-bold">{dashboard.underReview}</h2>
            </div>

            <ShieldCheck className="h-10 w-10 text-blue-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Applications Shown</p>
              <h2 className="mt-2 text-3xl font-bold">{filteredRows.length}</h2>
            </div>

            <Building2 className="h-10 w-10 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Longest Waiting</p>
              <h2 className="mt-2 text-3xl font-bold">
                {filteredRows.length > 0
                  ? `${Math.max(
                      ...filteredRows
                        .map((row) => getDaysWaiting(row.kycSubmittedAt))
                        .filter((value): value is number => value !== null)
                    )}d`
                  : '—'}
              </h2>
            </div>

            <Clock3 className="h-10 w-10 text-muted-foreground" />
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
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search company, applicant, code, email..."
                className="pl-10"
              />
            </div>

            <Select
              value={entity}
              onValueChange={(value) => {
                setEntity(value as EntityFilter)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Applicant type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>

                <SelectItem value="buyer">Buyers</SelectItem>

                <SelectItem value="seller">Sellers</SelectItem>

                <SelectItem value="mandate">Mandates</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs
            value={status}
            onValueChange={(value) => {
              setStatus(value as StatusFilter)
              setPage(1)
            }}
          >
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

      {/* Queue */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Represents</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Waiting</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={9}>
                      <div className="h-12 animate-pulse rounded-md bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-72">
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
                rows.map((application) => {
                  const daysWaiting = getDaysWaiting(application.kycSubmittedAt)

                  return (
                    <TableRow
                      key={`${application.entity}-${application.id}`}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{application.contactPerson || '—'}</p>

                          <p className="text-xs text-muted-foreground">
                            {application.email || '—'}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{application.companyName}</p>

                          <p className="text-xs text-muted-foreground">{application.code}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            application.entity === 'buyer'
                              ? 'default'
                              : application.entity === 'seller'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {getEntityLabel(application.entity)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {getRepresentsLabel(application.entity, application.represents)}
                      </TableCell>

                      <TableCell>{application.country || '—'}</TableCell>

                      <TableCell>{formatDate(application.kycSubmittedAt)}</TableCell>

                      <TableCell>
                        {daysWaiting === null ? (
                          '—'
                        ) : (
                          <span
                            className={
                              daysWaiting >= 7
                                ? 'font-semibold text-destructive'
                                : daysWaiting >= 3
                                  ? 'font-medium text-amber-600'
                                  : 'text-muted-foreground'
                            }
                          >
                            {daysWaiting}d
                          </span>
                        )}
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
                              onClick={() =>
                                navigate(`/kyc/${application.entity}/${application.id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>

                            {application.kycStatus === 'pending' && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                disabled={isActionLoading}
                                onClick={() =>
                                  handleKycAction(application.entity, application.id, 'review')
                                }
                              >
                                <Clock3 className="mr-2 h-4 w-4" />
                                Move to Review
                              </DropdownMenuItem>
                            )}


                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{rows.length}</span> of{' '}
          <span className="font-medium">{filteredRows.length}</span> applications
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

      {/* Rejection */}
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

          if (success) {
            setRejectTarget(null)
          }
        }}
      />
    </div>
  )
}

export default KycQueuePage
