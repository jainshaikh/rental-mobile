import { z } from 'zod';

// Mirrors backend UpdateProfileDto.
export const updateProfileSchema = z.object({
  name: z.string().max(100, 'Name is too long').optional(),
  phone: z.string().max(20, 'Phone number is too long').optional().or(z.literal('')),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
