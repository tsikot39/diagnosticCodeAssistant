import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  const mockHandlers = {
    onSearch: vi.fn(),
    onNew: vi.fn(),
    onEscape: vi.fn(),
    onHelp: vi.fn(),
    onNextPage: vi.fn(),
    onPrevPage: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    onDelete: vi.fn(),
    onSelectAll: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('triggers onSearch when Ctrl+K is pressed', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers))

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    })
    window.dispatchEvent(event)

    expect(mockHandlers.onSearch).toHaveBeenCalledTimes(1)
  })

  it('triggers onNew when Ctrl+N is pressed', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers))

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
    })
    window.dispatchEvent(event)

    expect(mockHandlers.onNew).toHaveBeenCalledTimes(1)
  })

  it('triggers onEscape when Escape is pressed', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers))

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
    })
    window.dispatchEvent(event)

    expect(mockHandlers.onEscape).toHaveBeenCalledTimes(1)
  })

  it('triggers onHelp when ? is pressed', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers))

    const event = new KeyboardEvent('keydown', {
      key: '?',
    })
    window.dispatchEvent(event)

    expect(mockHandlers.onHelp).toHaveBeenCalledTimes(1)
  })

  it('triggers onNextPage when Ctrl+ArrowRight is pressed', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers))

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      ctrlKey: true,
    })
    window.dispatchEvent(event)

    expect(mockHandlers.onNextPage).toHaveBeenCalledTimes(1)
  })

  it('triggers onPrevPage when Ctrl+ArrowLeft is pressed', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers))

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      ctrlKey: true,
    })
    window.dispatchEvent(event)

    expect(mockHandlers.onPrevPage).toHaveBeenCalledTimes(1)
  })

  it('triggers onExport when Ctrl+E is pressed', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers))

    const event = new KeyboardEvent('keydown', {
      key: 'e',
      ctrlKey: true,
    })
    window.dispatchEvent(event)

    expect(mockHandlers.onExport).toHaveBeenCalledTimes(1)
  })

  it('triggers onImport when Ctrl+I is pressed', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers))

    const event = new KeyboardEvent('keydown', {
      key: 'i',
      ctrlKey: true,
    })
    window.dispatchEvent(event)

    expect(mockHandlers.onImport).toHaveBeenCalledTimes(1)
  })

  it('triggers onDelete when Ctrl+Delete is pressed', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers))

    const event = new KeyboardEvent('keydown', {
      key: 'Delete',
      ctrlKey: true,
    })
    window.dispatchEvent(event)

    expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1)
  })

  it('does not trigger shortcuts when disabled', () => {
    renderHook(() =>
      useKeyboardShortcuts({ ...mockHandlers, enabled: false })
    )

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    })
    window.dispatchEvent(event)

    expect(mockHandlers.onSearch).not.toHaveBeenCalled()
  })

  it('supports Cmd key for Mac users', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers))

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    })
    window.dispatchEvent(event)

    expect(mockHandlers.onSearch).toHaveBeenCalledTimes(1)
  })
})
