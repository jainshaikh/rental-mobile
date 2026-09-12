import apiClient from './client';
import type { ApiResponse } from '../types/api.types';

export type DevicePlatform = 'ANDROID' | 'IOS';

export const deviceTokensApi = {
  register: async (token: string, platform: DevicePlatform): Promise<void> => {
    await apiClient.post<ApiResponse<unknown>>('/device-tokens', { token, platform });
  },

  unregister: async (token: string): Promise<void> => {
    await apiClient.delete<ApiResponse<unknown>>('/device-tokens', { data: { token } });
  },
};
