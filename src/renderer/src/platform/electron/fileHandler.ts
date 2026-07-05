import type { FileHandler } from '../types.js'
import { webFileHandler } from '../web/fileHandler.js'

// For V1: identical to web — Electron's renderer supports the same Blob/anchor trick
// because it's a full Chromium instance.
export const electronFileHandler: FileHandler = {
  downloadJSON: webFileHandler.downloadJSON,
  downloadCSV: webFileHandler.downloadCSV
}
