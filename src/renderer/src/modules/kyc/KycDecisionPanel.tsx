// src/renderer/src/modules/kyc/KycDecisionPanel.tsx

import { AlertCircle, CheckCircle2, Clock3, ShieldCheck, XCircle } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import { KycStatusBadge } from '../../components/ui/StatusBadge'

import type { KycEntity, KycStatus } from './kyc.types'

interface KycDecisionPanelProps {
  entity: KycEntity
  status: KycStatus

  /**
   * Number of required document groups that have been verified.
   * The panel does not calculate this itself.
   */
  verifiedDocumentCount: number
  requiredDocumentCount: number

  /**
   * True when every required document/group has been checked.
   */
  allDocumentsChecked: boolean

  /**
   * True when at least one required document/group has been
   * marked faulty.
   */
  hasFaultyDocuments: boolean

  isLoading?: boolean
  isActionLoading?: boolean

  onMoveToReview?: () => void
  onApprove?: () => void
  onReject?: () => void
}

export function KycDecisionPanel({
  entity,
  status,
  verifiedDocumentCount,
  requiredDocumentCount,
  allDocumentsChecked,
  hasFaultyDocuments,
  isLoading = false,
  isActionLoading = false,
  onMoveToReview,
  onApprove,
  onReject
}: KycDecisionPanelProps) {
  const isPending = status === 'pending'
  const isUnderReview = status === 'under_review'
  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'

  const canApprove =
    isUnderReview && allDocumentsChecked && !hasFaultyDocuments && requiredDocumentCount > 0

  const isBusy = isLoading || isActionLoading

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Review Decision</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Complete the document verification before making the final KYC decision.
            </p>
          </div>

          <KycStatusBadge status={status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Verification progress */}
        <div className="rounded-card border border-[var(--color-slate-200)] bg-[var(--color-canvas-50)] p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[var(--color-cobalt-600)]" />

              <div>
                <p className="font-medium text-[var(--color-ink-900)]">Document verification</p>

                <p className="text-sm text-[var(--color-slate-500)]">
                  {verifiedDocumentCount} of {requiredDocumentCount} required document groups
                  verified
                </p>
              </div>
            </div>

            {allDocumentsChecked && !hasFaultyDocuments ? (
              <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
            ) : (
              <Clock3 className="h-5 w-5 text-[var(--color-warning)]" />
            )}
          </div>
        </div>

        {/* Pending state */}
        {isPending && (
          <div className="flex gap-3 rounded-card border border-[var(--color-warning)] bg-[var(--color-warning-bg)] p-4">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-warning)]" />

            <div>
              <p className="font-medium text-[var(--color-ink-900)]">
                Application is pending review
              </p>

              <p className="mt-1 text-sm text-[var(--color-slate-500)]">
                Move this {entity} application to review before verifying documents and making a
                final decision.
              </p>
            </div>
          </div>
        )}

        {/* Under review — incomplete documents */}
        {isUnderReview && !allDocumentsChecked && (
          <div className="flex gap-3 rounded-card border border-[var(--color-warning)] bg-[var(--color-warning-bg)] p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-warning)]" />

            <div>
              <p className="font-medium text-[var(--color-ink-900)]">Verification incomplete</p>

              <p className="mt-1 text-sm text-[var(--color-slate-500)]">
                Every required document group must be checked before this application can be
                approved or rejected.
              </p>
            </div>
          </div>
        )}

        {/* Under review — faulty documents */}
        {isUnderReview && allDocumentsChecked && hasFaultyDocuments && (
          <div className="flex gap-3 rounded-card border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-4">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-danger)]" />

            <div>
              <p className="font-medium text-[var(--color-ink-900)]">Document issues detected</p>

              <p className="mt-1 text-sm text-[var(--color-slate-500)]">
                One or more required documents have been marked faulty. Review the document findings
                before rejecting this application.
              </p>
            </div>
          </div>
        )}

        {/* Approved */}
        {isApproved && (
          <div className="flex gap-3 rounded-card border border-[var(--color-success)] bg-[var(--color-success-bg)] p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-success)]" />

            <div>
              <p className="font-medium text-[var(--color-ink-900)]">KYC approved</p>

              <p className="mt-1 text-sm text-[var(--color-slate-500)]">
                This {entity} has been approved and has full Exchange access.
              </p>
            </div>
          </div>
        )}

        {/* Rejected */}
        {isRejected && (
          <div className="flex gap-3 rounded-card border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-4">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-danger)]" />

            <div>
              <p className="font-medium text-[var(--color-ink-900)]">KYC rejected</p>

              <p className="mt-1 text-sm text-[var(--color-slate-500)]">
                The applicant must correct the identified issues and resubmit the required
                documents.
              </p>
            </div>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-ink-900)]">Final decision</p>

            <p className="mt-1 text-xs text-[var(--color-slate-500)]">
              {isPending
                ? 'Start the review to begin verification.'
                : isUnderReview
                  ? canApprove
                    ? 'All required documents have been verified.'
                    : 'Complete document verification before approving.'
                  : isApproved
                    ? 'No further action is required.'
                    : 'The applicant can resubmit corrected documents.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Pending → Under Review */}
            {isPending && (
              <Button type="button" variant="secondary" disabled={isBusy} onClick={onMoveToReview}>
                <Clock3 className="mr-2 h-4 w-4" />
                Move To Review
              </Button>
            )}

            {/* Under Review → Reject */}
            {isUnderReview && (
              <Button type="button" variant="destructive" disabled={isBusy} onClick={onReject}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            )}

            {/* Under Review → Approve */}
            {isUnderReview && (
              <Button
                type="button"
                disabled={!canApprove || isBusy}
                onClick={onApprove}
                className="bg-[var(--color-success)] text-white hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve KYC
              </Button>
            )}
          </div>
        </div>

        {/* Explicit approval blocker */}
        {isUnderReview && !canApprove && (
          <p className="text-right text-xs text-[var(--color-slate-500)]">
            Approval is locked until all required document groups are verified and no required
            document is faulty.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default KycDecisionPanel
