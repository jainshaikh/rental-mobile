import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users.api';
import { useAuth } from '../../auth/auth-context';

const SAVED_VEHICLES_KEY = ['savedVehicles'] as const;

export function useSavedVehicles() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: SAVED_VEHICLES_KEY,
    // A generous limit avoids a dedicated "is this vehicle saved" endpoint —
    // acceptable for Phase 1 scope; revisit if a user's saved list grows past this.
    queryFn: () => usersApi.getSavedVehicles(1, 100),
    enabled: isAuthenticated,
  });
}

export function useIsVehicleSaved(vehicleId: string | undefined): boolean {
  const saved = useSavedVehicles();
  if (!vehicleId) return false;
  return !!saved.data?.data.some((entry) => entry.vehicleId === vehicleId);
}

export function useSaveVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: string) => usersApi.saveVehicle(vehicleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SAVED_VEHICLES_KEY }),
  });
}

export function useRemoveSavedVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: string) => usersApi.removeSavedVehicle(vehicleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SAVED_VEHICLES_KEY }),
  });
}
