import { useState, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

interface SearchWithAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (code: string, description: string) => void;
  onAiSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchWithAutocomplete({
  value,
  onChange,
  onSelect,
  onAiSearch,
  placeholder = 'Search diagnostic codes...',
  className
}: SearchWithAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { suggestions, loading } = useAutocomplete(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (code: string, description: string) => {
    onChange(code);
    setIsOpen(false);
    onSelect?.(code, description);
  };

  const handleAiSearch = () => {
    if (value.trim().length > 0) {
      onAiSearch?.(value);
      setIsOpen(false);
    }
  };

  const getMatchTypeColor = (matchType: string) => {
    const colors = {
      code: 'text-blue-600 font-semibold',
      description: 'text-gray-700',
      category: 'text-purple-600',
    };
    return colors[matchType as keyof typeof colors] || 'text-gray-700';
  };

  const getMatchTypeLabel = (matchType: string) => {
    return matchType.charAt(0).toUpperCase() + matchType.slice(1);
  };

  return (
    <div className={cn('relative', className)}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          ref={inputRef}
          value={value}
          onValueChange={(val) => {
            onChange(val);
            setIsOpen(val.length > 1);
          }}
          onFocus={() => value.length > 1 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
        />
        {isOpen && (
          <CommandList className="absolute z-50 w-full top-full mt-1 bg-white border rounded-md shadow-lg max-h-80 overflow-auto">
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
            {!loading && suggestions.length === 0 && value.length > 1 && (
              <div className="p-4 space-y-3">
                <CommandEmpty>No exact matches found.</CommandEmpty>
                {onAiSearch && (
                  <div className="flex flex-col items-center gap-2 pt-2 border-t">
                    <p className="text-sm text-gray-600">Try AI-powered search for natural language queries</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAiSearch}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      Search with AI
                    </Button>
                  </div>
                )}
              </div>
            )}
            {!loading && suggestions.length > 0 && (
              <CommandGroup heading="Suggestions">
                {suggestions.map((suggestion, idx) => (
                  <CommandItem
                    key={`${suggestion.code}-${idx}`}
                    value={suggestion.code}
                    onSelect={() => handleSelect(suggestion.code, suggestion.description)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between">
                        <span className={getMatchTypeColor(suggestion.match_type)}>
                          {suggestion.code}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {getMatchTypeLabel(suggestion.match_type)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 truncate">
                        {suggestion.description}
                      </span>
                      <span className="text-xs text-gray-400 mt-0.5">
                        {suggestion.category}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
}
