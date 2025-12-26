import apiClient from '../lib/apiClient';

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  resource_type: string;
  resource_id: number | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface AuditLogList {
  items: AuditLog[];
  total: number;
  skip: number;
  limit: number;
}

export interface AuditLogFilters {
  user_id?: number;
  action?: string;
  resource_type?: string;
  resource_id?: number;
  start_date?: string;
  end_date?: string;
}

export const auditService = {
  async getAuditLogs(
    skip: number = 0,
    limit: number = 100,
    filters?: AuditLogFilters
  ): Promise<AuditLogList> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (filters?.user_id) params.append('user_id', filters.user_id.toString());
    if (filters?.action) params.append('action', filters.action);
    if (filters?.resource_type) params.append('resource_type', filters.resource_type);
    if (filters?.resource_id) params.append('resource_id', filters.resource_id.toString());

    const { data } = await apiClient.get(`/api/v1/audit?${params}`);
    return data;
  },

  async getMyAuditLogs(
    skip: number = 0,
    limit: number = 100,
    filters?: Omit<AuditLogFilters, 'user_id'>
  ): Promise<AuditLogList> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (filters?.action) params.append('action', filters.action);
    if (filters?.resource_type) params.append('resource_type', filters.resource_type);

    const { data } = await apiClient.get(`/api/v1/audit/me?${params}`);
    return data;
  },
};
