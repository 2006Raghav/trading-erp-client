// src/renderer/src/components/ui/ThemeToggle.tsx
// Dark mode toggle button — DASHBOARD_NOTIFICATIONS_DARKMODE_SPEC.md §1.1 & §4.4

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../lib/theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-1 rounded hover:bg-hover transition-colors flex items-center justify-center"
      style={{ color: 'var(--text-secondary)' }}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
