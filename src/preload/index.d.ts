export {}

declare global {
  interface Window {
    electron?: {
      // Runtime platform — 'win32' | 'darwin' | 'linux'
      // Used by platform/index.ts to detect the host OS if needed
      platform: NodeJS.Platform

      // Always true when running inside Electron.
      // undefined in a browser (window.electron itself is undefined there).
      isElectron: true

      // App version from package.json — shown in sidebar footer
      appVersion: string

      // process.versions — useful for diagnostics (Electron, Chrome, Node versions)
      // Only available inside Electron, never in a browser
      process: {
        versions: {
          electron: string
          chrome: string
          node: string
        }
      }
    }
  }
}
