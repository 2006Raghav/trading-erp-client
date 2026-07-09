import { Modal } from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-body-m mb-6" style={{ color: 'var(--color-slate-500)' }}>
        {message}
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="text-body-m font-semibold transition-colors"
          style={{
            height: '40px',
            padding: '0 16px',
            borderRadius: '8px',
            border: `1px solid var(--color-slate-200)`,
            background: 'var(--color-white)',
            color: 'var(--color-ink-900)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = 'var(--color-canvas-50)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = 'var(--color-white)'
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm()
            onClose()
          }}
          className="text-body-m font-semibold text-white transition-colors"
          style={{
            height: '40px',
            padding: '0 16px',
            borderRadius: '8px',
            border: 'none',
            background: danger ? 'var(--color-danger)' : 'var(--color-cobalt-600)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = danger
              ? '#B91C1C'
              : 'var(--color-cobalt-700)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = danger
              ? 'var(--color-danger)'
              : 'var(--color-cobalt-600)'
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
