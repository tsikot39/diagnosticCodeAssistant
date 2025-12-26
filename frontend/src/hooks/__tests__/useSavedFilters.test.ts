import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSavedFilters } from '@/hooks/useSavedFilters'

describe('useSavedFilters', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with empty filters', () => {
    const { result } = renderHook(() => useSavedFilters())
    expect(result.current.savedFilters).toEqual([])
  })

  it('saves a new filter', () => {
    const { result } = renderHook(() => useSavedFilters())

    act(() => {
      result.current.saveFilter('My Filter', {
        category: 'ERROR',
        severity: 'high',
        search: 'test',
      })
    })

    expect(result.current.savedFilters).toHaveLength(1)
    expect(result.current.savedFilters[0].name).toBe('My Filter')
    expect(result.current.savedFilters[0].category).toBe('ERROR')
    expect(result.current.savedFilters[0].severity).toBe('high')
    expect(result.current.savedFilters[0].search).toBe('test')
  })

  it('deletes a filter', () => {
    const { result } = renderHook(() => useSavedFilters())

    act(() => {
      result.current.saveFilter('Filter 1', { category: 'ERROR' })
    })

    const filterId = result.current.savedFilters[0].id

    act(() => {
      result.current.deleteFilter(filterId)
    })

    expect(result.current.savedFilters).toHaveLength(0)
  })

  it('loads a filter by id', () => {
    const { result } = renderHook(() => useSavedFilters())

    act(() => {
      result.current.saveFilter('Test Filter', {
        category: 'WARNING',
        severity: 'medium',
      })
    })

    const filterId = result.current.savedFilters[0].id
    const loaded = result.current.loadFilter(filterId)

    expect(loaded).toBeDefined()
    expect(loaded?.name).toBe('Test Filter')
    expect(loaded?.category).toBe('WARNING')
  })

  it('persists filters to localStorage', () => {
    const { result } = renderHook(() => useSavedFilters())

    act(() => {
      result.current.saveFilter('Persistent Filter', { category: 'INFO' })
    })

    const stored = localStorage.getItem('diagnostic-code-filters')
    expect(stored).toBeTruthy()

    const parsed = JSON.parse(stored!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].name).toBe('Persistent Filter')
  })

  it('loads filters from localStorage on mount', () => {
    const existingFilters = [
      {
        id: '1',
        name: 'Existing Filter',
        category: 'ERROR',
        createdAt: new Date().toISOString(),
      },
    ]

    localStorage.setItem(
      'diagnostic-code-filters',
      JSON.stringify(existingFilters)
    )

    const { result } = renderHook(() => useSavedFilters())

    expect(result.current.savedFilters).toHaveLength(1)
    expect(result.current.savedFilters[0].name).toBe('Existing Filter')
  })
})
