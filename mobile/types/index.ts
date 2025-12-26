// Shared types between mobile and backend
export interface DiagnosticCode {
  id: number;
  code: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution_steps?: string;
  related_codes?: string;
  extra_data?: Record<string, any>;
  is_active: boolean;
  organization_id?: number;
  created_at: string;
  updated_at: string;
}

export interface DiagnosticCodeCreate {
  code: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution_steps?: string;
  related_codes?: string;
  extra_data?: Record<string, any>;
  is_active?: boolean;
  organization_id?: number;
}

export interface DiagnosticCodeUpdate {
  code?: string;
  description?: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  resolution_steps?: string;
  related_codes?: string;
  extra_data?: Record<string, any>;
  is_active?: boolean;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  organization_id?: number;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface SearchParams {
  query?: string;
  category?: string;
  severity?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export interface Favorite {
  id: number;
  user_id: number;
  code_id: number;
  notes?: string;
  created_at: string;
  code?: DiagnosticCode;
}

export interface DashboardStats {
  total_codes: number;
  active_codes: number;
  categories: Record<string, number>;
  severity_breakdown: Record<string, number>;
  recent_activity: number;
}

export interface ApiError {
  detail: string;
  status?: number;
}
