import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_STYLE: Record<
  ToastType,
  {
    bg: string
    icon: string
  }
> = {
  success: {
    bg: 'var(--color-success)',
    icon: '✓'
  },
  error: {
    bg: 'var(--color-danger)',
    icon: '✕'
  },
  info: {
    bg: 'var(--color-info)',
    icon: 'ℹ'
  },
  warning: {
    bg: 'var(--color-warning)',
    icon: '⚠'
  }
}

const TOAST_DURATION: Record<ToastType, number> = {
  success: 3500,
  error: 5000,
  info: 3500,
  warning: 4500
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType) => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`

      setToasts((prev) => [...prev, { id, message, type }])

      window.setTimeout(() => {
        removeToast(id)
      }, TOAST_DURATION[type])
    },
    [removeToast]
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => addToast(message, 'success'),
      error: (message) => addToast(message, 'error'),
      info: (message) => addToast(message, 'info'),
      warning: (message) => addToast(message, 'warning')
    }),
    [addToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const style = TOAST_STYLE[toast.type]

          return (
            <div
              key={toast.id}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-white shadow-lg animate-slideIn"
              style={{
                background: style.bg,
                minWidth: '260px',
                maxWidth: '380px'
              }}
            >
              <span className="text-base font-semibold">{style.icon}</span>

              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error(
      'useToast must be used inside <ToastProvider>. Wrap App.tsx with ToastProvider.'
    )
  }

  return context
}
