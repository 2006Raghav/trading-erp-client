import {
  Building2,
  Globe2,
  Hash,
  Mail,
  Phone,
  User,
  ShieldCheck,
  CalendarDays,
  AlertCircle,
  BriefcaseBusiness
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { KycStatusBadge } from '../../components/ui/StatusBadge'

import type { KycDetails, KycEntity } from './kyc.types'

interface KycApplicantDetailsProps {
  applicant: KycDetails
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatEntity(entity: KycEntity) {
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

function formatRepresents(value?: 'buyer_side' | 'seller_side' | null) {
  if (value === 'buyer_side') return 'Buyer Side'
  if (value === 'seller_side') return 'Seller Side'
  return null
}

function Field({
  icon: Icon,
  label,
  value
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>

        <p className="mt-1 break-words text-sm font-medium text-foreground">{value || '—'}</p>
      </div>
    </div>
  )
}

function EntityBadge({ entity }: { entity: KycEntity }) {
  return (
    <Badge variant={entity === 'buyer' ? 'default' : entity === 'seller' ? 'secondary' : 'outline'}>
      {formatEntity(entity)}
    </Badge>
  )
}

export default function KycApplicantDetails({ applicant }: KycApplicantDetailsProps) {
  const represents = formatRepresents(applicant.represents)

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          APPLICANT SUMMARY
      ───────────────────────────────────────────────────────────── */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>

              <div className="min-w-0">
                <CardTitle className="text-xl">{applicant.companyName}</CardTitle>

                <CardDescription className="mt-1">{applicant.code}</CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <EntityBadge entity={applicant.entity} />

              <KycStatusBadge status={applicant.kycStatus} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field icon={Hash} label="Applicant Code" value={applicant.code} />

            <Field icon={Globe2} label="Country" value={applicant.country} />

            <Field
              icon={CalendarDays}
              label="Application Submitted"
              value={formatDate(applicant.kycSubmittedAt)}
            />

            <Field
              icon={ShieldCheck}
              label="Current Status"
              value={<KycStatusBadge status={applicant.kycStatus} />}
            />
          </div>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          COMPANY INFORMATION
      ───────────────────────────────────────────────────────────── */}

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>

          <CardDescription>
            Registered information submitted with the KYC application.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <Field icon={Building2} label="Company Name" value={applicant.companyName} />

            <Field icon={Hash} label="Company Code" value={applicant.code} />

            <Field icon={Globe2} label="Country" value={applicant.country} />

            <Field
              icon={BriefcaseBusiness}
              label="Entity Type"
              value={formatEntity(applicant.entity)}
            />

            {applicant.entity === 'mandate' && represents && (
              <Field
                icon={BriefcaseBusiness}
                label="Represents"
                value={<Badge variant="outline">{represents}</Badge>}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          CONTACT INFORMATION
      ───────────────────────────────────────────────────────────── */}

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>

          <CardDescription>Primary contact details provided by the applicant.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Field icon={User} label="Contact Person" value={applicant.contactPerson} />

            <Field icon={Mail} label="Email" value={applicant.email} />

            <Field icon={Phone} label="Phone" value={applicant.phone} />
          </div>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          KYC REVIEW INFORMATION
      ───────────────────────────────────────────────────────────── */}

      <Card>
        <CardHeader>
          <CardTitle>KYC Review Information</CardTitle>

          <CardDescription>Administrative verification state and review history.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-6 md:grid-cols-2">
            <Field
              icon={CalendarDays}
              label="Submitted At"
              value={formatDate(applicant.kycSubmittedAt)}
            />

            <Field
              icon={ShieldCheck}
              label="Reviewed At"
              value={formatDate(applicant.kycReviewedAt)}
            />
          </div>

          <Separator />

          <Field
            icon={User}
            label="Reviewed By"
            value={applicant.kycReviewedBy || 'Not reviewed yet'}
          />

          {applicant.kycStatus === 'rejected' && applicant.rejectionReason && (
            <>
              <Separator />

              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

                  <div>
                    <p className="font-semibold text-destructive">Rejection Reason</p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {applicant.rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          SYSTEM INFORMATION
      ───────────────────────────────────────────────────────────── */}

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>

          <CardDescription>Internal record metadata.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <Field icon={CalendarDays} label="Created At" value={formatDate(applicant.createdAt)} />

            <Field
              icon={CalendarDays}
              label="Last Updated"
              value={formatDate(applicant.updatedAt)}
            />

            <Field
              icon={ShieldCheck}
              label="Active"
              value={
                applicant.isActive ? (
                  <Badge>Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )
              }
            />

            <Field icon={BriefcaseBusiness} label="Entity" value={formatEntity(applicant.entity)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
