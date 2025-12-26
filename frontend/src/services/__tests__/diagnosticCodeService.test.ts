import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { diagnosticCodeApi } from '@/services/diagnosticCodeService'
import type { DiagnosticCodeCreate } from '@/types/diagnosticCode'
import axios from 'axios'

// Mock axios and apiClient
vi.mock('axios')
vi.mock('@/lib/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}))

import apiClient from '@/lib/apiClient'
const mockedApiClient = apiClient as any

describe('diagnosticCodeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCodes', () => {
    it('fetches codes with query parameters', async () => {
      const mockResponse = {
        items: [{ id: 1, code: 'E001', description: 'Test' }],
        total: 1,
      }

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
      })

      const result = await diagnosticCodeApi.getCodes({
        search: 'test',
        category: 'ERROR',
        skip: 0,
        limit: 10,
      })

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/v1/diagnostic-codes',
        expect.objectContaining({
          params: expect.objectContaining({ search: 'test' })
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('throws error on failed request', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Network Error'))

      await expect(
        diagnosticCodeApi.getCodes()
      ).rejects.toThrow('Network Error')
    })
  })

  describe('getCodeById', () => {
    it('fetches a single code by id', async () => {
      const mockCode = { id: 1, code: 'E001', description: 'Test Code' }

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockCode,
      })

      const result = await diagnosticCodeApi.getCodeById(1)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/diagnostic-codes/1')
      expect(result).toEqual(mockCode)
    })
  })

  describe('createCode', () => {
    it('creates a new diagnostic code', async () => {
      const newCode: DiagnosticCodeCreate = {
        code: 'E999',
        description: 'New test code',
        category: 'ERROR',
        subcategory: null,
        severity: 'high',
        is_active: true,
      }

      const mockResponse = { id: 999, ...newCode }

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
      })

      const result = await diagnosticCodeApi.createCode(newCode)

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/v1/diagnostic-codes',
        newCode
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateCode', () => {
    it('updates an existing diagnostic code', async () => {
      const updateData = {
        code: 'E001',
        description: 'Updated description',
        category: 'ERROR',
        subcategory: null,
        severity: 'critical',
        is_active: true,
      }

      const mockResponse = { id: 1, ...updateData }

      mockedApiClient.put.mockResolvedValueOnce({
        data: mockResponse,
      })

      const result = await diagnosticCodeApi.updateCode(
        1,
        updateData
      )

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/api/v1/diagnostic-codes/1',
        updateData
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteCode', () => {
    it('deletes a diagnostic code', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: null,
      })

      await diagnosticCodeApi.deleteCode(1)

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/api/v1/diagnostic-codes/1')
    })

    it('throws error when deletion fails', async () => {
      mockedApiClient.delete.mockRejectedValueOnce(new Error('Network Error'))

      await expect(
        diagnosticCodeApi.deleteCode(999)
      ).rejects.toThrow('Network Error')
    })
  })
})
