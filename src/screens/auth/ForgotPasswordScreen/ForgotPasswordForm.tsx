/**
 * Forgot Password Form Component
 * Permet à l'utilisateur de demander un reset password
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { TextInput, Button, Text } from '@/components/ui';
import { useTheme } from '@/theme';

const forgotPasswordSchema = z.object({
  email: z.string().email('auth.errors.emailInvalid').min(1, 'auth.errors.emailRequired'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => Promise<void>;
  onLoginPress: () => void;
  isLoading: boolean;
}

export function ForgotPasswordForm({
  onSubmit,
  onLoginPress,
  isLoading,
}: ForgotPasswordFormProps) {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('auth.forgotPassword.email')}
            placeholder={t('auth.forgotPassword.emailPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email ? t(errors.email.message as string) : undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={{ marginBottom: spacing[6] }}
          />
        )}
      />

      <Button
        title={t('auth.forgotPassword.submit')}
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
        fullWidth
      />

      <View style={[styles.footer, { marginTop: spacing[6] }]}>
        <Text color="secondary">{t('auth.forgotPassword.rememberPassword')}</Text>
        <TouchableOpacity onPress={onLoginPress}>
          <Text color="primary" bold style={{ marginLeft: spacing[1] }}>
            {t('auth.forgotPassword.backToLogin')}
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
