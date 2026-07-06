// src/renderer/src/components/ui/Modal.tsx
// Accessible modal with Escape key support and backdrop click to close.

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Keyboard: close on Escape. Clean up the listener when the modal closes.
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
      {/* Semi-transparent backdrop — clicking it closes the modal */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal panel — sits above the backdrop via relative positioning */}
      <div
        className={`relative bg-white rounded-xl shadow-2xl w-full ${SIZE_CLASSES[size]} max-h-[90vh] flex flex-col`}
      >
        {/* Header row: title + close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body — long forms scroll inside the modal */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
