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
      <p className="text-body-m mb-6" style={{ color: 'var(--text-secondary)' }}>
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
            border: `1px solid var(--border)`,
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'
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
            background: danger ? 'var(--danger-text)' : 'var(--action)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = danger
              ? 'var(--danger-text)'
              : 'var(--action-hover)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = danger
              ? 'var(--danger-text)'
              : 'var(--action)'
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
