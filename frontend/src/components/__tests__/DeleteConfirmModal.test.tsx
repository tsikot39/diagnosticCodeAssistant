import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'
import { mockDiagnosticCode } from '@/test/mocks'

describe('DeleteConfirmModal', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    code: mockDiagnosticCode,
    isDeleting: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DeleteConfirmModal {...defaultProps} isOpen={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders modal when isOpen is true', () => {
    render(<DeleteConfirmModal {...defaultProps} />)
    
    expect(screen.getByText(/Delete Diagnostic Code/i)).toBeInTheDocument()
  })

  it('displays the code being deleted', () => {
    render(<DeleteConfirmModal {...defaultProps} />)
    
    expect(screen.getAllByText(mockDiagnosticCode.code)[0]).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<DeleteConfirmModal {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when Delete is clicked', async () => {
    const user = userEvent.setup()
    render(<DeleteConfirmModal {...defaultProps} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete code/i })
    await user.click(deleteButton)
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('disables buttons when isDeleting is true', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    const deleteButton = screen.getByRole('button', { name: /deleting/i })
    
    expect(cancelButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
  })

  it('shows "Deleting..." text when isDeleting is true', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />)
    
    expect(screen.getByText(/Deleting.../i)).toBeInTheDocument()
  })
})
