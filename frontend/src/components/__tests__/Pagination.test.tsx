import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Pagination } from '@/components/Pagination'

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: () => {},
  }

  it('renders current page and total pages', () => {
    render(<Pagination {...defaultProps} />)

    expect(screen.getByText('1', { selector: 'button' })).toBeInTheDocument()
  })

  it('disables Previous button on first page', () => {
    const { container } = render(<Pagination {...defaultProps} currentPage={1} />)

    const buttons = container.querySelectorAll('button')
    // First two buttons are prev buttons
    expect(buttons[0]).toBeDisabled()
    expect(buttons[1]).toBeDisabled()
  })

  it('disables Next button on last page', () => {
    const { container } = render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />)

    const buttons = container.querySelectorAll('button')
    // Last two buttons are next buttons
    expect(buttons[buttons.length - 1]).toBeDisabled()
    expect(buttons[buttons.length - 2]).toBeDisabled()
  })

  it('enables both buttons on middle pages', () => {
    const { container } = render(<Pagination {...defaultProps} currentPage={3} />)

    const buttons = container.querySelectorAll('button')
    // First two and last two are nav buttons
    expect(buttons[0]).not.toBeDisabled()
    expect(buttons[1]).not.toBeDisabled()
    expect(buttons[buttons.length - 1]).not.toBeDisabled()
    expect(buttons[buttons.length - 2]).not.toBeDisabled()
  })

  it('displays item count information', () => {
    render(<Pagination {...defaultProps} />)

    expect(screen.getByText(/Showing/i)).toBeInTheDocument()
    expect(screen.getByText(/50/)).toBeInTheDocument()
    expect(screen.getByText(/results/i)).toBeInTheDocument()
  })
})
