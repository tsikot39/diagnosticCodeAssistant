import { useState, useEffect } from 'react';

interface SavedFilter {
  id: string;
  name: string;
  category?: string;
  severity?: string;
  search?: string;
  createdAt: string;
}

const STORAGE_KEY = 'diagnostic-code-filters';

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Load saved filters on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedFilters(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    }
  }, []);

  const saveFilter = (name: string, filter: { category?: string; severity?: string; search?: string }) => {
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      ...filter,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Failed to save filter:', error);
      return false;
    }
  };

  const deleteFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Failed to delete filter:', error);
      return false;
    }
  };

  const loadFilter = (id: string) => {
    return savedFilters.find(f => f.id === id);
  };

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    loadFilter,
  };
}
