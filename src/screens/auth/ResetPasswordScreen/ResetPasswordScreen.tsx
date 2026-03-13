/**
 * Reset Password Screen
 * Écran pour réinitialiser le mot de passe avec le token reçu par email
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';
import { ResetPasswordForm } from './ResetPasswordForm';
import { Toast } from '@/components/ui';
import { apiClient } from '@/services/api';

type ResetPasswordRouteProp = RouteProp<{ ResetPassword: { email: string; token?: string } }, 'ResetPassword'>;

export function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing[4] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content]}>
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
  content: {
    width: '100%',
  },
});
