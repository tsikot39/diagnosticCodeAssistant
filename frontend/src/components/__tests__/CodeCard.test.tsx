import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { mockDiagnosticCode } from '@/test/mocks'
import CodeCard from '@/components/CodeCard'

describe('CodeCard', () => {
  it('renders code information correctly', () => {
    render(<CodeCard code={mockDiagnosticCode} />)

    expect(screen.getByText(mockDiagnosticCode.code)).toBeInTheDocument()
    expect(screen.getByText(mockDiagnosticCode.description)).toBeInTheDocument()
  })

  it('displays category badge when category exists', () => {
    render(<CodeCard code={mockDiagnosticCode} />)

    expect(screen.getByText(mockDiagnosticCode.category!)).toBeInTheDocument()
  })

  it('displays severity badge with correct color', () => {
    render(<CodeCard code={mockDiagnosticCode} />)

    expect(screen.getByText(mockDiagnosticCode.severity!)).toBeInTheDocument()
  })

  it('shows inactive badge when code is inactive', () => {
    const inactiveCode = { ...mockDiagnosticCode, is_active: false }
    render(<CodeCard code={inactiveCode} />)

    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('shows checkbox when onToggleSelect is provided', () => {
    const handleToggle = () => {}
    render(<CodeCard code={mockDiagnosticCode} onToggleSelect={handleToggle} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('does not show checkbox when onToggleSelect is not provided', () => {
    render(<CodeCard code={mockDiagnosticCode} />)

    const checkbox = screen.queryByRole('checkbox')
    expect(checkbox).not.toBeInTheDocument()
  })

  it('applies selected styling when isSelected is true', () => {
    const handleToggle = () => {}
    render(
      <CodeCard 
        code={mockDiagnosticCode} 
        isSelected={true} 
        onToggleSelect={handleToggle} 
      />
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('renders Edit and Delete buttons', () => {
    render(<CodeCard code={mockDiagnosticCode} />)

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })
})
