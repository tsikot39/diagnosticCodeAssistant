const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  diagnosticCodes: `${API_BASE_URL}/api/v1/diagnostic-codes`,
} as const

export { API_BASE_URL }
