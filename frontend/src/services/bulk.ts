import apiClient from '../lib/apiClient';

export interface BulkImportResult {
  success: boolean;
  created: number;
  updated: number;
  errors: string[] | null;
  total_processed: number;
}

export interface BulkUpdateResult {
  success: boolean;
  updated: number;
  total: number;
  errors: string[] | null;
}

export interface BulkDeleteResult {
  success: boolean;
  deleted: number;
  total: number;
  errors: string[] | null;
}

export const bulkService = {
  async importCSV(file: File): Promise<BulkImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post('/api/v1/bulk/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async exportCSV(filters?: {
    category?: string;
    severity?: string;
    is_active?: boolean;
  }): Promise<{ content: string; filename: string; count: number }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

    const { data } = await apiClient.post(`/api/v1/bulk/export-csv?${params}`);
    return data;
  },

  async bulkUpdate(
    code_ids: number[],
    updates: {
      category?: string;
      severity?: string;
      is_active?: boolean;
    }
  ): Promise<BulkUpdateResult> {
    const params = new URLSearchParams();
    if (updates.category) params.append('category', updates.category);
    if (updates.severity) params.append('severity', updates.severity);
    if (updates.is_active !== undefined) params.append('is_active', updates.is_active.toString());

    const { data } = await apiClient.post(
      `/api/v1/bulk/bulk-update?${params}`,
      code_ids
    );
    return data;
  },

  async bulkDelete(code_ids: number[]): Promise<BulkDeleteResult> {
    const { data } = await apiClient.delete('/api/v1/bulk/bulk-delete', {
      data: code_ids,
    });
    return data;
  },
};
