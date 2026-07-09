import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const MAX_WIDTHS = { sm: '440px', md: '640px', lg: '800px', xl: '1040px' }

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(15, 23, 41, 0.6)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative flex flex-col w-full"
        style={{
          maxWidth: MAX_WIDTHS[size],
          maxHeight: '90vh',
          background: 'var(--color-white)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-modal)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 shrink-0"
          style={{
            height: '56px',
            borderBottom: `1px solid var(--color-slate-200)`
          }}
        >
          <h3 className="text-heading-s" style={{ color: 'var(--color-ink-900)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center transition-colors"
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              color: 'var(--color-slate-500)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = 'var(--color-canvas-50)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--color-ink-900)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--color-slate-500)'
            }}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
