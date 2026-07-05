import { contextBridge, app } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  // Which OS the app is running on
  platform: process.platform,

  // Sentinel: lets platform/index.ts know it's inside Electron
  // (window.electron itself being defined is sufficient, but the boolean
  // makes the intent explicit)
  isElectron: true as const,

  // From package.json — displayed in the UI if needed
  appVersion: app.getVersion(),

  // Node/Electron/Chrome versions for diagnostics
  process: {
    versions: {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node
    }
  }
})
