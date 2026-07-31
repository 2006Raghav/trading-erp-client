import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  // Point standard Vite to the electron-vite renderer folder
  root: resolve(__dirname, 'src/renderer'),
  build: {
    // Because the root is now src/renderer, we must output the build
    // two levels up so it doesn't get stuck inside the src folder
    outDir: '../../dist/web',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@': resolve(__dirname, 'src/renderer/src')
    }
  },
  server: {
    port: 5173
  }
})
