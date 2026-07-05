import type { FileHandler } from '../types.js'

export const webFileHandler: FileHandler = {
  async downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    triggerDownload(blob, filename)
  },
  async downloadCSV(filename, csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv' })
    triggerDownload(blob, filename)
  }
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  // Release the Object URL — it holds a reference to the Blob in memory
  URL.revokeObjectURL(url)
}
