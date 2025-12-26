import { useState, useRef } from 'react'
import { Plus, Upload, Sparkles, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce } from 'use-debounce'
import type { DiagnosticCode } from '@/types/diagnosticCode'
import { useDiagnosticCodes, useDeleteDiagnosticCode } from '@/hooks/useDiagnosticCodes'
import { useFavorites } from '@/hooks/useFavorites'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { usePageView, useAnalytics } from '@/hooks/useAnalytics'
import { Button } from '@/components/ui/button'
import CodeCard from '@/components/CodeCard'
import { VirtualCodeGrid } from '@/components/VirtualCodeGrid'
import CodeFormModal from '@/components/CodeFormModal'
import { FilterBar } from '@/components/FilterBar'
import { ExportButton } from '@/components/ExportButton'
import { CodeListSkeleton } from '@/components/LoadingSkeleton'
import { Pagination } from '@/components/Pagination'
import { ImportModal } from '@/components/ImportModal'
import { BulkActionsBar } from '@/components/BulkActionsBar'
import { BulkDeleteConfirmModal } from '@/components/BulkDeleteConfirmModal'
import { SavedFiltersBar } from '@/components/SavedFiltersBar'
import { KeyboardShortcutsHelper } from '@/components/KeyboardShortcutsHelper'
import { SearchWithAutocomplete } from '@/components/SearchWithAutocomplete'
import { SavedSearchesPanel } from '@/components/SavedSearchesPanel'
import { AiSearchPanel } from '@/components/AiSearchPanel'
import type { SavedSearch } from '@/services/search'

