import axios from 'axios';
import apiClient from '@/lib/apiClient';
import { API_BASE_URL } from '@/config/api';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

class AuthService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/api/v1/auth/login`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async register(
    email: string,
    username: string,
    password: string,
    fullName?: string
  ): Promise<UserResponse> {
    const response = await axios.post<UserResponse>(
      `${API_BASE_URL}/api/v1/auth/register`,
      {
        email,
        username,
        password,
        full_name: fullName,
      }
    );
    return response.data;
  }

  async getCurrentUser(): Promise<UserResponse> {
    // apiClient will automatically add the token from localStorage via interceptor
    const response = await apiClient.get<UserResponse>('/api/v1/auth/me');
    return response.data;
  }
}

export const authService = new AuthService();
