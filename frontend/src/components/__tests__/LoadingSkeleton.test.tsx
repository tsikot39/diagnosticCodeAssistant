import { describe, it, expect } from 'vitest'
import { render } from '../../test/test-utils'
import { CodeListSkeleton, CodeCardSkeleton } from '../LoadingSkeleton'

describe('LoadingSkeleton', () => {
  describe('CodeListSkeleton', () => {
    it('renders skeleton cards in grid layout', () => {
      const { container } = render(<CodeListSkeleton />)
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
    })

    it('renders 6 skeleton cards', () => {
      const { container } = render(<CodeListSkeleton />)
      const skeletonCards = container.querySelectorAll('.animate-pulse')
      expect(skeletonCards).toHaveLength(6)
    })
  })

  describe('CodeCardSkeleton', () => {
    it('renders skeleton card with animation', () => {
      const { container } = render(<CodeCardSkeleton />)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('renders multiple skeleton lines', () => {
      const { container } = render(<CodeCardSkeleton />)
      const skeletonLines = container.querySelectorAll('.bg-muted')
      expect(skeletonLines.length).toBeGreaterThan(0)
    })
  })
})
