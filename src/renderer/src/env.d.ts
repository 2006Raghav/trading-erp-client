interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_PROD_URL_ELECTRON: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
/// <reference types="vite/client" />

declare module '*.css'
