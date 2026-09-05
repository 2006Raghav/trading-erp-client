import { XCircle, FileText, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'

interface KycRejectedBlockProps {
  rejectionReason: string | null
  companyName?: string
}

/**
 * Full-screen blocking overlay shown on action pages (commodity requests, etc.)
 * when the authenticated user's kyc_status is "rejected".
 *
 * The user can still read — only the action page is blocked.
 * The "Re-submit Documents" CTA navigates to /resubmit.
 */
export function KycRejectedBlock({ rejectionReason, companyName }: KycRejectedBlockProps) {
  const navigate = useNavigate()

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center"
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: 'var(--color-danger-bg)' }}
      >
        <XCircle
          className="h-8 w-8"
          style={{ color: 'var(--color-danger)' }}
        />
      </div>

      {/* Heading */}
      <h2
        className="mt-6 text-2xl font-semibold"
        style={{ color: 'var(--color-ink-900)' }}
      >
        KYC Application Rejected
      </h2>

      {companyName && (
        <p className="mt-1 text-sm" style={{ color: 'var(--color-slate-500)' }}>
          {companyName}
        </p>
      )}

      {/* Rejection reason box */}
      <div
        className="mt-6 w-full max-w-md rounded-lg border p-4 text-left"
        style={{
          borderColor: 'var(--color-danger)',
          background: 'var(--color-danger-bg)'
        }}
      >
        <div className="flex gap-3">
          <FileText
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: 'var(--color-danger)' }}
          />
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-danger)' }}
            >
              Rejection Reason
            </p>

            <p
              className="mt-2 text-sm leading-6"
              style={{ color: 'var(--color-ink-900)' }}
            >
              {rejectionReason ??
                'Your application has been rejected. Please review your documents and re-submit.'}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <p
        className="mt-6 max-w-md text-sm leading-6"
        style={{ color: 'var(--color-slate-500)' }}
      >
        Replace the document(s) mentioned above, then re-submit your application for review.
        You can still browse the marketplace while you prepare your documents.
      </p>

      {/* CTA */}
      <Button
        id="kyc-rejected-resubmit-cta"
        onClick={() => navigate('/resubmit')}
        className="mt-8"
        style={{
          background: 'var(--color-cobalt-600)',
          color: 'white'
        }}
      >
        Re-submit Documents
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
