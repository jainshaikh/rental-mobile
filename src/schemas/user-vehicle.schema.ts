import { z } from 'zod';

const currentYear = new Date().getFullYear();

// Mirrors backend CreateUserVehicleDto (excluding the three document URL/publicId
// fields, which are set programmatically after each upload completes, not typed).
export const userVehicleFormSchema = z.object({
  make: z.string().min(2, 'Make is too short').max(50, 'Make is too long'),
  model: z.string().min(1, 'Model is required').max(50, 'Model is too long'),
  year: z.number().int().min(1990).max(currentYear + 2).optional(),
  color: z.string().max(30, 'Color is too long').optional().or(z.literal('')),
  plateNumber: z.string().min(2, 'Plate number is too short').max(20, 'Plate number is too long'),
});

export type UserVehicleFormValues = z.infer<typeof userVehicleFormSchema>;
