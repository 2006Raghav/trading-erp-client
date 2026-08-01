import type { TokenStorage, FileHandler } from './types.js'

import { webTokenStorage } from './web/tokenStorage.js'
import { webFileHandler } from './web/fileHandler.js'
import { electronTokenStorage } from './electron/tokenStorage.js'
import { electronFileHandler } from './electron/fileHandler.js'

declare global {
  interface Window {
    electron?: {
      isElectron: boolean
      appVersion?: string
    }
  }
}

// ── Platform detection ────────────────────────────────────────────────────────
// window.electron is set by src/preload/index.ts via contextBridge.
// In a plain browser it is undefined — that's the only check we ever need.
const isElectron = typeof window !== 'undefined' && !!window.electron?.isElectron

// ── Adapter selection ─────────────────────────────────────────────────────────
// Pick the right implementation once. Downstream code doesn't know or care which
// one it got — it just calls .get() / .set() / .downloadJSON() etc.

export const tokenStorage: TokenStorage = isElectron ? electronTokenStorage : webTokenStorage

export const fileHandler: FileHandler = isElectron ? electronFileHandler : webFileHandler

// ── Platform metadata ─────────────────────────────────────────────────────────
// Exported for the rare case where a component legitimately needs to know
// (e.g. showing "Desktop v1.0" in the sidebar footer, or conditionally rendering
// a "Check for updates" button that only makes sense on desktop).
export const platform = {
  isElectron,
  name: (isElectron ? 'electron' : 'web') as 'electron' | 'web',
  // Safe to read even in browser — returns undefined there, which is fine
  appVersion: window.electron?.appVersion ?? null
} as const
