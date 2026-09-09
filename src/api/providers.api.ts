import apiClient from './client';
import type { ApiResponse, PaginationMeta, PublicProviderCard, PublicProviderDetail } from '../types/api.types';

export interface ProviderFilters {
  page?: number;
  limit?: number;
  // City and lat/lng+radiusKm are mutually exclusive on web — picking one clears
  // the other. radiusKm defaults to 25 server-side if lat/lng are set without it.
  city?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export const providersApi = {
  // Public directory — note the param is a slug, not an id.
  getAllPublic: async (filters: ProviderFilters = {}) => {
    const { page = 1, limit = 12, ...rest } = filters;
    const params: Record<string, string | number> = { page, limit };
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params[key] = value;
    });
    const res = await apiClient.get<ApiResponse<PublicProviderCard[]>>('/providers', { params });
    return { data: res.data.data, meta: res.data.meta as unknown as PaginationMeta };
  },

  getPublicBySlug: async (slug: string) => {
    const res = await apiClient.get<ApiResponse<PublicProviderDetail>>(`/providers/${slug}`);
    return res.data.data;
  },
};
