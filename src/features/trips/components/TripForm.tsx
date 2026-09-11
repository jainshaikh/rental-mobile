import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';

import { useTheme } from '../../../theme';
import { AppButton, AppInput, AppText, DateField } from '../../../components/ui';
import { LocationField } from '../../location/components/LocationField';
import { FilterChipRow } from '../../listings/components/FilterChipRow';
import { useMyApprovedUserVehicles } from '../../user-vehicles/queries';
import { tripFormSchema, type TripFormValues } from '../../../schemas/trip.schema';
import { titleCase } from '../../../utils/format';

interface TripFormProps {
  defaultValues?: Partial<TripFormValues>;
  onSubmit: (values: TripFormValues) => void | Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}

export function TripForm({ defaultValues, onSubmit, submitLabel, submitting }: TripFormProps) {
  const { spacing } = useTheme();
  const approvedVehicles = useMyApprovedUserVehicles();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TripFormValues>({ resolver: zodResolver(tripFormSchema), defaultValues });

  const userVehicleId = watch('userVehicleId');

  const vehicleOptions = (approvedVehicles.data ?? []).map((v) => ({
    label: `${titleCase(v.make)} ${titleCase(v.model)} (${v.plateNumber})`,
    value: v.id,
  }));

  return (
    <View>
      <AppText variant="label" style={{ marginBottom: spacing.xs }}>
        Vehicle
      </AppText>
      {vehicleOptions.length === 0 ? (
        <AppText muted style={{ marginBottom: spacing.md }}>
          You don&apos;t have an approved vehicle yet. Register one from &quot;My Vehicles&quot; and wait for admin
          approval before posting a trip.
        </AppText>
      ) : (
        <View style={{ marginBottom: spacing.md }}>
          <FilterChipRow options={vehicleOptions} value={userVehicleId} onChange={(v) => v && setValue('userVehicleId', v)} />
          {errors.userVehicleId ? (
            <AppText variant="caption" color="red" style={{ marginTop: spacing.xs }}>
              {errors.userVehicleId.message}
            </AppText>
          ) : null}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="originCity"
            render={({ field }) => (
              <AppInput label="From" placeholder="Hyderabad" value={field.value} onChangeText={field.onChange} error={errors.originCity?.message} />
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="destinationCity"
            render={({ field }) => (
              <AppInput label="To" placeholder="Karachi" value={field.value} onChangeText={field.onChange} error={errors.destinationCity?.message} />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="pickupPoint"
        render={({ field }) => (
          <LocationField
            label="Pickup point"
            required
            placeholder="Liaquatabad Chowrangi, near Total Petrol Pump"
            value={field.value}
            onChangeText={field.onChange}
            lat={watch('pickupLat')}
            lng={watch('pickupLng')}
            onLocationChange={(lat, lng) => {
              setValue('pickupLat', lat);
              setValue('pickupLng', lng);
            }}
            error={errors.pickupPoint?.message}
            regionCodes={['PK', 'AE', 'SA']}
          />
        )}
      />
      <Controller
        control={control}
        name="dropoffPoint"
        render={({ field }) => (
          <LocationField
            label="Drop-off point (optional)"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            lat={watch('dropoffLat')}
            lng={watch('dropoffLng')}
            onLocationChange={(lat, lng) => {
              setValue('dropoffLat', lat);
              setValue('dropoffLng', lng);
            }}
            error={errors.dropoffPoint?.message}
            regionCodes={['PK', 'AE', 'SA']}
          />
        )}
      />

      <Controller
        control={control}
        name="departureAt"
        render={({ field }) => (
          <DateField
            label="Departure date & time"
            mode="datetime"
            value={field.value}
            onChange={field.onChange}
            minimumDate={new Date()}
            error={errors.departureAt?.message}
          />
        )}
      />

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="availableSeats"
            render={({ field }) => (
              <AppInput
                label="Available seats"
                keyboardType="numeric"
                value={field.value?.toString() ?? ''}
                onChangeText={(v) => field.onChange(v ? Number(v) : undefined)}
                error={errors.availableSeats?.message}
              />
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="pricePerSeat"
            render={({ field }) => (
              <AppInput
                label="Price / seat"
                keyboardType="numeric"
                value={field.value?.toString() ?? ''}
                onChangeText={(v) => field.onChange(v ? Number(v) : undefined)}
                error={errors.pricePerSeat?.message}
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="contactNumber"
        render={({ field }) => (
          <AppInput
            label="WhatsApp contact number"
            keyboardType="phone-pad"
            placeholder="+923001234567"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.contactNumber?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <AppInput
            label="Notes (optional)"
            multiline
            numberOfLines={3}
            style={{ minHeight: 70, textAlignVertical: 'top', paddingTop: spacing.sm }}
            value={field.value}
            onChangeText={field.onChange}
            error={errors.notes?.message}
          />
        )}
      />

      <AppButton
        title={submitLabel}
        loading={submitting}
        disabled={vehicleOptions.length === 0}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}
