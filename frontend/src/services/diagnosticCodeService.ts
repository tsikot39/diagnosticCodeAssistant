import apiClient from '@/lib/apiClient'
import type { DiagnosticCode, DiagnosticCodeList, DiagnosticCodeCreate } from '@/types/diagnosticCode'

export interface GetCodesParams {
  skip?: number
  limit?: number
  search?: string
  category?: string
  severity?: string
  is_active?: boolean
}

export const diagnosticCodeApi = {
  async getCodes(params: GetCodesParams = {}): Promise<DiagnosticCodeList> {
    const response = await apiClient.get<DiagnosticCodeList>('/api/v1/diagnostic-codes', { params })
    return response.data
  },

  async getCodeById(id: number): Promise<DiagnosticCode> {
    const response = await apiClient.get<DiagnosticCode>(`/api/v1/diagnostic-codes/${id}`)
    return response.data
  },

  async getCodeByCode(code: string): Promise<DiagnosticCode> {
    const response = await apiClient.get<DiagnosticCode>(`/api/v1/diagnostic-codes/by-code/${code}`)
    return response.data
  },

  async createCode(data: DiagnosticCodeCreate): Promise<DiagnosticCode> {
    const response = await apiClient.post<DiagnosticCode>('/api/v1/diagnostic-codes', data)
    return response.data
  },

  async updateCode(id: number, data: Partial<DiagnosticCodeCreate>): Promise<DiagnosticCode> {
    const response = await apiClient.put<DiagnosticCode>(`/api/v1/diagnostic-codes/${id}`, data)
    return response.data
  },

  async deleteCode(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/diagnostic-codes/${id}`)
  },
}
