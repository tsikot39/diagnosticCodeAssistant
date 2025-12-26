import apiClient from '../lib/apiClient';

export interface SearchSuggestion {
  code: string;
  description: string;
  category: string;
  match_type: string;
}

export interface SearchResult {
  id: number;
  code: string;
  description: string;
  category: string;
  severity: string;
  is_active: boolean;
  highlighted_code: string | null;
  highlighted_description: string | null;
  relevance_score: number;
}

export interface RecentSearch {
  id: number;
  query: string;
  created_at: string;
}

export interface SavedSearch {
  id: number;
  name: string;
  query: string;
  filters: Record<string, any> | null;
  is_default: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface SavedSearchCreate {
  name: string;
  query: string;
  filters?: Record<string, any>;
  is_default?: boolean;
}

export const searchService = {
  async getAutocomplete(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const { data } = await apiClient.get(`/api/v1/search/autocomplete`, {
      params: { query, limit },
    });
    return data;
  },

  async advancedSearch(
    query: string,
    options?: {
      fuzzy?: boolean;
      highlight?: boolean;
      category?: string;
      severity?: string;
      is_active?: boolean;
      limit?: number;
    }
  ): Promise<SearchResult[]> {
    const { data } = await apiClient.get(`/api/v1/search/advanced`, {
      params: { query, ...options },
    });
    return data;
  },

  async getRecentSearches(limit: number = 10): Promise<RecentSearch[]> {
    const { data } = await apiClient.get(`/api/v1/search/recent`, {
      params: { limit },
    });
    return data;
  },

  async clearRecentSearches(): Promise<void> {
    await apiClient.delete(`/api/v1/search/recent`);
  },

  async getSavedSearches(): Promise<SavedSearch[]> {
    const { data } = await apiClient.get(`/api/v1/search/saved`);
    return data;
  },

  async createSavedSearch(searchData: SavedSearchCreate): Promise<SavedSearch> {
    const { data } = await apiClient.post(`/api/v1/search/saved`, searchData);
    return data;
  },

  async deleteSavedSearch(searchId: number): Promise<void> {
    await apiClient.delete(`/api/v1/search/saved/${searchId}`);
  },
};
