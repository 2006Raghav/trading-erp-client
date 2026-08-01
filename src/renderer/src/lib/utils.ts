// src/renderer/src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Pure formatting utilities. No side effects. Safe to call anywhere.

/**
 * Format a number as a currency string.
 * formatCurrency(1234.5, 'USD') → "$1,234.50"
 */
export function formatCurrency(amount: number | null | undefined, currency = 'USD'): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(amount)
}

/**
 * Format a number with commas and a unit label.
 * formatQuantity(5000, 'MT') → "5,000 MT"
 */
export function formatQuantity(qty: number | null | undefined, unit = 'MT'): string {
  if (qty === null || qty === undefined) return '—'
  return `${new Intl.NumberFormat('en-US').format(qty)} ${unit}`
}

/**
 * Format an ISO datetime string for display.
 * format='date'     → "12 Jun 2025"
 * format='datetime' → "12 Jun 2025, 14:30"
 */
export function formatDate(
  isoString: string | null | undefined,
  format: 'date' | 'datetime' = 'date'
): string {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (format === 'datetime') {
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Truncate a string to a maximum character count, appending '…' if cut.
 */
export function truncate(text: string | null | undefined, max = 50): string {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '…' : text
}

/**
 * Build a diff between two objects — shows what fields changed.
 * Used to build human-readable descriptions for activity log entries
 * if you ever want to show "company_name changed from X to Y".
 */
export function buildDiff(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const changed: Record<string, { from: unknown; to: unknown }> = {}
  for (const key of Object.keys(newObj)) {
    if (oldObj[key] !== newObj[key]) {
      changed[key] = { from: oldObj[key], to: newObj[key] }
    }
  }
  return changed
}
