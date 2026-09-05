import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/textarea'

interface RejectionModalProps {
  isOpen: boolean
  onClose: () => void
  isSubmitting?: boolean
  onConfirm: (reason: string) => void | Promise<void>
}

export function RejectionModal({
  isOpen,
  onClose,
  isSubmitting = false,
  onConfirm
}: RejectionModalProps) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (isOpen) setReason('')
  }, [isOpen])

  const submit = async () => {
    const trimmedReason = reason.trim()
    if (!trimmedReason || isSubmitting) return
    await onConfirm(trimmedReason)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject KYC Application">
      <div className="space-y-5">
        <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Provide a clear reason so the applicant knows what must be corrected.
          </p>
        </div>

        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Enter rejection reason"
          aria-label="Rejection reason"
          disabled={isSubmitting}
          autoFocus
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={submit}
            disabled={!reason.trim() || isSubmitting}
          >
            {isSubmitting ? 'Rejecting...' : 'Reject Application'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
