export interface TokenStorage {
  get: () => string | null
  set: (token: string) => void
  clear: () => void
}

export interface FileHandler {
  // Save arbitrary JSON data as a downloadable file
  downloadJSON: (filename: string, data: unknown) => Promise<void>
  // Save a pre-formatted CSV string as a downloadable file
  downloadCSV: (filename: string, csvContent: string) => Promise<void>
}
