import { useState, useEffect } from 'react';
import { searchService, SearchSuggestion } from '../services/search';

export const useAutocomplete = (query: string, delay: number = 300) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchService.getAutocomplete(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return { suggestions, loading };
};
