import apiClient from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, ApiResponse, User } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed');
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Registration failed');
  },

  async getCurrentUser(): Promise<User | undefined> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignored if unauthenticated or network failure
    }
  },
};
