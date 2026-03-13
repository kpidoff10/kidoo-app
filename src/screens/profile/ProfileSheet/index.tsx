/**
 * Profile Sheet Component
 * Bottom sheet pour afficher/modifier le profil
 */

import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Text, Button, BottomSheet, InfoBottomSheet } from '@/components/ui';
import { spacing, useTheme } from '@/theme';
import { useAuth } from '@/contexts';
import { useBottomSheet, useProfile } from '@/hooks';
import type { UseBottomSheetReturn } from '@/hooks';

interface ProfileSheetProps {
  bottomSheet: UseBottomSheetReturn;
  onClose?: () => void;
}

export function ProfileSheet({ bottomSheet, onClose }: ProfileSheetProps) {
    const { t } = useTranslation();
    const { colors, spacing, separators } = useTheme();
    const { logout, setDeveloperMode, isDeveloper } = useAuth();
    const { data: user } = useProfile();
    const navigation = useNavigation();

    // Bottom sheet pour le dialogue de confirmation de déconnexion
    const logoutConfirmSheet = useBottomSheet();

    // Compteur d'appuis pour activer le mode développeur
    const tapCountRef = useRef(0);
    const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleLogout = useCallback(() => {
      logoutConfirmSheet.open();
    }, [logoutConfirmSheet]);

    const handleConfirmLogout = useCallback(async () => {
      await logoutConfirmSheet.close();
      await logout();
      await bottomSheet.close();
      onClose?.();
    }, [logout, bottomSheet, onClose, logoutConfirmSheet]);

    const handleDismiss = useCallback(() => {
      // Mettre à jour l'état du hook
      bottomSheet.handleDidDismiss({} as any);
      onClose?.();
    }, [bottomSheet, onClose]);

    const handleVersionPress = useCallback(() => {
      // Réinitialiser le timeout si un tap précédent existe
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }

      tapCountRef.current += 1;

      // Si on atteint 10 appuis, activer le mode développeur
      if (tapCountRef.current >= 10) {
        tapCountRef.current = 0;
        setDeveloperMode(!isDeveloper);
      } else {
        // Réinitialiser le compteur après 2 secondes sans appui
        tapTimeoutRef.current = setTimeout(() => {
          tapCountRef.current = 0;
        }, 2000);
      }
    }, [isDeveloper, setDeveloperMode]);

    return (
      <>
      <BottomSheet
        ref={bottomSheet.ref}
        name={bottomSheet.id}
        detents={['auto']}
        onDismiss={handleDismiss}
        headerName={user?.name}
        headerEmail={user?.email}
      >
          {/* Actions */}
          <View style={[styles.actions, { marginTop: spacing[8] }]}>
            <TouchableOpacity
              style={[styles.actionItem, { borderBottomColor: colors.border }]}
              onPress={async () => {
                await bottomSheet.close();
                onClose?.();
                navigation.navigate('EditProfile' as never);
              }}
            >
              <Ionicons name="person-outline" size={22} color={colors.text} />
              <Text style={{ marginLeft: spacing[3], flex: 1 }}>
                {t('profile.editProfile')}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <View style={{ marginTop: spacing[6] }}>
            <Button
              title={t('profile.logout')}
              variant="outline"
              onPress={handleLogout}
              fullWidth
              style={{ borderColor: colors.error }}
              textStyle={{ color: colors.error }}
            />
          </View>

          {/* Séparateur */}
          <View style={[separators.horizontal, { borderTopColor: colors.border, marginTop: spacing[6] }]} />

          {/* Version */}
          <TouchableOpacity 
            style={[styles.versionContainer]}
            onPress={handleVersionPress}
            activeOpacity={0.7}
          >
            <Text variant="caption" color="tertiary" style={{ textAlign: 'center' }}>
              {t('profile.version', { 
                version: Constants.expoConfig?.version || '1.0.0',
                defaultValue: 'Version {{version}}'
              })}
              {isDeveloper && ' 🛠️'}
            </Text>
          </TouchableOpacity>
      </BottomSheet>

      {/* Logout Confirmation Dialog */}
      <InfoBottomSheet
        bottomSheet={logoutConfirmSheet}
        type="error"
        title={t('profile.logout')}
        message={t('profile.logoutConfirm')}
        actions={[
          {
            label: t('common.cancel'),
            onPress: () => logoutConfirmSheet.close(),
            variant: 'outline',
          },
          {
            label: t('profile.logout'),
            onPress: handleConfirmLogout,
            variant: 'primary',
          },
        ]}
      />
    </>
    );
}


const styles = StyleSheet.create({
  actions: {},
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  versionContainer: {
    marginTop: spacing[2],
  },
});
