/**
 * Nighttime Alert Sheet
 * Bottom sheet pour activer/désactiver l'alerte réveil nocturne (Dream)
 */

import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Button, Text, InfoBox } from '@/components/ui';
import { useTheme } from '@/theme';
import type { UseBottomSheetReturn } from '@/hooks';
import { useDreamNighttimeAlert } from '@/hooks';
import { Kidoo } from '@/api';
import { AlertToggleRow } from './components';

export interface NighttimeAlertSheetProps {
  bottomSheet: UseBottomSheetReturn;
  kidoo: Kidoo;
  onClose?: () => void;
}

export function NighttimeAlertSheet({ bottomSheet, kidoo, onClose }: NighttimeAlertSheetProps) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const {
    nighttimeAlertEnabled,
    isLoading,
    updateNighttimeAlert,
    isUpdating,
  } = useDreamNighttimeAlert(kidoo.id);

  const handleToggle = async (value: boolean) => {
    try {
      await updateNighttimeAlert({ id: kidoo.id, enabled: value });
    } catch {
      // Error handled by mutation
    }
  };

  const handleClosePress = useCallback(async () => {
    await bottomSheet.close();
  }, [bottomSheet]);

  const handleDidDismiss = useCallback(() => {
    bottomSheet.handleDidDismiss({} as any);
    onClose?.();
  }, [onClose, bottomSheet]);

  return (
    <BottomSheet
      ref={bottomSheet.ref}
      name={bottomSheet.id}
      detents={['auto']}
      onDismiss={handleDidDismiss}
      headerTitle={t('kidoos.dream.nighttimeAlert.title', { defaultValue: 'Alerte veilleuse' })}
      headerIcon="notifications-outline"
    >
      <View>
        <Text variant="body" color="secondary">
          {t('kidoos.dream.nighttimeAlert.description', {
            defaultValue:
              'Quand vous activez cette alerte, vous recevrez une notification sur votre téléphone si votre enfant touche la veilleuse pendant la nuit. Cela peut indiquer qu\'il s\'est réveillé.',
          })}
        </Text>

        <InfoBox
          message={t('kidoos.dream.nighttimeAlert.wifiOfflineInfo', {
            defaultValue:
              'Si le Kidoo n\'est pas connecté au WiFi, il ne pourra pas envoyer de message à votre téléphone.',
          })}
        />

        <AlertToggleRow
          label={t('kidoos.dream.nighttimeAlert.enable', { defaultValue: 'Activer l\'alerte' })}
          value={nighttimeAlertEnabled}
          onValueChange={handleToggle}
          disabled={isLoading || isUpdating}
        />

        <Button
          title={t('common.close', { defaultValue: 'Fermer' })}
          variant="outline"
          onPress={handleClosePress}
          style={{ marginTop: spacing[8] }}
        />
      </View>
    </BottomSheet>
  );
}

