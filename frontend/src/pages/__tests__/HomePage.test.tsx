import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import HomePage from '../HomePage'
import * as useDiagnosticCodesHook from '@/hooks/useDiagnosticCodes'
import { mockDiagnosticCodes } from '@/test/mocks'

vi.mock('@/hooks/useDiagnosticCodes')

describe('HomePage', () => {
  const mockUseDiagnosticCodes = vi.fn()
  const mockDeleteMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  }
  const mockCreateMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useDiagnosticCodesHook, 'useDiagnosticCodes').mockImplementation(mockUseDiagnosticCodes)
    vi.spyOn(useDiagnosticCodesHook, 'useDeleteDiagnosticCode').mockReturnValue(mockDeleteMutation as any)
    vi.spyOn(useDiagnosticCodesHook, 'useCreateDiagnosticCode').mockReturnValue(mockCreateMutation as any)
  })

  it('renders page title and description', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    expect(screen.getByText('Diagnostic Codes')).toBeInTheDocument()
    expect(screen.getByText('Search and manage diagnostic codes')).toBeInTheDocument()
  })

  it('renders search input with placeholder', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    expect(screen.getByPlaceholderText(/Search codes or descriptions/i)).toBeInTheDocument()
  })

  it('renders Add Code button', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    expect(screen.getByRole('button', { name: /Add Code/i })).toBeInTheDocument()
  })

  it('renders Import button', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    expect(screen.getByRole('button', { name: /Import/i })).toBeInTheDocument()
  })

  it('shows loading skeleton when data is loading', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<HomePage />)

    // LoadingSkeleton renders 6 skeleton cards in a grid
    const skeletonCards = screen.getAllByTestId('code-card-skeleton')
    expect(skeletonCards).toHaveLength(6)
  })

  it('shows error message when there is an error', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    })

    render(<HomePage />)

    expect(screen.getByText('Failed to load diagnostic codes')).toBeInTheDocument()
    expect(screen.getByText('Please try again later')).toBeInTheDocument()
  })

  it('shows empty state when no codes are found', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    expect(screen.getByText('No diagnostic codes found')).toBeInTheDocument()
  })

  it('renders code cards when data is available', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    // Check for codes from mockDiagnosticCodes
    expect(screen.getByText('E001')).toBeInTheDocument()
    expect(screen.getByText('W002')).toBeInTheDocument()
  })

  it('updates search input and resets page to 1', async () => {
    const user = userEvent.setup()
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    const searchInput = screen.getByPlaceholderText(/Search codes or descriptions/i)
    await user.type(searchInput, 'diabetes')

    await waitFor(() => {
      expect(searchInput).toHaveValue('diabetes')
    })
  })

  it('opens CodeFormModal when Add Code button is clicked', async () => {
    const user = userEvent.setup()
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    const addButton = screen.getByRole('button', { name: /Add Code/i })
    await user.click(addButton)

    // Modal should be rendered (checking for modal title)
    await waitFor(() => {
      expect(screen.getByText(/Add New Diagnostic Code/i)).toBeInTheDocument()
    })
  })

  it('opens ImportModal when Import button is clicked', async () => {
    const user = userEvent.setup()
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    const importButton = screen.getByRole('button', { name: /Import/i })
    await user.click(importButton)

    // Modal should be rendered
    await waitFor(() => {
      expect(screen.getByText(/Import Diagnostic Codes/i)).toBeInTheDocument()
    })
  })

  it('renders ExportButton when codes are available', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument()
  })

  it('does not render ExportButton when no codes are available', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    expect(screen.queryByRole('button', { name: /Export CSV/i })).not.toBeInTheDocument()
  })

  it('renders FilterBar component', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    expect(screen.getByRole('button', { name: /Filters/i })).toBeInTheDocument()
  })

  it('renders BulkActionsBar when items are available', async () => {
    const user = userEvent.setup()
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    // BulkActionsBar doesn't render until at least one item is selected
    expect(screen.queryByText(/selected/i)).not.toBeInTheDocument()
    
    // Select one item to make BulkActionsBar appear
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    
    // Now BulkActionsBar should be visible
    expect(await screen.findByText(/1 item selected/i)).toBeInTheDocument()
    expect(screen.getByText(/Select all 3/i)).toBeInTheDocument()
  })

  it('does not render BulkActionsBar when no items are available', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    expect(screen.queryByText(/Select All/i)).not.toBeInTheDocument()
  })

  it('renders pagination when there are multiple pages', () => {
    const manyItems = Array.from({ length: 15 }, (_, i) => ({
      ...mockDiagnosticCodes[0],
      id: i + 1,
      code: `E11.${i}`,
    }))

    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: manyItems.slice(0, 12), total: 15 },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    // Pagination shows "Showing 1 to 12 of 15 results"
    expect(screen.getByText(/Showing/i)).toBeInTheDocument()
    // "1" appears multiple times (in "Showing 1..." and as page button 1)
    const ones = screen.getAllByText('1')
    expect(ones.length).toBeGreaterThan(0)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText(/results/i)).toBeInTheDocument()
  })

  it('does not render pagination when there is only one page', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    // Pagination should not show "of X" text when totalPages <= 1
    expect(screen.queryByText(/of \d+/i)).not.toBeInTheDocument()
  })

  it('allows selecting individual code cards', async () => {
    const user = userEvent.setup()
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    // Checkbox should be checked
    expect(checkboxes[0]).toBeChecked()
  })

  it('selects all codes when Select All is clicked', async () => {
    const user = userEvent.setup()
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    // First select one item to show bulk actions bar
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    // Now find and click select all button
    const selectAllButton = await screen.findByRole('button', { name: /Select all/i })
    await user.click(selectAllButton)

    // All checkboxes should be checked
    const allCheckboxes = screen.getAllByRole('checkbox')
    allCheckboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked()
    })
  })

  it('deselects all codes when Clear is clicked', async () => {
    const user = userEvent.setup()
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    // First select one item to show bulk actions bar
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(checkboxes[1])

    // Then click clear button
    const clearButton = await screen.findByRole('button', { name: /Clear/i })
    await user.click(clearButton)

    // All checkboxes should be unchecked
    const allCheckboxes = screen.getAllByRole('checkbox')
    allCheckboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked()
    })
  })

  it('opens bulk delete modal when bulk delete is clicked', async () => {
    const user = userEvent.setup()
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
      error: null,
    })

    render(<HomePage />)

    // Select some codes first to show bulk actions bar
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    // Click bulk delete
    const deleteButton = await screen.findByRole('button', { name: /Delete Selected/i })
    await user.click(deleteButton)

    // Bulk delete modal should open
    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument()
    })
  })
})
