import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Styles ────────────────────────────────────────────────────────────────────
// Background + text color per toast type
const TYPE_STYLES: Record<ToastType, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600   text-white',
  info: 'bg-blue-600  text-white',
  warning: 'bg-amber-500 text-white'
}

// Icon per toast type — simple text characters, no icon library needed
const TYPE_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠'
}

// ── Duration (ms) per type ────────────────────────────────────────────────────
// Errors stay longer because they require user attention
const TYPE_DURATION: Record<ToastType, number> = {
  success: 3500,
  error: 5000,
  info: 3500,
  warning: 4500
}

const ToastContext = createContext<ToastContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  // addToast: creates a toast, adds it to state, schedules its removal
  const addToast = useCallback((message: string, type: ToastType) => {
    // Use timestamp + random to avoid ID collisions when multiple toasts
    // are created in rapid succession (e.g. form validation fires 3 errors at once)
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TYPE_DURATION[type])
  }, [])

  // Expose typed convenience methods instead of addToast(msg, type)
  const value: ToastContextValue = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning')
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container renders outside the normal flow — fixed position bottom-right */}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

// ── Container ─────────────────────────────────────────────────────────────────
// Rendered by ToastProvider — stacks toasts from the bottom up
function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
            text-sm font-medium min-w-64 max-w-sm
            animate-[slideIn_0.2s_ease-out] ${TYPE_STYLES[t.type]}`}
        >
          <span className="text-base leading-none">{TYPE_ICONS[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
