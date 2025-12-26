import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { ImportModal } from '../ImportModal'
import * as useDiagnosticCodesHook from '@/hooks/useDiagnosticCodes'

vi.mock('@/hooks/useDiagnosticCodes')

describe('ImportModal', () => {
  const mockCreateMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  }
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useDiagnosticCodesHook, 'useCreateDiagnosticCode').mockReturnValue(mockCreateMutation as any)
  })

  it('does not render when isOpen is false', () => {
    render(
      <ImportModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.queryByText('Import Diagnostic Codes')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(
      <ImportModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Import Diagnostic Codes')).toBeInTheDocument()
  })

  it('renders file upload instructions', () => {
    render(
      <ImportModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText(/Upload a CSV or JSON file/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ImportModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByRole('button', { name: '' })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('accepts CSV file types', () => {
    render(
      <ImportModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toHaveAttribute('accept', '.csv')
  })
})
