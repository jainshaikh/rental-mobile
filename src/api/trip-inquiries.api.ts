import apiClient from './client';
import type { ApiResponse, PaginationMeta } from '../types/api.types';
import type { PickupSource, TripInquiryStatus, TripStatus } from '../types/enums';

export interface TripInquiryUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface TripInquiryTrip {
  id: string;
  status: TripStatus;
  originCity: string;
  destinationCity: string;
  pickupPoint: string;
  dropoffPoint: string | null;
  departureAt: string;
  availableSeats: number;
  pricePerSeat: string | number;
  contactNumber: string;
  postedByUserId: string;
  postedBy: { id: string; name: string; email: string; phone: string | null };
  userVehicle: { make: string; model: string; plateNumber: string };
}

export interface TripInquiry {
  id: string;
  requestedSeats: number;
  pickupNote: string | null;
  message: string | null;
  status: TripInquiryStatus;
  rejectionReason: string | null;
  // The rider's own day-of status — set by the driver's manifest actions on
  // the trip this inquiry belongs to. Null until the driver taps Pickup/Dropoff
  // for this rider (or auto-resolved at trip end — see pickupSource).
  pickupConfirmedAt: string | null;
  pickupSource: PickupSource | null;
  droppedOffAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: TripInquiryUser;
  trip: TripInquiryTrip;
}

export interface CreateTripInquiryPayload {
  tripId: string;
  requestedSeats: number;
  pickupNote?: string;
  message?: string;
}

export interface UpdateTripInquiryStatusPayload {
  newStatus: TripInquiryStatus;
  note?: string;
}

export const tripInquiriesApi = {
  create: async (data: CreateTripInquiryPayload) => {
    const res = await apiClient.post<ApiResponse<TripInquiry>>('/trip-inquiries', data);
    return res.data.data;
  },

  getMine: async (page = 1, limit = 20) => {
    const res = await apiClient.get<ApiResponse<TripInquiry[]>>('/trip-inquiries', { params: { page, limit } });
    return { data: res.data.data, meta: res.data.meta as unknown as PaginationMeta };
  },

  getMyCounts: async (): Promise<{ pending: number }> => {
    const res = await apiClient.get<ApiResponse<{ pending: number }>>('/trip-inquiries/counts');
    return res.data.data;
  },

  getOne: async (id: string) => {
    const res = await apiClient.get<ApiResponse<TripInquiry>>(`/trip-inquiries/${id}`);
    return res.data.data;
  },

  updateStatus: async (id: string, data: UpdateTripInquiryStatusPayload) => {
    const res = await apiClient.patch<ApiResponse<TripInquiry>>(`/trip-inquiries/${id}/status`, data);
    return res.data.data;
  },

  // Poster inbox — incoming requests across all of my own posted trips
  getInbox: async (params?: { tripId?: string; status?: TripInquiryStatus; page?: number; limit?: number }) => {
    const res = await apiClient.get<ApiResponse<TripInquiry[]>>('/my/trip-inquiries', { params });
    return { data: res.data.data, meta: res.data.meta as unknown as PaginationMeta };
  },

  getInboxCounts: async (): Promise<{ pending: number }> => {
    const res = await apiClient.get<ApiResponse<{ pending: number }>>('/my/trip-inquiries/counts');
    return res.data.data;
  },
};
