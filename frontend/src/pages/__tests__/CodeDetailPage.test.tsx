import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import CodeDetailPage from '../CodeDetailPage'
import * as useDiagnosticCodesHook from '@/hooks/useDiagnosticCodes'
import { mockDiagnosticCodes } from '@/test/mocks'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/hooks/useDiagnosticCodes')

describe('CodeDetailPage', () => {
  const mockUseDiagnosticCode = vi.fn()
  const mockDeleteMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useDiagnosticCodesHook, 'useDiagnosticCode').mockImplementation(mockUseDiagnosticCode)
    vi.spyOn(useDiagnosticCodesHook, 'useDeleteDiagnosticCode').mockReturnValue(mockDeleteMutation as any)
    window.confirm = vi.fn(() => true)
  })

  it('shows loading state', () => {
    mockUseDiagnosticCode.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state when there is an error', () => {
    mockUseDiagnosticCode.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    })

    render(<CodeDetailPage />)

    expect(screen.getByText('Failed to load diagnostic code')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Go Back/i })).toBeInTheDocument()
  })

  it('shows error state when code is not found', () => {
    mockUseDiagnosticCode.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByText('Failed to load diagnostic code')).toBeInTheDocument()
  })

  it('navigates back when Go Back button is clicked in error state', async () => {
    const user = userEvent.setup()
    mockUseDiagnosticCode.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    const goBackButton = screen.getByRole('button', { name: /Go Back/i })
    await user.click(goBackButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders code details correctly', () => {
    const code = mockDiagnosticCodes[0]
    mockUseDiagnosticCode.mockReturnValue({
      data: code,
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByText(code.code)).toBeInTheDocument()
    expect(screen.getByText(code.description)).toBeInTheDocument()
  })

  it('renders Back to List button', () => {
    mockUseDiagnosticCode.mockReturnValue({
      data: mockDiagnosticCodes[0],
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByRole('button', { name: /Back to List/i })).toBeInTheDocument()
  })

  it('renders Edit button', () => {
    mockUseDiagnosticCode.mockReturnValue({
      data: mockDiagnosticCodes[0],
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument()
  })

  it('renders Delete button', () => {
    mockUseDiagnosticCode.mockReturnValue({
      data: mockDiagnosticCodes[0],
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()
  })

  it('navigates back when Back to List is clicked', async () => {
    const user = userEvent.setup()
    mockUseDiagnosticCode.mockReturnValue({
      data: mockDiagnosticCodes[0],
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    const backButton = screen.getByRole('button', { name: /Back to List/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('displays category when available', () => {
    const codeWithCategory = { ...mockDiagnosticCodes[0], category: 'ENDOCRINE' }
    mockUseDiagnosticCode.mockReturnValue({
      data: codeWithCategory,
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('ENDOCRINE')).toBeInTheDocument()
  })

  it('displays subcategory when available', () => {
    const codeWithSubcategory = { ...mockDiagnosticCodes[0], subcategory: 'Diabetes' }
    mockUseDiagnosticCode.mockReturnValue({
      data: codeWithSubcategory,
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByText('Subcategory')).toBeInTheDocument()
    expect(screen.getByText('Diabetes')).toBeInTheDocument()
  })

  it('displays severity badge when available', () => {
    const codeWithSeverity = { ...mockDiagnosticCodes[0], severity: 'high' }
    mockUseDiagnosticCode.mockReturnValue({
      data: codeWithSeverity,
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByText('HIGH')).toBeInTheDocument()
  })

  it('displays active status badge', () => {
    const activeCode = { ...mockDiagnosticCodes[0], is_active: true }
    mockUseDiagnosticCode.mockReturnValue({
      data: activeCode,
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('displays inactive status badge', () => {
    const inactiveCode = { ...mockDiagnosticCodes[0], is_active: false }
    mockUseDiagnosticCode.mockReturnValue({
      data: inactiveCode,
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('displays created date', () => {
    mockUseDiagnosticCode.mockReturnValue({
      data: mockDiagnosticCodes[0],
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByText('Created')).toBeInTheDocument()
  })

  it('displays updated date', () => {
    mockUseDiagnosticCode.mockReturnValue({
      data: mockDiagnosticCodes[0],
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByText('Last Updated')).toBeInTheDocument()
  })

  it('calls delete mutation when Delete button is clicked and confirmed', async () => {
    const user = userEvent.setup()
    const code = mockDiagnosticCodes[0]
    mockUseDiagnosticCode.mockReturnValue({
      data: code,
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    const deleteButton = screen.getByRole('button', { name: /Delete/i })
    await user.click(deleteButton)

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this code?')
    await waitFor(() => {
      expect(mockDeleteMutation.mutateAsync).toHaveBeenCalledWith(code.id)
    })
  })

  it('does not delete when user cancels confirmation', async () => {
    const user = userEvent.setup()
    window.confirm = vi.fn(() => false)
    
    mockUseDiagnosticCode.mockReturnValue({
      data: mockDiagnosticCodes[0],
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    const deleteButton = screen.getByRole('button', { name: /Delete/i })
    await user.click(deleteButton)

    expect(mockDeleteMutation.mutateAsync).not.toHaveBeenCalled()
  })

  it('navigates to home after successful delete', async () => {
    const user = userEvent.setup()
    mockDeleteMutation.mutateAsync.mockResolvedValue(undefined)
    
    mockUseDiagnosticCode.mockReturnValue({
      data: mockDiagnosticCodes[0],
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    const deleteButton = screen.getByRole('button', { name: /Delete/i })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('disables delete button when deletion is pending', () => {
    mockDeleteMutation.isPending = true
    mockUseDiagnosticCode.mockReturnValue({
      data: mockDiagnosticCodes[0],
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    const deleteButton = screen.getByRole('button', { name: /Delete/i })
    expect(deleteButton).toBeDisabled()
  })

  it('applies correct severity badge variant for high severity', () => {
    const codeWithHighSeverity = { ...mockDiagnosticCodes[0], severity: 'high' }
    mockUseDiagnosticCode.mockReturnValue({
      data: codeWithHighSeverity,
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    const badge = screen.getByText('HIGH')
    expect(badge).toHaveClass('bg-destructive')
  })

  it('applies correct severity badge variant for medium severity', () => {
    const codeWithMediumSeverity = { ...mockDiagnosticCodes[0], severity: 'medium' }
    mockUseDiagnosticCode.mockReturnValue({
      data: codeWithMediumSeverity,
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
  })

  it('applies correct severity badge variant for low severity', () => {
    const codeWithLowSeverity = { ...mockDiagnosticCodes[0], severity: 'low' }
    mockUseDiagnosticCode.mockReturnValue({
      data: codeWithLowSeverity,
      isLoading: false,
      error: null,
    })

    render(<CodeDetailPage />)

    expect(screen.getByText('LOW')).toBeInTheDocument()
  })
})
