/**
 * Forgot Password Screen
 * Écran pour demander un reset password par email
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Title, Text, Toast } from '@/components/ui';
import { useTheme } from '@/theme';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { apiClient } from '@/services/api';

export function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
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
            {t('auth.forgotPassword.title')}
          </Title>
          <Text color="secondary" center style={{ marginTop: spacing[2] }}>
            {t('auth.forgotPassword.description')}
          </Text>
        </View>

        <View style={[styles.formContainer, { marginTop: spacing[10] }]}>
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
  header: {
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
  },
});
