import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingRequestsApi, type CreateBookingRequestPayload, type UpdateBookingStatusPayload } from '../../api/booking-requests.api';

export function useMyBookingRequests(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['myInquiries', page, limit],
    queryFn: () => bookingRequestsApi.getMine(page, limit),
  });
}

export function useMyBookingCounts() {
  return useQuery({
    queryKey: ['myInquiries', 'counts'],
    queryFn: () => bookingRequestsApi.getMyCounts(),
  });
}

export function useBookingRequest(id: string | undefined) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingRequestsApi.getOne(id as string),
    enabled: !!id,
  });
}

export function useCreateBookingRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingRequestPayload) => bookingRequestsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInquiries'] });
    },
  });
}

export function useUpdateBookingStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBookingStatusPayload) => bookingRequestsApi.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['myInquiries'] });
    },
  });
}
