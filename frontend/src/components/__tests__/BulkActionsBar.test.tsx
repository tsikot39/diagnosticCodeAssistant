import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { BulkActionsBar } from '@/components/BulkActionsBar'

describe('BulkActionsBar', () => {
  const defaultProps = {
    selectedCount: 3,
    totalCount: 10,
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onBulkDelete: () => {},
    onBulkExport: () => {},
  }

  it('does not render when no items are selected', () => {
    const { container } = render(<BulkActionsBar {...defaultProps} selectedCount={0} />)
    expect(container.firstChild).toBeNull()
  })

  it('displays selected count correctly', () => {
    render(<BulkActionsBar {...defaultProps} />)
    expect(screen.getByText('3 items selected')).toBeInTheDocument()
  })

  it('displays singular form when one item selected', () => {
    render(<BulkActionsBar {...defaultProps} selectedCount={1} />)
    expect(screen.getByText('1 item selected')).toBeInTheDocument()
  })

  it('shows "Select all" button when not all items are selected', () => {
    render(<BulkActionsBar {...defaultProps} />)
    expect(screen.getByText(/Select all 10/i)).toBeInTheDocument()
  })

  it('hides "Select all" button when all items are selected', () => {
    render(<BulkActionsBar {...defaultProps} selectedCount={10} totalCount={10} />)
    expect(screen.queryByText(/Select all/i)).not.toBeInTheDocument()
  })

  it('renders all action buttons', () => {
    render(<BulkActionsBar {...defaultProps} />)

    expect(screen.getByRole('button', { name: /export selected/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete selected/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })
})
