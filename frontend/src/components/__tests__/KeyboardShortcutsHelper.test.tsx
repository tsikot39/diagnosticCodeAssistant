import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/test-utils'
import { KeyboardShortcutsHelper } from '../KeyboardShortcutsHelper'

describe('KeyboardShortcutsHelper', () => {
  it('renders the keyboard shortcuts title', () => {
    render(<KeyboardShortcutsHelper />)

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('renders all shortcut categories', () => {
    render(<KeyboardShortcutsHelper />)

    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('Selection')).toBeInTheDocument()
    expect(screen.getByText('Help')).toBeInTheDocument()
  })

  it('renders search shortcut', () => {
    render(<KeyboardShortcutsHelper />)

    expect(screen.getByText('Focus search box')).toBeInTheDocument()
    const ctrlBadges = screen.getAllByText('Ctrl')
    expect(ctrlBadges.length).toBeGreaterThan(0)
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('renders create new code shortcut', () => {
    render(<KeyboardShortcutsHelper />)

    expect(screen.getByText('Create new code')).toBeInTheDocument()
    const ctrlBadges = screen.getAllByText('Ctrl')
    expect(ctrlBadges.length).toBeGreaterThan(0)
    expect(screen.getByText('N')).toBeInTheDocument()
  })

  it('renders export shortcut', () => {
    render(<KeyboardShortcutsHelper />)

    expect(screen.getByText('Export codes')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
  })

  it('renders import shortcut', () => {
    render(<KeyboardShortcutsHelper />)

    expect(screen.getByText('Import codes')).toBeInTheDocument()
    expect(screen.getByText('I')).toBeInTheDocument()
  })

  it('renders select all shortcut', () => {
    render(<KeyboardShortcutsHelper />)

    expect(screen.getByText('Select all codes')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders delete shortcut', () => {
    render(<KeyboardShortcutsHelper />)

    expect(screen.getByText('Delete selected')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('renders navigation shortcuts', () => {
    render(<KeyboardShortcutsHelper />)

    expect(screen.getByText('Next page')).toBeInTheDocument()
    expect(screen.getByText('Previous page')).toBeInTheDocument()
    expect(screen.getByText('→')).toBeInTheDocument()
    expect(screen.getByText('←')).toBeInTheDocument()
  })

  it('renders help toggle shortcut', () => {
    render(<KeyboardShortcutsHelper />)

    expect(screen.getByText('Toggle this help')).toBeInTheDocument()
    const questionMarks = screen.getAllByText('?')
    expect(questionMarks.length).toBeGreaterThan(0)
  })

  it('renders escape shortcut', () => {
    render(<KeyboardShortcutsHelper />)

    expect(screen.getByText('Close modals')).toBeInTheDocument()
    const escKeys = screen.getAllByText('Esc')
    expect(escKeys.length).toBeGreaterThan(0)
  })

  it('renders closing instructions', () => {
    render(<KeyboardShortcutsHelper />)

    expect(screen.getByText(/to close this panel/i)).toBeInTheDocument()
  })
})
