import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { BulkDeleteConfirmModal } from '../BulkDeleteConfirmModal'
import userEvent from '@testing-library/user-event'

describe('BulkDeleteConfirmModal', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    count: 3,
    isDeleting: false,
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <BulkDeleteConfirmModal {...defaultProps} isOpen={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders modal when isOpen is true', () => {
    render(<BulkDeleteConfirmModal {...defaultProps} />)
    
    expect(screen.getByText(/Confirm Bulk Delete/i)).toBeInTheDocument()
  })

  it('displays count of items to delete', () => {
    render(<BulkDeleteConfirmModal {...defaultProps} count={5} />)

    expect(screen.getAllByText(/5/)[0]).toBeInTheDocument()
    expect(screen.getByText(/diagnostic codes/i)).toBeInTheDocument()
  })

  it('uses singular form for count of 1', () => {
    render(<BulkDeleteConfirmModal {...defaultProps} count={1} />)

    expect(screen.getAllByText(/1/)[0]).toBeInTheDocument()
    expect(screen.getByText(/diagnostic code/i)).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<BulkDeleteConfirmModal {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when Delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<BulkDeleteConfirmModal {...defaultProps} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete 3 codes/i })
    await user.click(deleteButton)
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('disables buttons when isDeleting is true', () => {
    render(<BulkDeleteConfirmModal {...defaultProps} isDeleting={true} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    const deleteButton = screen.getByRole('button', { name: /deleting/i })
    
    expect(cancelButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
  })

  it('shows warning message about irreversibility', () => {
    render(<BulkDeleteConfirmModal {...defaultProps} />)
    
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
  })
})
