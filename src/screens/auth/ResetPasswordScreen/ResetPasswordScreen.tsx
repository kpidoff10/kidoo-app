/**
 * Reset Password Screen
 * Écran pour réinitialiser le mot de passe avec le token reçu par email
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Title, Text, Toast } from '@/components/ui';
import { useTheme } from '@/theme';
import { ResetPasswordForm } from './ResetPasswordForm';
import { apiClient } from '@/services/api';

type ResetPasswordRouteProp = RouteProp<{ ResetPassword: { email: string; token?: string } }, 'ResetPassword'>;

export function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const { email, token } = route.params || {};

  const handleResetPassword = async (data: { newPassword: string; confirmPassword: string }) => {
    try {
      setIsLoading(true);

      // Si pas de token en param, demander à l'utilisateur
      if (!token) {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: 'Token manquant',
        });
        return;
      }

      const response = await apiClient.put('/api/auth/request-password-reset', {
        token,
        newPassword: data.newPassword,
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: t('auth.resetPassword.success'),
          text2: t('auth.resetPassword.successMessage'),
        });

        // Rediriger vers login
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.resetPassword.error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
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
            onLoginPress={handleLoginPress}
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
