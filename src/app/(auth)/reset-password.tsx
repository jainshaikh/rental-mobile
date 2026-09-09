import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';

import { authApi } from '../../api/auth.api';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../../schemas/auth.schema';
import { normalizeApiError } from '../../api/errors';
import { AppButton, AppInput, AppScreen, AppText } from '../../components/ui';
import { useTheme } from '../../theme';

export default function ResetPasswordScreen() {
  const { spacing, colors } = useTheme();
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: tokenParam ?? '' },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null);
    try {
      const result = await authApi.resetPassword({ token: values.token, newPassword: values.newPassword });
      setSuccessMessage(result.message);
    } catch (error) {
      setFormError(normalizeApiError(error).message);
    }
  };

  if (successMessage) {
    return (
      <AppScreen contentContainerStyle={{ padding: spacing.lg, justifyContent: 'center', flexGrow: 1 }}>
        <AppText variant="title" style={{ marginBottom: spacing.sm }}>
          Password reset
        </AppText>
        <AppText muted style={{ marginBottom: spacing.xl }}>
          {successMessage}
        </AppText>
        <AppButton title="Go to login" onPress={() => router.replace('/login')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll keyboardAvoiding contentContainerStyle={{ padding: spacing.lg, justifyContent: 'center', flexGrow: 1 }}>
      <AppText variant="title" style={{ marginBottom: spacing.xs }}>
        Reset password
      </AppText>
      <AppText muted style={{ marginBottom: spacing.xl }}>
        Paste the reset code from your email and choose a new password.
      </AppText>

      <Controller
        control={control}
        name="token"
        render={({ field }) => (
          <AppInput
            label="Reset code"
            autoCapitalize="none"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.token?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="newPassword"
        render={({ field }) => (
          <AppInput
            label="New password"
            isPassword
            autoCapitalize="none"
            helperText="At least 8 characters, with an uppercase letter, lowercase letter, and number."
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.newPassword?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <AppInput
            label="Confirm new password"
            isPassword
            autoCapitalize="none"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      {formError ? (
        <AppText color={colors.danger} style={{ marginBottom: spacing.md }}>
          {formError}
        </AppText>
      ) : null}

      <AppButton title="Reset password" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </AppScreen>
  );
}
