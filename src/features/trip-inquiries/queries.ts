import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  tripInquiriesApi,
  type CreateTripInquiryPayload,
  type UpdateTripInquiryStatusPayload,
} from '../../api/trip-inquiries.api';
import type { TripInquiryStatus } from '../../types/enums';

// ── Rider hooks ─────────────────────────────────────────────────────────────

export function useMyTripInquiries(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['myTripInquiries', page, limit],
    queryFn: () => tripInquiriesApi.getMine(page, limit),
  });
}

export function useMyTripInquiryCounts() {
  return useQuery({
    queryKey: ['myTripInquiries', 'counts'],
    queryFn: () => tripInquiriesApi.getMyCounts(),
  });
}

export function useTripInquiry(id: string | undefined) {
  return useQuery({
    queryKey: ['tripInquiry', id],
    queryFn: () => tripInquiriesApi.getOne(id as string),
    enabled: !!id,
    // Poll while there's day-of status actually worth watching (an accepted
    // seat on a trip that's about to run or currently running) — stops once
    // the trip wraps up or the seat isn't confirmed, so a rider who's just
    // browsing a pending/rejected request isn't polled forever.
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.status !== 'ACCEPTED') return false;
      return data.trip.status === 'ACTIVE' || data.trip.status === 'IN_PROGRESS' ? 20_000 : false;
    },
  });
}

export function useCreateTripInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTripInquiryPayload) => tripInquiriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTripInquiries'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    },
  });
}

// Takes the target id per-call (not bound to the hook) so a single instance
// can drive both a single-item detail screen and a list of many inquiries.
export function useUpdateTripInquiryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTripInquiryStatusPayload }) =>
      tripInquiriesApi.updateStatus(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tripInquiry', id] });
      queryClient.invalidateQueries({ queryKey: ['myTripInquiries'] });
      queryClient.invalidateQueries({ queryKey: ['tripInquiryInbox'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
      queryClient.invalidateQueries({ queryKey: ['myTrip'] });
    },
  });
}

// ── Poster hooks (inbox across all of my own posted trips) ─────────────────

export function useTripInquiryInbox(params?: { tripId?: string; status?: TripInquiryStatus; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['tripInquiryInbox', params],
    queryFn: () => tripInquiriesApi.getInbox(params),
  });
}

export function useTripInquiryInboxCounts() {
  return useQuery({
    queryKey: ['tripInquiryInbox', 'counts'],
    queryFn: () => tripInquiriesApi.getInboxCounts(),
  });
}
