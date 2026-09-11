import { useState } from 'react';
import { router } from 'expo-router';

import { useCreateTrip } from '../../../features/trips/queries';
import { TripForm } from '../../../features/trips/components/TripForm';
import { normalizeApiError } from '../../../api/errors';
import { AppScreen, AppText } from '../../../components/ui';
import { useTheme } from '../../../theme';
import type { TripFormValues } from '../../../schemas/trip.schema';

export default function NewTripScreen() {
  const { spacing, colors } = useTheme();
  const createTrip = useCreateTrip();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (values: TripFormValues) => {
    setFormError(null);
    try {
      await createTrip.mutateAsync({
        userVehicleId: values.userVehicleId,
        originCity: values.originCity,
        destinationCity: values.destinationCity,
        pickupPoint: values.pickupPoint,
        pickupLat: values.pickupLat,
        pickupLng: values.pickupLng,
        dropoffPoint: values.dropoffPoint || undefined,
        dropoffLat: values.dropoffLat,
        dropoffLng: values.dropoffLng,
        departureAt: values.departureAt.toISOString(),
        availableSeats: values.availableSeats,
        pricePerSeat: values.pricePerSeat,
        contactNumber: values.contactNumber,
        notes: values.notes || undefined,
      });
      router.replace('/account/my-trips');
    } catch (error) {
      setFormError(normalizeApiError(error).message);
    }
  };

  return (
    <AppScreen scroll keyboardAvoiding contentContainerStyle={{ padding: spacing.lg }}>
      <AppText muted style={{ marginBottom: spacing.lg }}>
        Your trip goes live immediately once posted.
      </AppText>

      {formError ? (
        <AppText color={colors.danger} style={{ marginBottom: spacing.md }}>
          {formError}
        </AppText>
      ) : null}

      <TripForm submitLabel="Post trip" submitting={createTrip.isPending} onSubmit={handleSubmit} />
    </AppScreen>
  );
}
