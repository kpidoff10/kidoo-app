/**
 * Forgot Password Screen
 * Écran pour demander un reset password par email
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { Toast } from '@/components/ui';
import { apiClient } from '@/services/api';

export function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (data: { email: string }) => {
    try {
      setIsLoading(true);

      const response = await apiClient.post('/api/auth/request-password-reset', {
        email: data.email,
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: t('auth.forgotPassword.success'),
          text2: t('auth.forgotPassword.checkEmail'),
        });

        // Naviguer vers l'écran ResetPassword avec l'email
        navigation.navigate('ResetPassword', { email: data.email });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.forgotPassword.error'),
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
          <ForgotPasswordForm
            onSubmit={handleForgotPassword}
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
