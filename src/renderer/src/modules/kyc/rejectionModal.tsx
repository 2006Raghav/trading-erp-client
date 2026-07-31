import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog'

interface RejectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  isSubmitting: boolean
}

export function RejectionModal({ isOpen, onClose, onConfirm, isSubmitting }: RejectionModalProps) {
  const [reason, setReason] = useState('')

  // Reset the input when the modal opens/closes, and ensure the body is ALWAYS unlocked
  useEffect(() => {
    if (isOpen) {
      setReason('')
      return undefined
    }

    // THE FAILSAFE: Forcefully clear the Shadcn body lock 100ms after the modal closes.
    // This guarantees your screen will never freeze, even if Shadcn crashes internally.
    const timer = setTimeout(() => {
      document.body.style.pointerEvents = ''
      document.body.removeAttribute('data-scroll-locked')
    }, 100)
    return () => clearTimeout(timer)
  }, [isOpen])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose()
      }}
    >
      <DialogContent
        /* THE MAGIC FIX: This stops Shadcn from looking for the dropdown button that vanished */
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-md bg-white rounded-card shadow-modal border-none p-0 gap-0 overflow-hidden"
      >
        <div className="p-6">
          <DialogHeader className="mb-5 text-left">
            <div className="flex items-center gap-3 text-[var(--color-danger)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-danger-bg)] shrink-0">
                <AlertCircle size={20} strokeWidth={1.5} />
              </div>
              <DialogTitle className="text-heading-s text-[var(--color-ink-900)]">
                Reject Application
              </DialogTitle>
            </div>

            <DialogDescription className="text-body-m text-[var(--color-slate-500)] mt-3">
              Please provide a specific reason for rejecting this KYC application. This will be
              recorded in the audit log.
            </DialogDescription>
          </DialogHeader>

          <div>
            <label className="text-caption text-[var(--color-slate-500)] mb-2 block">
              REJECTION REASON <span className="text-[var(--color-danger)]">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Company registration document is expired..."
              className="w-full min-h-[100px] resize-none rounded-btn border border-[var(--color-slate-200)] p-3 text-body-m text-[var(--color-ink-900)] outline-none focus-visible:border-[var(--color-cobalt-600)] focus-visible:ring-2 focus-visible:ring-[var(--color-cobalt-100)]"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="bg-[var(--color-canvas-50)] border-t border-[var(--color-slate-200)] p-4 sm:justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-btn border-[var(--color-slate-200)] text-[var(--color-ink-900)] hover:bg-white"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isSubmitting}
            className="rounded-btn bg-[var(--color-danger)] text-white font-semibold hover:opacity-90 border-none"
          >
            Reject Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
