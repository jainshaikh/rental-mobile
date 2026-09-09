import apiClient from './client';
import type { ApiResponse, AuthUser, LoginResult, User } from '../types/api.types';

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterPayload) => {
    const res = await apiClient.post<ApiResponse<{ user: User; message: string }>>('/auth/register', data);
    return res.data.data;
  },

  login: async (data: LoginPayload) => {
    const res = await apiClient.post<ApiResponse<LoginResult>>('/auth/login', data);
    return res.data.data;
  },

  logout: async () => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout');
    return res.data.data;
  },

  verifyEmail: async (token: string) => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', { token });
    return res.data.data;
  },

  resendVerification: async () => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-verification');
    return res.data.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return res.data.data;
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', data);
    return res.data.data;
  },
};

export type { AuthUser };
