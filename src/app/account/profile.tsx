import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../../auth/auth-context';
import { usersApi } from '../../api/users.api';
import { normalizeApiError } from '../../api/errors';
import { updateProfileSchema, type UpdateProfileFormValues } from '../../schemas/profile.schema';
import { AppButton, AppInput, AppScreen, AppText, LoadingState } from '../../components/ui';
import { useTheme } from '../../theme';

export default function EditProfileScreen() {
  const { logout } = useAuth();
  const { spacing, colors } = useTheme();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const { data: me, isLoading } = useQuery({ queryKey: ['me'], queryFn: () => usersApi.getMe() });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    values: me ? { name: me.name, phone: me.phone ?? '' } : undefined,
  });

  if (isLoading) return <LoadingState label="Loading profile..." />;

  const onSubmit = async (values: UpdateProfileFormValues) => {
    setFormError(null);
    setSavedMessage(null);
    try {
      await usersApi.updateMe({ name: values.name, phone: values.phone || undefined });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      setSavedMessage('Profile updated.');
    } catch (error) {
      setFormError(normalizeApiError(error).message);
    }
  };

  return (
    <AppScreen scroll keyboardAvoiding contentContainerStyle={{ padding: spacing.lg }}>
      <AppText variant="title" style={{ marginBottom: spacing.lg }}>
        Edit profile
      </AppText>

      <AppInput label="Email" value={me?.email} editable={false} />

      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <AppInput
            label="Name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.name?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <AppInput
            label="Phone"
            keyboardType="phone-pad"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.phone?.message}
          />
        )}
      />

      {formError ? (
        <AppText color={colors.danger} style={{ marginBottom: spacing.md }}>
          {formError}
        </AppText>
      ) : null}
      {savedMessage ? (
        <AppText color={colors.success} style={{ marginBottom: spacing.md }}>
          {savedMessage}
        </AppText>
      ) : null}

      <AppButton title="Save changes" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
      <AppButton title="Log out" variant="secondary" onPress={logout} style={{ marginTop: spacing.md }} />
    </AppScreen>
  );
}
