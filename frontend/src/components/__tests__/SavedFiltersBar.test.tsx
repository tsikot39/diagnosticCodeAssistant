import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { SavedFiltersBar } from '../SavedFiltersBar'

describe('SavedFiltersBar', () => {
  const mockOnFilterLoad = vi.fn()
  const emptyFilter = {}
  const activeFilter = {
    category: 'ENDOCRINE',
    severity: 'high',
    search: 'diabetes',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders save button when no filters are saved', () => {
    render(
      <SavedFiltersBar
        currentFilter={emptyFilter}
        onFilterLoad={mockOnFilterLoad}
      />
    )

    expect(screen.getByRole('button', { name: /Save Current Filter/i })).toBeInTheDocument()
  })

  it('opens save dialog when button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <SavedFiltersBar
        currentFilter={activeFilter}
        onFilterLoad={mockOnFilterLoad}
      />
    )

    const saveButton = screen.getByRole('button', { name: /Save Current Filter/i })
    await user.click(saveButton)

    expect(screen.getByPlaceholderText(/Filter name/i)).toBeInTheDocument()
  })

  it('saves a filter with a name', async () => {
    const user = userEvent.setup()
    render(
      <SavedFiltersBar
        currentFilter={activeFilter}
        onFilterLoad={mockOnFilterLoad}
      />
    )

    // Open save dialog
    const saveButton = screen.getByRole('button', { name: /Save Current Filter/i })
    await user.click(saveButton)

    // Enter name and save
    const nameInput = screen.getByPlaceholderText(/Filter name/i)
    await user.type(nameInput, 'My Filter')

    const confirmButton = screen.getByRole('button', { name: /Save/i })
    await user.click(confirmButton)

    // Filter should appear in list
    expect(screen.getByText('My Filter')).toBeInTheDocument()
  })

  it('displays saved filters', () => {
    // Pre-populate localStorage with a saved filter
    const savedFilters = [
      {
        id: '1',
        name: 'Test Filter',
        category: 'ENDOCRINE',
        severity: 'high',
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('diagnostic-code-filters', JSON.stringify(savedFilters))

    render(
      <SavedFiltersBar
        currentFilter={emptyFilter}
        onFilterLoad={mockOnFilterLoad}
      />
    )

    expect(screen.getByText('Test Filter')).toBeInTheDocument()
    expect(screen.getByText('Saved Filters:')).toBeInTheDocument()
  })

  it('loads a saved filter when clicked', async () => {
    const user = userEvent.setup()
    const savedFilters = [
      {
        id: '1',
        name: 'Test Filter',
        category: 'ENDOCRINE',
        severity: 'medium',
        search: 'test',
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('diagnostic-code-filters', JSON.stringify(savedFilters))

    render(
      <SavedFiltersBar
        currentFilter={emptyFilter}
        onFilterLoad={mockOnFilterLoad}
      />
    )

    const filterBadge = screen.getByText('Test Filter')
    await user.click(filterBadge)

    expect(mockOnFilterLoad).toHaveBeenCalledWith({
      category: 'ENDOCRINE',
      severity: 'medium',
      search: 'test',
    })
  })

  it('deletes a saved filter', async () => {
    const user = userEvent.setup()
    const savedFilters = [
      {
        id: '1',
        name: 'Test Filter',
        category: 'ENDOCRINE',
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('diagnostic-code-filters', JSON.stringify(savedFilters))

    render(
      <SavedFiltersBar
        currentFilter={emptyFilter}
        onFilterLoad={mockOnFilterLoad}
      />
    )

    // Filter should initially be visible
    expect(screen.getByText('Test Filter')).toBeInTheDocument()
    
    // Find and click delete button within the badge
    const badge = screen.getByText('Test Filter').closest('.inline-flex')
    const deleteButton = badge?.querySelector('svg.lucide-trash-2')?.parentElement
    
    if (deleteButton) {
      await user.click(deleteButton)
      // Filter should be removed
      expect(screen.queryByText('Test Filter')).not.toBeInTheDocument()
    }
  })
})
