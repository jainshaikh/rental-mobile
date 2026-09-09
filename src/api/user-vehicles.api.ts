import apiClient from './client';
import type { ApiResponse, UserVehicle, UserVehicleDetail } from '../types/api.types';

export interface UserVehicleImageInput {
  url: string;
  publicId: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface CreateUserVehiclePayload {
  // Client-generated id — lets photo/document uploads land in a per-vehicle S3
  // folder before this record exists. See MediaModule's entityId support.
  id?: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  plateNumber: string;
  images?: UserVehicleImageInput[];
  cnicFrontUrl: string;
  cnicFrontPublicId: string;
  cnicBackUrl: string;
  cnicBackPublicId: string;
  drivingLicenseUrl: string;
  drivingLicensePublicId: string;
  vehicleRegistrationUrl: string;
  vehicleRegistrationPublicId: string;
}

// Personal vehicles — registered by any USER or PROVIDER, verified once by an
// admin, then reusable across any number of posted Trips.
export const userVehiclesApi = {
  create: async (data: CreateUserVehiclePayload) => {
    const res = await apiClient.post<ApiResponse<UserVehicle>>('/my/vehicles', data);
    return res.data.data;
  },

  getMine: async () => {
    // Bare array response — this endpoint isn't paginated.
    const res = await apiClient.get<ApiResponse<UserVehicle[]>>('/my/vehicles');
    return res.data.data;
  },

  getApproved: async () => {
    const res = await apiClient.get<ApiResponse<UserVehicle[]>>('/my/vehicles/approved');
    return res.data.data;
  },

  getOne: async (id: string) => {
    const res = await apiClient.get<ApiResponse<UserVehicleDetail>>(`/my/vehicles/${id}`);
    return res.data.data;
  },
};