export default function HomePage() {
  usePageView('Home');
  const { trackSearch, trackCodeDelete, trackExport, trackImport } = useAnalytics();
  
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)
  const [filters, setFilters] = useState<{ category?: string; severity?: string }>({})
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const exportButtonRef = useRef<HTMLButtonElement>(null)
  const deleteMutation = useDeleteDiagnosticCode()

  const itemsPerPage = useVirtualScrolling ? 100 : 12

  const { data, isLoading, error } = useDiagnosticCodes({
    search: debouncedSearch || undefined,
    category: filters.category,
    severity: filters.severity,
    skip: (page - 1) * itemsPerPage,
    limit: itemsPerPage,
  })

  const { data: favorites } = useFavorites()

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => searchInputRef.current?.focus(),
    onNew: () => setIsModalOpen(true),
    onHelp: () => setIsHelpModalOpen(true),
    onEscape: () => {
      if (isModalOpen) setIsModalOpen(false);
      if (isImportModalOpen) setIsImportModalOpen(false);
      if (isBulkDeleteModalOpen) setIsBulkDeleteModalOpen(false);
      if (isHelpModalOpen) setIsHelpModalOpen(false);
    },
    onNextPage: () => {
      if (page < totalPages) setPage(page + 1);
    },
    onPrevPage: () => {
      if (page > 1) setPage(page - 1);
    },
    onExport: () => {
      if (data?.items.length) {
        exportButtonRef.current?.click();
      }
    },
    onImport: () => setIsImportModalOpen(true),
    onDelete: () => {
      if (selectedIds.size > 0) handleBulkDelete();
    },
    onSelectAll: () => handleSelectAll(),
  })

  const categories = [
    { label: 'All', value: '' },
    { label: 'Error', value: 'ERROR' },
    { label: 'Warning', value: 'WARNING' },
    { label: 'Info', value: 'INFO' },
    { label: 'Endocrine', value: 'ENDOCRINE' },
    { label: 'Cardiovascular', value: 'CARDIOVASCULAR' },
    { label: 'Respiratory', value: 'RESPIRATORY' },
    { label: 'Digestive', value: 'DIGESTIVE' },
    { label: 'Mental', value: 'MENTAL' },
    { label: 'Renal', value: 'RENAL' },
  ].filter(c => c.value !== '');

  const severities = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  const handleModalSuccess = () => {
    toast.success('Code created successfully!');
    setIsModalOpen(false);
  };

  const handleFilterChange = (newFilters: { category?: string; severity?: string }) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleFilterLoad = (loadedFilter: { category?: string; severity?: string; search?: string }) => {
    if (loadedFilter.search) setSearch(loadedFilter.search);
    setFilters({
      category: loadedFilter.category,
      severity: loadedFilter.severity,
    });
    setPage(1);
  };

  const handleApplySavedSearch = (savedSearch: SavedSearch) => {
    setSearch(savedSearch.query);
    setFilters({
      category: savedSearch.filters?.category,
      severity: savedSearch.filters?.severity,
    });
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when search changes
    if (value && data) {
      trackSearch(value, data.total);
    }
  };

  const totalPages = data ? Math.ceil(data.total / itemsPerPage) : 0;

  // Bulk selection handlers
  const handleToggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (data?.items) {
      const allIds = new Set(data.items.map(item => item.id))
      setSelectedIds(allIds)
    }
  }

  const handleDeselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleBulkExport = () => {
    if (!data?.items) return
    
    const selectedCodes = data.items.filter(code => selectedIds.has(code.id))
    
    // Convert to CSV
    const headers = ['Code', 'Description', 'Category', 'Severity', 'Status']
    const rows = selectedCodes.map(code => [
      code.code,
      code.description,
      code.category || '',
      code.severity || '',
      code.is_active ? 'Active' : 'Inactive',
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diagnostic-codes-selected-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Exported ${selectedCodes.length} codes`)
    trackExport('csv', selectedCodes.length)
  }

  const handleBulkDelete = () => {
    setIsBulkDeleteModalOpen(true)
  }

  const confirmBulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds)
    let successCount = 0
    let errorCount = 0

    for (const id of idsToDelete) {
      try {
        await deleteMutation.mutateAsync(id)
        trackCodeDelete(id)
        successCount++
      } catch (error) {
        errorCount++
      }
    }

    setIsBulkDeleteModalOpen(false)
    setSelectedIds(new Set())

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} code${successCount === 1 ? '' : 's'} successfully`)
    }
    if (errorCount > 0) {
      toast.error(`Failed to delete ${errorCount} code${errorCount === 1 ? '' : 's'}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Diagnostic Codes</h2>
          <p className="text-muted-foreground">
            Search and manage diagnostic codes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => {
              setShowFavoritesOnly(!showFavoritesOnly)
              setPage(1) // Reset to first page when toggling
            }}
            className="gap-2"
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites {favorites && favorites.length > 0 && `(${favorites.length})`}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAiSearchOpen(!isAiSearchOpen)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4 text-purple-600" />
            AI Search
          </Button>
          {data && data.items.length > 0 && (
            <div ref={exportButtonRef as any}>
              <ExportButton codes={data.items} />
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Code
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isAiSearchOpen && (
          <AiSearchPanel 
            onClose={() => setIsAiSearchOpen(false)}
            onSelectCode={(code) => {
              setSearch(code.code);
              toast.success(`Selected: ${code.code} - ${code.description}`);
              setIsAiSearchOpen(false);
            }}
            initialQuery={search}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search and Filters - 3 columns */}
          <div className="lg:col-span-3 space-y-4">
            <SearchWithAutocomplete
              value={search}
              onChange={handleSearch}
              onSelect={(code, description) => {
                toast.success(`Selected: ${code} - ${description}`);
              }}
              onAiSearch={(query) => {
                setIsAiSearchOpen(true);
              }}
              placeholder="Search codes or descriptions... (Ctrl+K)"
              className="flex-1"
            />
            
            <FilterBar
              categories={categories}
              severities={severities}
              activeFilters={filters}
              onFilterChange={handleFilterChange}
            />

            <SavedFiltersBar
              currentFilter={{ ...filters, search: debouncedSearch }}
              onFilterLoad={handleFilterLoad}
            />
          </div>

          {/* Saved Searches Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <SavedSearchesPanel onApplySearch={handleApplySavedSearch} />
          </div>
        </div>
      </div>

      {data && data.items.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          totalCount={data.items.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
        />
      )}

      {isLoading && <CodeListSkeleton />}

      {error && (
        <div className="text-center py-12 border rounded-lg bg-destructive/10">
          <p className="text-destructive font-medium">Failed to load diagnostic codes</p>
          <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
        </div>
      )}

      {data && data.items.length === 0 && !showFavoritesOnly && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No diagnostic codes found</p>
        </div>
      )}

      {data && data.items.length === 0 && showFavoritesOnly && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No favorite codes yet</p>
          <p className="text-sm text-muted-foreground mt-1">Click the star icon on any code to add it to your favorites</p>
        </div>
      )}

      {data && data.items.length > 0 && (() => {
        // Filter codes based on favorites toggle
        const displayedCodes = showFavoritesOnly && favorites
          ? data.items.filter(code => favorites.some(fav => fav.id === code.id))
          : data.items

        return (
          <div className="space-y-6">
            {/* Virtual scrolling toggle for large datasets */}
            {data.total > 50 && !showFavoritesOnly && (
              <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                <label htmlFor="virtual-scroll" className="cursor-pointer">
                  Virtual Scrolling ({useVirtualScrolling ? 'On' : 'Off'})
                </label>
                <input
                  id="virtual-scroll"
                  type="checkbox"
                  checked={useVirtualScrolling}
                  onChange={(e) => {
                    setUseVirtualScrolling(e.target.checked)
                    setPage(1)
                  }}
                  className="cursor-pointer"
                />
              </div>
            )}

            {displayedCodes.length === 0 && showFavoritesOnly ? (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No favorites match your current filters</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
            ) : useVirtualScrolling ? (
              <VirtualCodeGrid
                codes={displayedCodes}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedCodes.map((code) => (
                    <CodeCard
                      key={code.id}
                      code={code}
                      isSelected={selectedIds.has(code.id)}
                      onToggleSelect={handleToggleSelect}
                    />
                  ))}
                </div>
                
                {totalPages > 1 && !showFavoritesOnly && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={data.total}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </div>
        )
      })()}

      <CodeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          toast.success('Import completed!');
        }}
      />

      <BulkDeleteConfirmModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        count={selectedIds.size}
        isDeleting={deleteMutation.isPending}
      />

      <KeyboardShortcutsHelper
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  )
}
