import { addMinutes, isAfter, parseISO } from 'date-fns';
import { z } from 'zod';

export const MIN_ADDRESS_LENGTH = 5;
export const MAX_NOTES_LENGTH = 300;
export const MAX_PASSENGER_COUNT = 6;

export const parseDateTimeInput = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  try {
    const normalisedValue = value.length === 16 ? `${value}:00` : value;
    const parsed = parseISO(normalisedValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    return null;
  }
};

export const isFutureDateTime = (value: string, minimumMinutesAhead = 5): boolean => {
  const parsed = parseDateTimeInput(value);
  if (!parsed) {
    return false;
  }

  const threshold = addMinutes(new Date(), minimumMinutesAhead);
  return isAfter(parsed, threshold);
};

export const isValidAddress = (value: string): boolean => value.trim().length >= MIN_ADDRESS_LENGTH;

export const isValidPassengerCount = (value: number): boolean =>
  Number.isInteger(value) && value >= 1 && value <= MAX_PASSENGER_COUNT;

export const rideBookingSchema = z.object({
  riderName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.'),
  riderEmail: z
    .string()
    .trim()
    .email('Enter a valid email address.'),
  riderPhone: z
    .string()
    .trim()
    .min(6, 'Please enter a valid phone number.'),
  pickupAddress: z
    .string()
    .trim()
    .refine(isValidAddress, 'Pickup address must be at least 5 characters.'),
  dropoffAddress: z
    .string()
    .trim()
    .refine(isValidAddress, 'Drop-off address must be at least 5 characters.'),
  scheduledAt: z
    .string()
    .refine((value) => isFutureDateTime(value), {
      message: 'Please choose a pickup time at least 5 minutes from now.',
    }),
  passengerCount: z
    .number({ invalid_type_error: 'Passenger count is required.' })
    .int('Passenger count must be a whole number.')
    .min(1, 'There must be at least one passenger.')
    .max(MAX_PASSENGER_COUNT, `We can accommodate up to ${MAX_PASSENGER_COUNT} passengers.`),
  notes: z
    .string()
    .trim()
    .max(MAX_NOTES_LENGTH, `Notes cannot exceed ${MAX_NOTES_LENGTH} characters.`)
    .optional()
    .or(z.literal('')),
});

export type RideBookingFormValues = z.infer<typeof rideBookingSchema>;

export const sanitiseNotes = (notes?: string | null): string | undefined => {
  if (!notes) {
    return undefined;
  }

  const trimmed = notes.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};
