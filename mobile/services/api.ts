import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, clear storage
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('user');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await this.api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/api/v1/auth/me');
    return response.data;
  }

  // Diagnostic codes endpoints
  async getCodes(params?: {
    query?: string;
    category?: string;
    severity?: string;
    is_active?: boolean;
    page?: number;
    per_page?: number;
  }) {
    const response = await this.api.get('/api/v1/codes/', { params });
    return response.data;
  }

  async getCodeById(id: number) {
    const response = await this.api.get(`/api/v1/codes/${id}`);
    return response.data;
  }

  async createCode(data: any) {
    const response = await this.api.post('/api/v1/codes/', data);
    return response.data;
  }

  async updateCode(id: number, data: any) {
    const response = await this.api.put(`/api/v1/codes/${id}`, data);
    return response.data;
  }

  async deleteCode(id: number) {
    const response = await this.api.delete(`/api/v1/codes/${id}`);
    return response.data;
  }

  async searchCodes(query: string) {
    const response = await this.api.get('/api/v1/search/', {
      params: { q: query },
    });
    return response.data;
  }

  // Favorites endpoints
  async getFavorites() {
    const response = await this.api.get('/api/v1/favorites/');
    return response.data;
  }

  async addFavorite(codeId: number, notes?: string) {
    const response = await this.api.post('/api/v1/favorites/', {
      code_id: codeId,
      notes,
    });
    return response.data;
  }

  async removeFavorite(favoriteId: number) {
    const response = await this.api.delete(`/api/v1/favorites/${favoriteId}`);
    return response.data;
  }

  async updateFavoriteNotes(favoriteId: number, notes: string) {
    const response = await this.api.put(`/api/v1/favorites/${favoriteId}`, {
      notes,
    });
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats() {
    const response = await this.api.get('/api/v1/analytics/dashboard');
    return response.data;
  }

  async getCategoryStats() {
    const response = await this.api.get('/api/v1/analytics/categories');
    return response.data;
  }
}

export default new ApiService();
