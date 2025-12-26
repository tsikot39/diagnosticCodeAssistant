import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAutoSave, useLoadDraft, useClearDraft } from '@/hooks/useAutoSave'

describe('useAutoSave', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllTimers()
  })

  it('saves data to localStorage after debounce delay', async () => {
    vi.useFakeTimers()

    const testData = { name: 'Test', value: 123 }

    renderHook(() =>
      useAutoSave({
        key: 'test-key',
        data: testData,
        enabled: true,
        debounceMs: 1000,
      })
    )

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    const stored = localStorage.getItem('test-key')
    expect(stored).toBe(JSON.stringify(testData))

    vi.useRealTimers()
  })

  it('does not save when enabled is false', async () => {
    vi.useFakeTimers()

    const testData = { name: 'Test' }

    renderHook(() =>
      useAutoSave({
        key: 'test-key',
        data: testData,
        enabled: false,
      })
    )

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    const stored = localStorage.getItem('test-key')
    expect(stored).toBeNull()

    vi.useRealTimers()
  })
})

describe('useLoadDraft', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads data from localStorage', () => {
    const testData = { name: 'Loaded', value: 456 }
    localStorage.setItem('draft-key', JSON.stringify(testData))

    const { result } = renderHook(() =>
      useLoadDraft('draft-key', { name: '', value: 0 })
    )

    expect(result.current).toEqual(testData)
  })

  it('returns default value when no draft exists', () => {
    const defaultValue = { name: 'Default', value: 0 }

    const { result } = renderHook(() =>
      useLoadDraft('nonexistent-key', defaultValue)
    )

    expect(result.current).toEqual(defaultValue)
  })

  it('returns default value on parse error', () => {
    localStorage.setItem('corrupt-key', 'invalid json {{{')

    const defaultValue = { name: 'Default' }

    const { result } = renderHook(() =>
      useLoadDraft('corrupt-key', defaultValue)
    )

    expect(result.current).toEqual(defaultValue)
  })
})

describe('useClearDraft', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('removes item from localStorage', () => {
    localStorage.setItem('clear-test', 'some data')

    const { result } = renderHook(() => useClearDraft('clear-test'))

    act(() => {
      result.current()
    })

    expect(localStorage.getItem('clear-test')).toBeNull()
  })
})
