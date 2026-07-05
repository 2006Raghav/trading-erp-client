// src/main/index.ts
//
// THE COMPLETE AND FINAL MAIN PROCESS FILE.
// Nothing is added here in V1. No IPC handlers for data. No SQLite.
// The renderer (React) talks directly to the Fastify server over HTTP.

import { app, BrowserWindow, shell } from 'electron'
import path from 'path'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Trading ERP',
    webPreferences: {
      // preload.js runs in a privileged context between Node and the web page.
      // It can use Electron APIs and expose a safe, limited surface to the renderer.
      preload: path.join(__dirname, '../preload/index.js'),
      // contextIsolation: true means the renderer cannot access Node.js globals.
      // This is required for security — the renderer is essentially an untrusted web page.
      contextIsolation: true,
      // nodeIntegration: false means require/process are NOT available in the renderer.
      // All Node.js access goes through the preload's contextBridge only.
      nodeIntegration: false,
      sandbox: false // needed for preload to work with contextBridge
    }
  })

  if (process.env.NODE_ENV === 'development') {
    // In dev: electron-vite sets ELECTRON_RENDERER_URL to the Vite dev server URL.
    // The renderer reloads on file change exactly like a browser would.
    win.loadURL(process.env['ELECTRON_RENDERER_URL']!)
    win.webContents.openDevTools()
  } else {
    // In prod: load the compiled index.html from the renderer build output.
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // External links (<a href="https://..."> clicked) open in the OS default browser,
  // not inside the Electron window itself.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// Wait for Electron to be ready before creating the window.
app.whenReady().then(createWindow)

// On Windows/Linux: quit when all windows are closed.
// On macOS: stay in the dock (standard macOS behaviour).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// macOS: re-create the window when the dock icon is clicked and no windows are open.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
