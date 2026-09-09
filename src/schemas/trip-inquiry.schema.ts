import { z } from 'zod';

// Mirrors backend CreateTripInquiryDto.
export const tripInquirySchema = z.object({
  requestedSeats: z.number({ message: 'Enter how many seats you need' }).int().min(1).max(20),
  pickupNote: z.string().max(200, 'Note is too long').optional().or(z.literal('')),
  message: z.string().max(500, 'Message is too long').optional().or(z.literal('')),
});

export type TripInquiryFormValues = z.infer<typeof tripInquirySchema>;
