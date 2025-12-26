import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/test-utils'
import Layout from '../Layout'

describe('Layout', () => {
  it('renders the header with app title', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('Diagnostic Code Assistant')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /About/i })).toBeInTheDocument()
  })

  it('renders theme toggle', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    // ThemeToggle should be present (tested in its own test file)
    const themeButton = screen.getByRole('button', { name: 'Toggle theme' })
    expect(themeButton).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <Layout>
        <div>Custom Page Content</div>
      </Layout>
    )

    expect(screen.getByText('Custom Page Content')).toBeInTheDocument()
  })

  it('renders footer with copyright', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText(/© 2025 Diagnostic Code Assistant/i)).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument()
  })

  it('has proper structure with header, main, and footer', () => {
    const { container } = render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    const header = container.querySelector('header')
    const main = container.querySelector('main')
    const footer = container.querySelector('footer')

    expect(header).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    expect(footer).toBeInTheDocument()
  })

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('min-h-screen', 'bg-background')
  })
})
