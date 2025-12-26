import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { ThemeToggle } from '../ThemeToggle'

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('has accessible aria-label', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toHaveAttribute('aria-label', 'Toggle theme')
  })

  it('renders theme icon', () => {
    const { container } = render(<ThemeToggle />)

    const icon = container.querySelector('.lucide-sun, .lucide-moon')
    expect(icon).toBeInTheDocument()
  })
})
