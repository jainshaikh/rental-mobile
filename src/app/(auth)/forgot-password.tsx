import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';

import { authApi } from '../../api/auth.api';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../../schemas/auth.schema';
import { normalizeApiError } from '../../api/errors';
import { AppButton, AppInput, AppScreen, AppText } from '../../components/ui';
import { useTheme } from '../../theme';

export default function ForgotPasswordScreen() {
  const { spacing, colors } = useTheme();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setFormError(null);
    try {
      const result = await authApi.forgotPassword(values.email);
      setSuccessMessage(result.message);
    } catch (error) {
      setFormError(normalizeApiError(error).message);
    }
  };

  if (successMessage) {
    return (
      <AppScreen contentContainerStyle={{ padding: spacing.lg, justifyContent: 'center', flexGrow: 1 }}>
        <AppText variant="title" style={{ marginBottom: spacing.sm }}>
          Check your email
        </AppText>
        <AppText muted style={{ marginBottom: spacing.xl }}>
          {successMessage}
        </AppText>
        <AppButton title="Have a reset code? Reset password" variant="secondary" onPress={() => router.push('/reset-password')} />
        <AppButton title="Back to login" variant="ghost" onPress={() => router.replace('/login')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll keyboardAvoiding contentContainerStyle={{ padding: spacing.lg, justifyContent: 'center', flexGrow: 1 }}>
      <AppText variant="title" style={{ marginBottom: spacing.xs }}>
        Forgot password
      </AppText>
      <AppText muted style={{ marginBottom: spacing.xl }}>
        Enter your email and we&apos;ll send you a reset link.
      </AppText>

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <AppInput
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
          />
        )}
      />

      {formError ? (
        <AppText color={colors.danger} style={{ marginBottom: spacing.md }}>
          {formError}
        </AppText>
      ) : null}

      <AppButton title="Send reset link" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </AppScreen>
  );
}
