import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { FilterBar } from '../FilterBar'
import userEvent from '@testing-library/user-event'

const defaultProps = {
  categories: [
    { label: 'Error', value: 'error' },
    { label: 'Warning', value: 'warning' },
  ],
  severities: [
    { label: 'Low', value: 'low' },
    { label: 'High', value: 'high' },
  ],
  activeFilters: {},
  onFilterChange: vi.fn(),
}

describe('FilterBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders filter button', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument()
  })

  it('toggles filter panel when filter button is clicked', async () => {
    const user = userEvent.setup()
    render(<FilterBar {...defaultProps} />)

    const filterButton = screen.getByRole('button', { name: /filters/i })
    await user.click(filterButton)

    expect(screen.getByText('Category')).toBeInTheDocument()
  })

  it('renders category and severity filters', async () => {
    const user = userEvent.setup()
    render(<FilterBar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /filters/i }))

    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Severity')).toBeInTheDocument()
  })

  it('displays all category options', async () => {
    const user = userEvent.setup()
    const { categories } = defaultProps
    render(<FilterBar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /filters/i }))

    categories.forEach(cat => {
      expect(screen.getByText(cat.label)).toBeInTheDocument()
    })
  })

  it('displays all severity options', async () => {
    const user = userEvent.setup()
    const { severities } = defaultProps
    render(<FilterBar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /filters/i }))

    severities.forEach(sev => {
      expect(screen.getByText(sev.label)).toBeInTheDocument()
    })
  })

  it('calls onFilterChange when category is selected', async () => {
    const user = userEvent.setup()
    const mockOnFilterChange = vi.fn()
    render(<FilterBar {...defaultProps} onFilterChange={mockOnFilterChange} />)

    await user.click(screen.getByRole('button', { name: /filters/i }))

    const errorBadge = screen.getByText('Error')
    await user.click(errorBadge)

    expect(mockOnFilterChange).toHaveBeenCalledWith({ category: 'error' })
  })

  it('calls onFilterChange when severity is selected', async () => {
    const user = userEvent.setup()
    const mockOnFilterChange = vi.fn()
    render(<FilterBar {...defaultProps} onFilterChange={mockOnFilterChange} />)

    await user.click(screen.getByRole('button', { name: /filters/i }))

    const highBadge = screen.getByText('High')
    await user.click(highBadge)

    expect(mockOnFilterChange).toHaveBeenCalledWith({ severity: 'high' })
  })

  it('highlights active category filter', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <FilterBar
        {...defaultProps}
        activeFilters={{ category: 'error' }}
      />
    )

    await user.click(screen.getByRole('button', { name: /filters/i }))

    // Find the Error badge element directly
    const errorBadge = screen.getByText('Error')
    expect(errorBadge).toHaveClass('bg-primary')
  })

  it('highlights active severity filter', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <FilterBar
        {...defaultProps}
        activeFilters={{ severity: 'high' }}
      />
    )

    await user.click(screen.getByRole('button', { name: /filters/i }))

    // Find the High badge element directly
    const highBadge = screen.getByText('High')
    expect(highBadge).toHaveClass('bg-primary')
  })

  it('shows Clear All button when filters are active', () => {
    render(
      <FilterBar
        {...defaultProps}
        activeFilters={{ category: 'error', severity: 'high' }}
      />
    )

    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
  })

  it('clears filters when Clear All is clicked', async () => {
    const user = userEvent.setup()
    const mockOnFilterChange = vi.fn()
    render(
      <FilterBar
        {...defaultProps}
        activeFilters={{ category: 'error' }}
        onFilterChange={mockOnFilterChange}
      />
    )

    const clearButton = screen.getByRole('button', { name: /clear all/i })
    await user.click(clearButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith({})
  })
})
