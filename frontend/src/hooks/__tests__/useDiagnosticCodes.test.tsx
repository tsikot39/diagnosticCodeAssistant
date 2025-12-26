import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useDiagnosticCodes, useCreateDiagnosticCode, useUpdateDiagnosticCode, useDeleteDiagnosticCode } from '../useDiagnosticCodes'
import { diagnosticCodeApi } from '../../services/diagnosticCodeService'
import { mockDiagnosticCode, mockDiagnosticCodes } from '../../test/mocks'

// Mock the service
vi.mock('../../services/diagnosticCodeService', () => ({
  diagnosticCodeApi: {
    getCodes: vi.fn(),
    getCodeById: vi.fn(),
    createCode: vi.fn(),
    updateCode: vi.fn(),
    deleteCode: vi.fn(),
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useDiagnosticCodes', () => {
  it('fetches diagnostic codes successfully', async () => {
    const mockResponse = {
      items: mockDiagnosticCodes,
      total: 3,
    }

    vi.mocked(diagnosticCodeApi.getCodes).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useDiagnosticCodes({}), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
    expect(diagnosticCodeApi.getCodes).toHaveBeenCalledWith({})
  })

  it('passes query parameters correctly', async () => {
    const params = { search: 'test', category: 'error' }
    const mockResponse = { items: [], total: 0 }

    vi.mocked(diagnosticCodeApi.getCodes).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useDiagnosticCodes(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(diagnosticCodeApi.getCodes).toHaveBeenCalledWith(params)
  })

  it('handles fetch errors', async () => {
    const error = new Error('Failed to fetch')
    vi.mocked(diagnosticCodeApi.getCodes).mockRejectedValue(error)

    const { result } = renderHook(() => useDiagnosticCodes({}), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeTruthy()
  })
})

describe('useCreateDiagnosticCode', () => {
  it('creates a diagnostic code successfully', async () => {
    vi.mocked(diagnosticCodeApi.createCode).mockResolvedValue(mockDiagnosticCode)

    const { result } = renderHook(() => useCreateDiagnosticCode(), {
      wrapper: createWrapper(),
    })

    const newCode = { code: 'E002', description: 'New error' }
    result.current.mutate(newCode)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockDiagnosticCode)
  })

  it('handles create errors', async () => {
    const error = new Error('Create failed')
    vi.mocked(diagnosticCodeApi.createCode).mockRejectedValue(error)

    const { result } = renderHook(() => useCreateDiagnosticCode(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ code: 'E002', description: 'New error' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useUpdateDiagnosticCode', () => {
  it('updates a diagnostic code successfully', async () => {
    vi.mocked(diagnosticCodeApi.updateCode).mockResolvedValue(mockDiagnosticCode)

    const { result } = renderHook(() => useUpdateDiagnosticCode(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ id: 1, data: { description: 'Updated' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockDiagnosticCode)
  })

  it('handles update errors', async () => {
    const error = new Error('Update failed')
    vi.mocked(diagnosticCodeApi.updateCode).mockRejectedValue(error)

    const { result } = renderHook(() => useUpdateDiagnosticCode(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ id: 1, data: { description: 'Updated' } })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useDeleteDiagnosticCode', () => {
  it('deletes a diagnostic code successfully', async () => {
    vi.mocked(diagnosticCodeApi.deleteCode).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteDiagnosticCode(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('handles delete errors', async () => {
    const error = new Error('Delete failed')
    vi.mocked(diagnosticCodeApi.deleteCode).mockRejectedValue(error)

    const { result } = renderHook(() => useDeleteDiagnosticCode(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
