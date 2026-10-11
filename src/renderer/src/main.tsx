// src/renderer/src/main.tsx
// React app entry point. This is what index.html loads.

import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './app'
import './index.css'
import { getInitialTheme, applyTheme } from './lib/theme'

// Initialize theme before rendering
applyTheme(getInitialTheme())

// HashRouter is required for Electron (file:// protocol doesn't support BrowserRouter).
// It works fine in a browser too — the URL just looks like /#/dashboard instead of /dashboard.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
