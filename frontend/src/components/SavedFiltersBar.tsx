import { useState } from 'react'
import { Save, Trash2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useSavedFilters } from '@/hooks/useSavedFilters'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'

interface SavedFiltersBarProps {
  currentFilter: {
    category?: string
    severity?: string
    search?: string
  }
  onFilterLoad: (filter: { category?: string; severity?: string; search?: string }) => void
}

export function SavedFiltersBar({ currentFilter, onFilterLoad }: SavedFiltersBarProps) {
  const { savedFilters, saveFilter, deleteFilter } = useSavedFilters()
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [filterName, setFilterName] = useState('')

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast.error('Please enter a filter name')
      return
    }

    const hasActiveFilter = currentFilter.category || currentFilter.severity || currentFilter.search

    if (!hasActiveFilter) {
      toast.error('No active filters to save')
      return
    }

    const success = saveFilter(filterName, currentFilter)
    if (success) {
      toast.success(`Filter "${filterName}" saved`)
      setFilterName('')
      setIsSaveDialogOpen(false)
    } else {
      toast.error('Failed to save filter')
    }
  }

  const handleDeleteFilter = (id: string, name: string) => {
    const success = deleteFilter(id)
    if (success) {
      toast.success(`Filter "${name}" deleted`)
    } else {
      toast.error('Failed to delete filter')
    }
  }

  const handleLoadFilter = (filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId)
    if (filter) {
      onFilterLoad({
        category: filter.category,
        severity: filter.severity,
        search: filter.search,
      })
      toast.success(`Filter "${filter.name}" applied`)
    }
  }

  if (savedFilters.length === 0 && !isSaveDialogOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsSaveDialogOpen(true)}
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        Save Current Filter
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      {savedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <Star className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Saved Filters:</span>
          {savedFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="gap-2 cursor-pointer hover:bg-secondary/80 transition-colors"
            >
              <span onClick={() => handleLoadFilter(filter.id)}>{filter.name}</span>
              <Trash2
                className="h-3 w-3 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteFilter(filter.id, filter.name)
                }}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSaveDialogOpen(true)}
            className="gap-2 h-7"
          >
            <Save className="h-3 w-3" />
            Save Current
          </Button>
        </div>
      )}

      {isSaveDialogOpen && (
        <div className="flex gap-2 items-center p-3 bg-muted/50 rounded-lg">
          <Input
            placeholder="Filter name..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveFilter()
              if (e.key === 'Escape') setIsSaveDialogOpen(false)
            }}
            className="h-8"
            autoFocus
          />
          <Button size="sm" onClick={handleSaveFilter}>
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsSaveDialogOpen(false)
              setFilterName('')
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
