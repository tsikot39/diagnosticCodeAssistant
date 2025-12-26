import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import CodeFormModal from '../CodeFormModal'
import * as useDiagnosticCodesHook from '@/hooks/useDiagnosticCodes'

vi.mock('@/hooks/useDiagnosticCodes')

describe('CodeFormModal', () => {
  const mockCreateMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  }
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useDiagnosticCodesHook, 'useCreateDiagnosticCode').mockReturnValue(mockCreateMutation as any)
    // Clear localStorage to avoid draft conflicts
    localStorage.clear()
  })

  it('does not render when isOpen is false', () => {
    render(
      <CodeFormModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.queryByText('Add Diagnostic Code')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(
      <CodeFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText('Add New Diagnostic Code')).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    render(
      <CodeFormModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByPlaceholderText(/e.g., E001/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter description/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e.g., Medical, System/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e.g., Diagnostic/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument() // severity select
    expect(screen.getByRole('checkbox', { name: /Active/i })).toBeInTheDocument()
  })

  it('renders form action buttons', () => {
    render(
      <CodeFormModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByRole('button', { name: /Create Code/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CodeFormModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getAllByRole('button').find(btn => btn.querySelector('svg'))
    if (closeButton) {
      await user.click(closeButton)
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CodeFormModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('updates form fields when typing', async () => {
    const user = userEvent.setup()
    render(
      <CodeFormModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const codeInput = screen.getByPlaceholderText(/e.g., E001/i)
    const descriptionInput = screen.getByPlaceholderText(/Enter description/i)

    await user.type(codeInput, 'TEST123')
    await user.type(descriptionInput, 'Test description')

    expect(codeInput).toHaveValue('TEST123')
    expect(descriptionInput).toHaveValue('Test description')
  })

  it('updates severity select field', async () => {
    const user = userEvent.setup()
    render(
      <CodeFormModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const severitySelect = screen.getByRole('combobox')
    await user.selectOptions(severitySelect, 'high')

    expect(severitySelect).toHaveValue('high')
  })

  it('toggles active checkbox', async () => {
    const user = userEvent.setup()
    render(
      <CodeFormModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const activeCheckbox = screen.getByRole('checkbox', { name: /Active/i })
    
    // Should be checked by default
    expect(activeCheckbox).toBeChecked()

    await user.click(activeCheckbox)
    expect(activeCheckbox).not.toBeChecked()

    await user.click(activeCheckbox)
    expect(activeCheckbox).toBeChecked()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockCreateMutation.mutateAsync.mockResolvedValue({})

    render(
      <CodeFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    // Fill in required fields
    await user.type(screen.getByPlaceholderText(/e.g., E001/i), 'E11.9')
    await user.type(screen.getByPlaceholderText(/Enter description/i), 'Type 2 diabetes')
    await user.type(screen.getByPlaceholderText(/e.g., Medical, System/i), 'ENDOCRINE')
    await user.selectOptions(screen.getByRole('combobox'), 'medium')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create Code/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateMutation.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'E11.9',
          description: 'Type 2 diabetes',
          category: 'ENDOCRINE',
          severity: 'medium',
          is_active: true,
        })
      )
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('shows loading state when submitting', async () => {
    const user = userEvent.setup()
    const slowMutation = {
      ...mockCreateMutation,
      isPending: true,
    }
    vi.spyOn(useDiagnosticCodesHook, 'useCreateDiagnosticCode').mockReturnValue(slowMutation as any)

    render(
      <CodeFormModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const submitButton = screen.getByRole('button', { name: /Creating.../i })
    expect(submitButton).toBeDisabled()
  })

  it('handles submission errors', async () => {
    const user = userEvent.setup()
    const error = {
      errors: [
        { path: ['code'], message: 'Code is required' },
        { path: ['description'], message: 'Description is required' },
      ],
    }
    mockCreateMutation.mutateAsync.mockRejectedValue(error)

    render(
      <CodeFormModal
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    // Submit without filling fields
    const submitButton = screen.getByRole('button', { name: /Create Code/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Code is required')).toBeInTheDocument()
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    })
  })
})
