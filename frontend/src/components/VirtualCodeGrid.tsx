import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import CodeCard from './CodeCard'
import type { DiagnosticCode } from '@/types/diagnosticCode'

interface VirtualCodeGridProps {
  codes: DiagnosticCode[]
  selectedIds: Set<number>
  onToggleSelect: (id: number) => void
}

export function VirtualCodeGrid({
  codes,
  selectedIds,
  onToggleSelect,
}: VirtualCodeGridProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Calculate items per row based on screen size
  const getItemsPerRow = () => {
    if (typeof window === 'undefined') return 3
    const width = window.innerWidth
    if (width < 768) return 1 // mobile
    if (width < 1024) return 2 // tablet
    return 3 // desktop
  }

  const itemsPerRow = getItemsPerRow()
  const rowCount = Math.ceil(codes.length / itemsPerRow)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated height of each row
    overscan: 2, // Render 2 extra rows above/below viewport
  })

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-400px)] overflow-auto"
      style={{
        contain: 'strict',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIdx = virtualRow.index * itemsPerRow
          const rowCodes = codes.slice(startIdx, startIdx + itemsPerRow)

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-1"
            >
              {rowCodes.map((code) => (
                <CodeCard
                  key={code.id}
                  code={code}
                  isSelected={selectedIds.has(code.id)}
                  onToggleSelect={() => onToggleSelect(code.id)}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
