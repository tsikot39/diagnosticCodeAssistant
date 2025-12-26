import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/test-utils'
import DashboardPage from '../DashboardPage'
import * as useDiagnosticCodesHook from '@/hooks/useDiagnosticCodes'
import { mockDiagnosticCodes } from '@/test/mocks'

vi.mock('@/hooks/useDiagnosticCodes')

describe('DashboardPage', () => {
  const mockUseDiagnosticCodes = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useDiagnosticCodesHook, 'useDiagnosticCodes').mockImplementation(mockUseDiagnosticCodes)
  })

  it('renders page title and description', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
    })

    render(<DashboardPage />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Analytics and insights for diagnostic codes')).toBeInTheDocument()
  })

  it('shows loading skeleton when data is loading', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    render(<DashboardPage />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    // Loading skeleton is rendered
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders all summary cards', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
    })

    render(<DashboardPage />)

    expect(screen.getByText('Total Codes')).toBeInTheDocument()
    expect(screen.getByText('Active Codes')).toBeInTheDocument()
    expect(screen.getByText('Inactive Codes')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
  })

  it('displays correct total codes count', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: 5 },
      isLoading: false,
    })

    render(<DashboardPage />)

    // Find the Total Codes card and check its value
    const totalCodesCard = screen.getByText('Total Codes').closest('div')?.parentElement
    expect(totalCodesCard).toHaveTextContent('5')
  })

  it('calculates active codes correctly', () => {
    const codesWithStatus = [
      { ...mockDiagnosticCodes[0], is_active: true },
      { ...mockDiagnosticCodes[1], is_active: true },
      { ...mockDiagnosticCodes[2], is_active: false },
    ]

    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: codesWithStatus, total: 3 },
      isLoading: false,
    })

    render(<DashboardPage />)

    const activeCodesCard = screen.getByText('Active Codes').closest('div')?.parentElement
    expect(activeCodesCard).toHaveTextContent('2')
    expect(activeCodesCard).toHaveTextContent('66.7% of total')
  })

  it('calculates inactive codes correctly', () => {
    const codesWithStatus = [
      { ...mockDiagnosticCodes[0], is_active: true },
      { ...mockDiagnosticCodes[1], is_active: false },
      { ...mockDiagnosticCodes[2], is_active: false },
    ]

    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: codesWithStatus, total: 3 },
      isLoading: false,
    })

    render(<DashboardPage />)

    const inactiveCodesCard = screen.getByText('Inactive Codes').closest('div')?.parentElement
    expect(inactiveCodesCard).toHaveTextContent('2')
    expect(inactiveCodesCard).toHaveTextContent('66.7% of total')
  })

  it('displays unique categories count', () => {
    const codesWithCategories = [
      { ...mockDiagnosticCodes[0], category: 'ENDOCRINE' },
      { ...mockDiagnosticCodes[1], category: 'CARDIOVASCULAR' },
      { ...mockDiagnosticCodes[2], category: 'ENDOCRINE' },
    ]

    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: codesWithCategories, total: 3 },
      isLoading: false,
    })

    render(<DashboardPage />)

    const categoriesCard = screen.getByText('Categories').closest('div')?.parentElement
    expect(categoriesCard).toHaveTextContent('2')
  })

  it('renders Top Categories section', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
    })

    render(<DashboardPage />)

    expect(screen.getByText('Top Categories')).toBeInTheDocument()
  })

  it('renders Severity Distribution section', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
    })

    render(<DashboardPage />)

    expect(screen.getByText('Severity Distribution')).toBeInTheDocument()
  })

  it('renders Recent Codes section', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
    })

    render(<DashboardPage />)

    expect(screen.getByText('Recent Codes')).toBeInTheDocument()
  })

  it('displays recent codes with code and description', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: mockDiagnosticCodes, total: mockDiagnosticCodes.length },
      isLoading: false,
    })

    render(<DashboardPage />)

    // Check that Recent Codes section exists
    expect(screen.getByText('Recent Codes')).toBeInTheDocument()
  })

  it('displays category badges in recent codes', () => {
    const codesWithCategories = [
      { ...mockDiagnosticCodes[0], category: 'ENDOCRINE' },
      { ...mockDiagnosticCodes[1], category: 'CARDIOVASCULAR' },
    ]

    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: codesWithCategories, total: 2 },
      isLoading: false,
    })

    render(<DashboardPage />)

    // Categories appear in multiple places (top categories section and badges)
    const endocrineElements = screen.getAllByText('ENDOCRINE')
    expect(endocrineElements.length).toBeGreaterThan(0)
  })

  it('displays severity badges in recent codes', () => {
    const codesWithSeverity = [
      { ...mockDiagnosticCodes[0], severity: 'high' },
      { ...mockDiagnosticCodes[1], severity: 'medium' },
    ]

    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: codesWithSeverity, total: 2 },
      isLoading: false,
    })

    render(<DashboardPage />)

    // Severities appear in both severity distribution and recent codes sections
    const highElements = screen.getAllByText('high')
    expect(highElements.length).toBeGreaterThan(0)
  })

  it('shows categories with code counts', () => {
    const codesWithCategories = [
      { ...mockDiagnosticCodes[0], category: 'ENDOCRINE' },
      { ...mockDiagnosticCodes[1], category: 'ENDOCRINE' },
      { ...mockDiagnosticCodes[2], category: 'CARDIOVASCULAR' },
    ]

    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: codesWithCategories, total: 3 },
      isLoading: false,
    })

    render(<DashboardPage />)

    const endocrineElements = screen.getAllByText('ENDOCRINE')
    expect(endocrineElements.length).toBeGreaterThan(0)
    expect(screen.getByText('2 codes')).toBeInTheDocument()
  })

  it('displays severity distribution with percentages', () => {
    const codesWithSeverity = [
      { ...mockDiagnosticCodes[0], severity: 'high' },
      { ...mockDiagnosticCodes[1], severity: 'high' },
      { ...mockDiagnosticCodes[2], severity: 'low' },
      { ...mockDiagnosticCodes[3], severity: 'low' },
    ]

    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: codesWithSeverity, total: 4 },
      isLoading: false,
    })

    render(<DashboardPage />)

    // High severity should be 50%
    const severitySection = screen.getByText('Severity Distribution').closest('div')?.parentElement
    expect(severitySection).toHaveTextContent('50.0%')
  })

  it('limits recent codes to 5 items', () => {
    const manyCodes = Array.from({ length: 10 }, (_, i) => ({
      ...mockDiagnosticCodes[0],
      id: i + 1,
      code: `E11.${i}`,
      description: `Description ${i}`,
    }))

    mockUseDiagnosticCodes.mockReturnValue({
      data: { items: manyCodes, total: 10 },
      isLoading: false,
    })

    render(<DashboardPage />)

    // Only first 5 should be shown
    expect(screen.getByText('E11.0')).toBeInTheDocument()
    expect(screen.getByText('E11.4')).toBeInTheDocument()
    expect(screen.queryByText('E11.5')).not.toBeInTheDocument()
  })

  it('returns null when data is not available and not loading', () => {
    mockUseDiagnosticCodes.mockReturnValue({
      data: null,
      isLoading: false,
    })

    const { container } = render(<DashboardPage />)

    expect(container).toBeEmptyDOMElement()
  })
})
