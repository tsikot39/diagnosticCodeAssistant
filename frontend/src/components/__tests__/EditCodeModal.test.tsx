import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { EditCodeModal } from '../EditCodeModal'
import * as useDiagnosticCodesHook from '@/hooks/useDiagnosticCodes'
import { mockDiagnosticCode } from '@/test/mocks'

vi.mock('@/hooks/useDiagnosticCodes')

describe('EditCodeModal', () => {
  const mockUpdateMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  }
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useDiagnosticCodesHook, 'useUpdateDiagnosticCode').mockReturnValue(mockUpdateMutation as any)
  })

  it('does not render when isOpen is false', () => {
    render(
      <EditCodeModal
        isOpen={false}
        onClose={mockOnClose}
        code={mockDiagnosticCode}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.queryByText('Edit Diagnostic Code')).not.toBeInTheDocument()
  })

  it('does not render when code is null', () => {
    render(
      <EditCodeModal
        isOpen={true}
        onClose={mockOnClose}
        code={null}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.queryByText('Edit Diagnostic Code')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true and code is provided', () => {
    render(
      <EditCodeModal
        isOpen={true}
        onClose={mockOnClose}
        code={mockDiagnosticCode}
      />
    )

    expect(screen.getByText('Edit Diagnostic Code')).toBeInTheDocument()
  })

  it('pre-fills form with existing code data', () => {
    render(
      <EditCodeModal
        isOpen={true}
        onClose={mockOnClose}
        code={mockDiagnosticCode}
      />
    )

    expect(screen.getByDisplayValue(mockDiagnosticCode.code)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockDiagnosticCode.description)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <EditCodeModal
        isOpen={true}
        onClose={mockOnClose}
        code={mockDiagnosticCode}
      />
    )

    const closeButton = screen.getByRole('button', { name: '' })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <EditCodeModal
        isOpen={true}
        onClose={mockOnClose}
        code={mockDiagnosticCode}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('updates form fields when typing', async () => {
    const user = userEvent.setup()
    render(
      <EditCodeModal
        isOpen={true}
        onClose={mockOnClose}
        code={mockDiagnosticCode}
      />
    )

    const descriptionInput = screen.getByDisplayValue(mockDiagnosticCode.description)
    
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')

    expect(descriptionInput).toHaveValue('Updated description')
  })

  it('submits form with updated data', async () => {
    const user = userEvent.setup()
    mockUpdateMutation.mutateAsync.mockResolvedValue({})

    render(
      <EditCodeModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        code={mockDiagnosticCode}
      />
    )

    // Update description
    const descriptionInput = screen.getByDisplayValue(mockDiagnosticCode.description)
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Update Code/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateMutation.mutateAsync).toHaveBeenCalledWith({
        id: mockDiagnosticCode.id,
        data: expect.objectContaining({
          description: 'Updated description',
        }),
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('shows loading state when submitting', () => {
    const slowMutation = {
      ...mockUpdateMutation,
      isPending: true,
    }
    vi.spyOn(useDiagnosticCodesHook, 'useUpdateDiagnosticCode').mockReturnValue(slowMutation as any)

    render(
      <EditCodeModal
        isOpen={true}
        onClose={mockOnClose}
        code={mockDiagnosticCode}
      />
    )

    const submitButton = screen.getByRole('button', { name: /Updating.../i })
    expect(submitButton).toBeDisabled()
  })

  it('handles submission errors', async () => {
    const user = userEvent.setup()
    const error = {
      errors: [
        { path: ['description'], message: 'Description is required' },
      ],
    }
    mockUpdateMutation.mutateAsync.mockRejectedValue(error)

    render(
      <EditCodeModal
        isOpen={true}
        onClose={mockOnClose}
        code={mockDiagnosticCode}
      />
    )

    // Clear description and submit
    const descriptionInput = screen.getByDisplayValue(mockDiagnosticCode.description)
    await user.clear(descriptionInput)

    const submitButton = screen.getByRole('button', { name: /Update Code/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    })
  })
})
