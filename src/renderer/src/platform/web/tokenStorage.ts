import type { TokenStorage } from '../types.js'

const TOKEN_KEY = 'erp_token'

export const webTokenStorage: TokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
  }
}
