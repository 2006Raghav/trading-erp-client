// src/renderer/src/modules/kyc/KycDetail.tsx
// PART 1/2

import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  ShieldCheck,
  FileText,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCcw
} from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Skeleton } from '../../components/ui/skeleton'
import { KycStatusBadge } from '../../components/ui/StatusBadge'
import { useToast } from '../auth/ToastContext'
import { kycApi, type KycDetails, type KycEntity } from './kyc.api'
import { useCallback, useEffect } from 'react'
import { useKycActions } from './useKycActions'
import { RejectionModal } from './rejectionModal'

export default function KycDetail() {
  const navigate = useNavigate()
  const { entity, id } = useParams<{ entity: KycEntity; id: string }>()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('overview')
  const [company, setCompany] = useState<KycDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (!entity || !id) return
    setIsFetching(true)
    try {
      const res = await kycApi.getById(entity as KycEntity, id)
      if (res.success) setCompany(res.data)
    } catch (err) {
      toast.error('Failed to load KYC details')
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }, [entity, id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const { handleKycAction, isActionLoading } = useKycActions(fetchDetail)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)

  const initials = useMemo(() => {
    if (!company?.companyName) return '--'
    return company.companyName
      .split(' ')
      .slice(0, 2)
      .map((x: string) => x[0])
      .join('')
      .toUpperCase()
  }, [company])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72" />

        <Skeleton className="h-52 w-full" />

        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        KYC Application not found.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{company.companyName}</h1>
              <KycStatusBadge status={company.kycStatus} />{' '}
            </div>

            <p className="mt-2 text-muted-foreground">
              Review the submitted company information before approving KYC.
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={fetchDetail} disabled={isFetching}>
          {' '}
          <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Hero */}

      <Card>
        <CardContent className="flex items-center justify-between p-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <h2 className="text-2xl font-semibold">{company.companyName}</h2>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Badge>{company.entity}</Badge>
                <Badge variant="secondary">{company.code}</Badge>
                <Badge variant="outline">{company.country}</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Submitted</p>
              <p className="mt-1 font-medium">
                {company.kycSubmittedAt
                  ? new Date(company.kycSubmittedAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-muted-foreground">Current Status</p>
              <div className="mt-2">
                <KycStatusBadge status={company.kycStatus} />
              </div>{' '}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>

          <TabsTrigger value="documents">Documents</TabsTrigger>

          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Company */}

            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>

                <CardDescription>Registered company details</CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-medium">{company.companyName}</span>{' '}
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code</span>

                  <span>{company.code}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span>Country</span>

                  <span>{company.country}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span>Entity</span>

                  <Badge>{company.entity}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <User className="h-5 w-5 text-muted-foreground" />

                  <div>
                    <p className="text-sm text-muted-foreground">Contact Person</p>
                    <p className="font-medium">{company.contactPerson}</p>{' '}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />

                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>

                    <p>{company.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-muted-foreground" />

                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>

                    <p>{company.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* End Contact Card */}
          </div>
        </TabsContent>

        {/* ================= DOCUMENTS ================= */}

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>

              <CardDescription>
                Verify every uploaded document before approving this KYC application.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {(company.documents ?? []).map((document: any) => (
                  <Card key={document.id} className="transition-all hover:shadow-md">
                    <CardContent className="space-y-5 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-10 w-10 text-primary" />

                          <div>
                            <h4 className="font-medium">{document.name}</h4>

                            <p className="text-xs text-muted-foreground">{document.type}</p>
                          </div>
                        </div>

                        <Badge variant="secondary">Uploaded</Badge>
                      </div>

                      <Button variant="outline" className="w-full">
                        View Document
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= HISTORY ================= */}

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Clock3 className="mt-1 h-5 w-5 text-amber-500" />
                  <div>
                    <h4 className="font-medium">KYC Submitted</h4>
                    <p className="text-sm text-muted-foreground">
                      {company.kycSubmittedAt
                        ? new Date(company.kycSubmittedAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                </div>

                {company.kycReviewedAt && (
                  <div className="flex gap-4">
                    <ShieldCheck className="mt-1 h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Reviewed</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(company.kycReviewedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {company.rejectionReason && (
                  <div className="flex gap-4">
                    <AlertCircle className="mt-1 h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">Rejection Reason</h4>
                      <p className="text-sm text-muted-foreground">{company.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>{' '}
          </Card>
        </TabsContent>
      </Tabs>

      {/* ================= ACTION BAR ================= */}

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h3 className="font-semibold">Review Decision</h3>

            <p className="text-sm text-muted-foreground">
              Once approved, this company will gain Exchange access.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {company.kycStatus === 'pending' && (
              <Button
                variant="secondary"
                onClick={() => {
                  if (!entity || !id) {
                    toast.error('Invalid KYC application')
                    return
                  }

                  handleKycAction(entity, id, 'review')
                }}
                disabled={isFetching || isActionLoading}
              >
                <Clock3 className="mr-2 h-4 w-4" />
                Move To Review
              </Button>
            )}

            {/* ONLY show Approve/Reject when Under Review */}
            {company.kycStatus === 'under_review' && (
              <>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    if (!entity || !id) {
                      toast.error('Invalid KYC application')
                      return
                    }

                    handleKycAction(entity, id, 'approve')
                  }}
                  disabled={isFetching || isActionLoading}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={isFetching || isActionLoading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <RejectionModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        isSubmitting={isActionLoading}
        onConfirm={async (reason) => {
          if (!entity || !id) {
            toast.error('Invalid KYC application')
            return
          }

          const success = await handleKycAction(entity, id, 'reject', reason)

          if (success) {
            setIsRejectModalOpen(false)
          }
        }}
      />
    </div>
  )
}
