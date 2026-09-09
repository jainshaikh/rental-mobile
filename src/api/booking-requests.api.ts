import apiClient from './client';
import type { ApiResponse, BookingRequest, PaginationMeta } from '../types/api.types';
import type { BookingRequestStatus, RentalDurationType } from '../types/enums';

export interface CreateBookingRequestPayload {
  vehicleId: string;
  requestedFromDate: string; // ISO datetime string (date + time)
  durationType: RentalDurationType;
  durationQuantity: number;
  pickupLocation?: string;
  message?: string;
}

export interface UpdateBookingStatusPayload {
  newStatus: BookingRequestStatus;
  note?: string;
}

export interface BookingCounts {
  active: number;
  completed: number;
}

export const bookingRequestsApi = {
  create: async (data: CreateBookingRequestPayload) => {
    const res = await apiClient.post<ApiResponse<BookingRequest>>('/booking-requests', data);
    return res.data.data;
  },

  getMine: async (page = 1, limit = 20) => {
    const res = await apiClient.get<ApiResponse<BookingRequest[]>>('/booking-requests', { params: { page, limit } });
    return { data: res.data.data, meta: res.data.meta as unknown as PaginationMeta };
  },

  getMyCounts: async (): Promise<BookingCounts> => {
    const res = await apiClient.get<ApiResponse<BookingCounts>>('/booking-requests/counts');
    return res.data.data;
  },

  getOne: async (id: string) => {
    const res = await apiClient.get<ApiResponse<BookingRequest>>(`/booking-requests/${id}`);
    return res.data.data;
  },

  updateStatus: async (id: string, data: UpdateBookingStatusPayload) => {
    const res = await apiClient.patch<ApiResponse<BookingRequest>>(`/booking-requests/${id}/status`, data);
    return res.data.data;
  },
};
