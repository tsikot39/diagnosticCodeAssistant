import { Download, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface BulkActionsBarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
  onBulkDelete: () => void
  onBulkExport: () => void
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkExport,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  const allSelected = selectedCount === totalCount

  return (
    <Card className="p-4 bg-primary/5 border-primary/20 animate-slide-in-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-medium">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
          {!allSelected && (
            <Button
              variant="link"
              size="sm"
              onClick={onSelectAll}
              className="h-auto p-0"
            >
              Select all {totalCount}
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Selected
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
    </Card>
  )
}
