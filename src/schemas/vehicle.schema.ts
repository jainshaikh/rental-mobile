import { z } from 'zod';
import { FuelType, Transmission } from '../types/enums';

const currentYear = new Date().getFullYear();

// Mirrors backend CreateVehicleDto / UpdateVehicleDto.
export const vehicleFormSchema = z.object({
  title: z.string().min(3, 'Title is too short').max(100, 'Title is too long'),
  make: z.string().min(2, 'Make is too short').max(50, 'Make is too long'),
  model: z.string().min(1, 'Model is required').max(50, 'Model is too long'),
  // Plain z.number() (not z.coerce) — the form's onChangeText handlers already
  // convert text to a number before it reaches RHF state, and z.coerce would
  // otherwise split the resolver's input/output types (input `unknown`, output
  // `number`), which RHF's useForm generic can't reconcile.
  year: z.number().int().min(1990).max(currentYear + 2),
  transmission: z.enum(Transmission),
  fuelType: z.enum(FuelType),
  seatingCapacity: z.number().int().min(1).max(20),
  engineType: z.string().max(60, 'Engine type is too long').optional().or(z.literal('')),
  pricePerDay: z.number().min(1, 'Price per day must be at least 1'),
  pricePerWeek: z.number().min(1).optional(),
  availabilityNotes: z.string().max(500, 'Note is too long').optional().or(z.literal('')),
  pricingNotes: z.string().max(500, 'Note is too long').optional().or(z.literal('')),
  specialConditions: z.string().max(1000, 'Note is too long').optional().or(z.literal('')),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
