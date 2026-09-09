import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userVehiclesApi, type CreateUserVehiclePayload } from '../../api/user-vehicles.api';

export function useMyUserVehicles() {
  return useQuery({
    queryKey: ['userVehicles', 'mine'],
    queryFn: () => userVehiclesApi.getMine(),
  });
}

export function useMyApprovedUserVehicles() {
  return useQuery({
    queryKey: ['userVehicles', 'approved'],
    queryFn: () => userVehiclesApi.getApproved(),
  });
}

export function useUserVehicle(id: string | undefined) {
  return useQuery({
    queryKey: ['userVehicles', id],
    queryFn: () => userVehiclesApi.getOne(id as string),
    enabled: !!id,
  });
}

export function useCreateUserVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserVehiclePayload) => userVehiclesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userVehicles'] }),
  });
}
