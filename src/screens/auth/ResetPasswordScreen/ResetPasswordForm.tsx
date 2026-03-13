/**
 * Reset Password Form Component
 * Permet à l'utilisateur de réinitialiser son mot de passe avec le token
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { PasswordInput, Button, Text } from '@/components/ui';
import { useTheme } from '@/theme';

const resetPasswordSchema = z.object({
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
  onLoginPress: () => void;
  isLoading: boolean;
}

export function ResetPasswordForm({
  onSubmit,
  onLoginPress,
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
      newPassword: '',
      confirmPassword: '',
    },
  });

  return (
    <View style={styles.form}>
      <View style={{ marginBottom: spacing[6] }}>
        <Text style={{ fontSize: 16, marginBottom: spacing[2] }}>
          {t('auth.resetPassword.description')}
        </Text>
      </View>

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

      <View style={[styles.footer, { marginTop: spacing[6] }]}>
        <Text color="secondary">{t('auth.resetPassword.rememberPassword')}</Text>
        <TouchableOpacity onPress={onLoginPress}>
          <Text color="primary" bold style={{ marginLeft: spacing[1] }}>
            {t('auth.resetPassword.backToLogin')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
