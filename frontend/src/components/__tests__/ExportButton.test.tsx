import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { ExportButton } from '../ExportButton'
import { mockDiagnosticCodes } from '../../test/mocks'
import userEvent from '@testing-library/user-event'

// Mock URL methods
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('ExportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders CSV and JSON export buttons', () => {
    render(<ExportButton codes={mockDiagnosticCodes} />)
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export json/i })).toBeInTheDocument()
  })

  it('creates download link when CSV export is clicked', async () => {
    const user = userEvent.setup()
    render(<ExportButton codes={mockDiagnosticCodes} />)

    const csvButton = screen.getByRole('button', { name: /export csv/i })
    await user.click(csvButton)

    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('creates download link when JSON export is clicked', async () => {
    const user = userEvent.setup()
    render(<ExportButton codes={mockDiagnosticCodes} />)

    const jsonButton = screen.getByRole('button', { name: /export json/i })
    await user.click(jsonButton)

    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('renders export buttons even when array is empty', () => {
    render(<ExportButton codes={[]} />)
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export json/i })).toBeInTheDocument()
  })
})
