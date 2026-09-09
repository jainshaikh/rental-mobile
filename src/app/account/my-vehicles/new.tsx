import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import * as Crypto from 'expo-crypto';

import { useCreateUserVehicle } from '../../../features/user-vehicles/queries';
import { DocumentUploadField, type UploadedDoc } from '../../../features/user-vehicles/components/DocumentUploadField';
import { VehiclePhotosField } from '../../../features/user-vehicles/components/VehiclePhotosField';
import { userVehicleFormSchema, type UserVehicleFormValues } from '../../../schemas/user-vehicle.schema';
import { normalizeApiError } from '../../../api/errors';
import { AppButton, AppInput, AppScreen, AppText } from '../../../components/ui';
import { useTheme } from '../../../theme';
import type { UserVehicleImageInput } from '../../../api/user-vehicles.api';

export default function RegisterUserVehicleScreen() {
  const { spacing, colors } = useTheme();
  const createVehicle = useCreateUserVehicle();
  const [formError, setFormError] = useState<string | null>(null);

  // Generated once, before the vehicle exists server-side, so every upload for this
  // form (photos + documents) lands in the same per-vehicle S3 folder. Sent as the
  // record's id when the form is finally submitted.
  const [vehicleId] = useState(() => Crypto.randomUUID());

  const [photos, setPhotos] = useState<UserVehicleImageInput[]>([]);
  const [cnicFront, setCnicFront] = useState<UploadedDoc | null>(null);
  const [cnicBack, setCnicBack] = useState<UploadedDoc | null>(null);
  const [drivingLicense, setDrivingLicense] = useState<UploadedDoc | null>(null);
  const [vehicleRegistration, setVehicleRegistration] = useState<UploadedDoc | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserVehicleFormValues>({ resolver: zodResolver(userVehicleFormSchema) });

  const allDocumentsUploaded = !!cnicFront && !!cnicBack && !!drivingLicense && !!vehicleRegistration;

  const onSubmit = async (values: UserVehicleFormValues) => {
    setFormError(null);
    if (!cnicFront || !cnicBack || !drivingLicense || !vehicleRegistration) {
      setFormError('Please upload all four documents before submitting.');
      return;
    }
    try {
      await createVehicle.mutateAsync({
        id: vehicleId,
        make: values.make,
        model: values.model,
        year: values.year,
        color: values.color || undefined,
        plateNumber: values.plateNumber,
        images: photos,
        cnicFrontUrl: cnicFront.url,
        cnicFrontPublicId: cnicFront.publicId,
        cnicBackUrl: cnicBack.url,
        cnicBackPublicId: cnicBack.publicId,
        drivingLicenseUrl: drivingLicense.url,
        drivingLicensePublicId: drivingLicense.publicId,
        vehicleRegistrationUrl: vehicleRegistration.url,
        vehicleRegistrationPublicId: vehicleRegistration.publicId,
      });
      router.back();
    } catch (error) {
      setFormError(normalizeApiError(error).message);
    }
  };

  return (
    <AppScreen scroll keyboardAvoiding contentContainerStyle={{ padding: spacing.lg }}>
      <AppText muted style={{ marginBottom: spacing.lg }}>
        Register your vehicle once — an admin verifies your documents, then you can reuse this vehicle for any number of
        trips.
      </AppText>

      <Controller
        control={control}
        name="make"
        render={({ field }) => (
          <AppInput label="Make" placeholder="Toyota" value={field.value} onChangeText={field.onChange} error={errors.make?.message} />
        )}
      />
      <Controller
        control={control}
        name="model"
        render={({ field }) => (
          <AppInput label="Model" placeholder="Corolla" value={field.value} onChangeText={field.onChange} error={errors.model?.message} />
        )}
      />
      <Controller
        control={control}
        name="year"
        render={({ field }) => (
          <AppInput
            label="Year (optional)"
            keyboardType="numeric"
            value={field.value?.toString() ?? ''}
            onChangeText={(v) => field.onChange(v ? Number(v) : undefined)}
            error={errors.year?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <AppInput label="Color (optional)" placeholder="White" value={field.value} onChangeText={field.onChange} error={errors.color?.message} />
        )}
      />
      <Controller
        control={control}
        name="plateNumber"
        render={({ field }) => (
          <AppInput label="Plate number" placeholder="ABC-123" value={field.value} onChangeText={field.onChange} error={errors.plateNumber?.message} />
        )}
      />

      <VehiclePhotosField entityId={vehicleId} images={photos} onChange={setPhotos} />

      <AppText variant="label" style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
        Verification documents
      </AppText>
      <DocumentUploadField label="CNIC / National ID — front" value={cnicFront} onChange={setCnicFront} entityId={vehicleId} />
      <DocumentUploadField label="CNIC / National ID — back" value={cnicBack} onChange={setCnicBack} entityId={vehicleId} />
      <DocumentUploadField label="Driving license" value={drivingLicense} onChange={setDrivingLicense} entityId={vehicleId} />
      <DocumentUploadField label="Vehicle registration" value={vehicleRegistration} onChange={setVehicleRegistration} entityId={vehicleId} />

      {formError ? (
        <AppText color={colors.danger} style={{ marginBottom: spacing.md }}>
          {formError}
        </AppText>
      ) : null}

      <AppButton
        title="Submit for verification"
        loading={createVehicle.isPending}
        disabled={!allDocumentsUploaded}
        onPress={handleSubmit(onSubmit)}
      />
    </AppScreen>
  );
}
