interface ImportMetaEnv {
  // Base URL for all API calls — set in .env files, injected by Vite at build time
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
