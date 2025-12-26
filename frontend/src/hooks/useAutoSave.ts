import { useEffect, useCallback } from 'react';

interface UseAutoSaveProps<T> {
  key: string;
  data: T;
  enabled?: boolean;
  debounceMs?: number;
}

export function useAutoSave<T>({
  key,
  data,
  enabled = true,
  debounceMs = 1000,
}: UseAutoSaveProps<T>) {
  useEffect(() => {
    if (!enabled) return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [key, data, enabled, debounceMs]);
}

export function useLoadDraft<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load draft:', error);
  }
  return defaultValue;
}

export function useClearDraft(key: string) {
  return useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [key]);
}
