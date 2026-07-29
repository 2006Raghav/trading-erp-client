import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  success: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
  warning: (msg: string) => void
}

const TOAST_STYLES: Record<ToastType, { bg: string; text: string; icon: string }> = {
  success: { bg: 'var(--color-success)', text: '#fff', icon: '✓' },
  error: { bg: 'var(--color-danger)', text: '#fff', icon: '✕' },
  info: { bg: 'var(--color-info)', text: '#fff', icon: 'ℹ' },
  warning: { bg: 'var(--color-warning)', text: '#fff', icon: '⚠' }
}

const DURATION: Record<ToastType, number> = {
  success: 3500,
  error: 5000,
  info: 3500,
  warning: 4500
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((message: string, type: ToastType) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), DURATION[type])
  }, [])

  const value: ToastContextValue = {
    success: (msg) => add(msg, 'success'),
    error: (msg) => add(msg, 'error'),
    info: (msg) => add(msg, 'info'),
    warning: (msg) => add(msg, 'warning')
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
          {toasts.map((t) => {
            const s = TOAST_STYLES[t.type]
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 animate-slide-in"
                style={{
                  background: s.bg,
                  color: s.text,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  minWidth: '260px',
                  maxWidth: '380px',
                  boxShadow: 'var(--shadow-modal)'
                }}
              >
                <span style={{ fontSize: '16px', lineHeight: 1 }}>{s.icon}</span>
                {t.message}
              </div>
            )
          })}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
