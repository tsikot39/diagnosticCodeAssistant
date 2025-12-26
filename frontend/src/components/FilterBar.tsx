import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  categories: FilterOption[];
  severities: FilterOption[];
  activeFilters: {
    category?: string;
    severity?: string;
  };
  onFilterChange: (filters: { category?: string; severity?: string }) => void;
}

export function FilterBar({ categories, severities, activeFilters, onFilterChange }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleCategoryClick = (category: string) => {
    const newCategory = activeFilters.category === category ? undefined : category;
    onFilterChange({ ...activeFilters, category: newCategory });
  };

  const handleSeverityClick = (severity: string) => {
    const newSeverity = activeFilters.severity === severity ? undefined : severity;
    onFilterChange({ ...activeFilters, severity: newSeverity });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = activeFilters.category || activeFilters.severity;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {(activeFilters.category ? 1 : 0) + (activeFilters.severity ? 1 : 0)}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 text-muted-foreground"
          >
            Clear all
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="border rounded-lg p-4 space-y-4 bg-card">
          <div>
            <h3 className="text-sm font-medium mb-2">Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={activeFilters.category === cat.value ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleCategoryClick(cat.value)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Severity</h3>
            <div className="flex flex-wrap gap-2">
              {severities.map((sev) => (
                <Badge
                  key={sev.value}
                  variant={activeFilters.severity === sev.value ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleSeverityClick(sev.value)}
                >
                  {sev.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
