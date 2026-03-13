/**
 * Reset Password Form Component
 * Permet à l'utilisateur de réinitialiser son mot de passe avec le token
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { PasswordInput, Button, TextInput } from '@/components/ui';
import { useTheme } from '@/theme';

const resetPasswordSchema = z.object({
  code: z.string()
    .min(1, 'auth.errors.codeRequired')
    .min(6, 'auth.errors.codeInvalid'),
  newPassword: z.string()
    .min(8, 'auth.errors.passwordTooShort')
    .min(1, 'auth.errors.passwordRequired'),
  confirmPassword: z.string()
    .min(1, 'auth.errors.confirmPasswordRequired'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'auth.errors.passwordMismatch',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => Promise<void>;
  isLoading: boolean;
}

export function ResetPasswordForm({
  onSubmit,
  isLoading,
}: ResetPasswordFormProps) {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('auth.resetPassword.code')}
            placeholder={t('auth.resetPassword.codePlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.code ? t(errors.code.message as string) : undefined}
            keyboardType="numeric"
            maxLength={6}
            containerStyle={{ marginBottom: spacing[4] }}
          />
        )}
      />

      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordInput
            label={t('auth.resetPassword.newPassword')}
            placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.newPassword ? t(errors.newPassword.message as string) : undefined}
            containerStyle={{ marginBottom: spacing[4] }}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordInput
            label={t('auth.resetPassword.confirmPassword')}
            placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword ? t(errors.confirmPassword.message as string) : undefined}
            containerStyle={{ marginBottom: spacing[6] }}
          />
        )}
      />

      <Button
        title={t('auth.resetPassword.submit')}
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
});
