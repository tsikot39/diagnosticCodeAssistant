import type { DiagnosticCode } from '@/types/diagnosticCode'

export const mockDiagnosticCode: DiagnosticCode = {
  id: 1,
  code: 'E001',
  description: 'Test diagnostic code for unit testing',
  category: 'ERROR',
  subcategory: 'System',
  severity: 'high',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockDiagnosticCodes: DiagnosticCode[] = [
  mockDiagnosticCode,
  {
    id: 2,
    code: 'W002',
    description: 'Warning code for testing',
    category: 'WARNING',
    subcategory: null,
    severity: 'medium',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    code: 'I003',
    description: 'Info code for testing',
    category: 'INFO',
    subcategory: 'Diagnostic',
    severity: 'low',
    is_active: false,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
]

export const createMockCode = (overrides?: Partial<DiagnosticCode>): DiagnosticCode => ({
  ...mockDiagnosticCode,
  ...overrides,
})
