import { z } from 'zod';

// Mirrors backend CreateTripDto / UpdateTripDto.
export const tripFormSchema = z.object({
  userVehicleId: z.string().min(1, 'Select a vehicle'),
  originCity: z.string().min(2, 'Origin city is too short').max(100, 'Origin city is too long'),
  destinationCity: z.string().min(2, 'Destination city is too short').max(100, 'Destination city is too long'),
  pickupPoint: z.string().min(3, 'Pickup point is too short').max(300, 'Pickup point is too long'),
  dropoffPoint: z.string().max(300, 'Drop-off point is too long').optional().or(z.literal('')),
  departureAt: z.date({ message: 'Pick a departure date and time' }).refine((d) => d > new Date(), {
    message: 'Departure must be in the future',
  }),
  availableSeats: z.number().int().min(1).max(20),
  pricePerSeat: z.number().min(1, 'Price per seat must be at least 1'),
  contactNumber: z.string().min(1, 'Contact number is required').max(20, 'Contact number is too long'),
  notes: z.string().max(500, 'Notes are too long').optional().or(z.literal('')),
});

export type TripFormValues = z.infer<typeof tripFormSchema>;
