import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { diagnosticCodeApi, type GetCodesParams } from '@/services/diagnosticCodeService'
import type { DiagnosticCodeCreate } from '@/types/diagnosticCode'

export const useDiagnosticCodes = (params: GetCodesParams = {}) => {
  return useQuery({
    queryKey: ['diagnosticCodes', params],
    queryFn: () => diagnosticCodeApi.getCodes(params),
  })
}

export const useDiagnosticCode = (id: number) => {
  return useQuery({
    queryKey: ['diagnosticCode', id],
    queryFn: () => diagnosticCodeApi.getCodeById(id),
    enabled: !!id,
  })
}

export const useCreateDiagnosticCode = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: DiagnosticCodeCreate) => diagnosticCodeApi.createCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosticCodes'] })
    },
  })
}

export const useUpdateDiagnosticCode = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DiagnosticCodeCreate> }) =>
      diagnosticCodeApi.updateCode(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['diagnosticCodes'] })
      await queryClient.cancelQueries({ queryKey: ['diagnosticCode', id] })

      // Snapshot previous values
      const previousCodes = queryClient.getQueryData(['diagnosticCodes'])
      const previousCode = queryClient.getQueryData(['diagnosticCode', id])

      // Optimistically update
      queryClient.setQueryData(['diagnosticCodes'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          items: old.items.map((code: any) =>
            code.id === id ? { ...code, ...data } : code
          ),
        }
      })

      return { previousCodes, previousCode }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCodes) {
        queryClient.setQueryData(['diagnosticCodes'], context.previousCodes)
      }
      if (context?.previousCode) {
        queryClient.setQueryData(['diagnosticCode', _variables.id], context.previousCode)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosticCodes'] })
      queryClient.invalidateQueries({ queryKey: ['diagnosticCode'] })
    },
  })
}

export const useDeleteDiagnosticCode = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => diagnosticCodeApi.deleteCode(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['diagnosticCodes'] })

      // Snapshot previous value
      const previousCodes = queryClient.getQueryData(['diagnosticCodes'])

      // Optimistically remove from cache
      queryClient.setQueryData(['diagnosticCodes'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          items: old.items.filter((code: any) => code.id !== id),
          total: old.total - 1,
        }
      })

      return { previousCodes }
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousCodes) {
        queryClient.setQueryData(['diagnosticCodes'], context.previousCodes)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosticCodes'] })
    },
  })
}
