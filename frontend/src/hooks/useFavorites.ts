import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { DiagnosticCode } from '@/types/diagnosticCode';

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await axios.get<DiagnosticCode[]>('/api/v1/users/favorites');
      return data;
    },
  });
}

export function useIsFavorite(codeId: number) {
  return useQuery({
    queryKey: ['favorite', codeId],
    queryFn: async () => {
      const { data } = await axios.get<{ is_favorite: boolean }>(
        `/api/v1/users/favorites/check/${codeId}`
      );
      return data.is_favorite;
    },
    enabled: !!codeId,
  });
}
