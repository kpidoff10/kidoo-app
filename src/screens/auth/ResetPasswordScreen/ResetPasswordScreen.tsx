/**
 * Reset Password Screen
 * Écran pour réinitialiser le mot de passe avec le token reçu par email
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Title, Text } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme';
import { ResetPasswordForm } from './ResetPasswordForm';
import { apiClient } from '@/api';

type ResetPasswordRouteProp = RouteProp<{ ResetPassword: { email: string } }, 'ResetPassword'>;

export function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const { email } = route.params || {};

  const handleResetPassword = async (data: { code: string; newPassword: string; confirmPassword: string }) => {
    try {
      setIsLoading(true);

      const response = await apiClient.put('/api/auth/request-password-reset', {
        token: data.code,
        newPassword: data.newPassword,
      });

      // Axios retourne la réponse directement si succès (status 2xx)
      // Les erreurs sont catchées dans le bloc catch
      showToast.success({
        title: t('auth.resetPassword.success'),
        message: t('auth.resetPassword.successMessage'),
      });

      // Rediriger vers login
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('Reset password error:', error);
      // Afficher le message d'erreur de l'API si disponible
      const errorMessage = error.response?.data?.error || t('auth.resetPassword.error');
      showToast.error({
        title: t('common.error'),
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { padding: spacing[6], paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Title level="h1" center>
            {t('auth.resetPassword.title')}
          </Title>
          <Text color="secondary" center style={{ marginTop: spacing[2] }}>
            {t('auth.resetPassword.description')}
          </Text>
        </View>

        <View style={[styles.formContainer, { marginTop: spacing[10] }]}>
          <ResetPasswordForm
            onSubmit={handleResetPassword}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
  },
});
