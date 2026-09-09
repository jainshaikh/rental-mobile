import { z } from 'zod';
import { RentalDurationType } from '../types/enums';

// Mirrors backend CreateBookingRequestDto exactly: requestedToDate is server-derived
// from requestedFromDate + durationType + durationQuantity, never sent by the client.
export const bookingInquirySchema = z.object({
  requestedFromDate: z.date({ message: 'Pick a pick-up date & time' }),
  durationType: z.nativeEnum(RentalDurationType, { message: 'Pick a duration' }),
  durationQuantity: z.number().int().min(1, 'Quantity must be at least 1'),
  pickupLocation: z.string().max(200, 'Pickup location is too long').optional().or(z.literal('')),
  message: z.string().max(1000, 'Message is too long').optional().or(z.literal('')),
});

export type BookingInquiryFormValues = z.infer<typeof bookingInquirySchema>;
