/**
 * Écran de détail pour le modèle Basic
 * Affiche : menu (nom, modèle, statut, WiFi, luminosité, firmware), composants communs.
 * Utilise useKidooDetailContext() pour les données et handlers communs.
 */

import React from 'react';
import { View } from 'react-native';
import { useTheme, detailStyles } from '@/theme';
import { useKidooContext } from '@/contexts';
import { MenuList, ContentScrollView } from '@/components/ui';
import { DeleteKidooButton } from '../components/DeleteKidooButton';
import { EditKidooNameSheet } from '../components/EditKidooNameSheet';
import { WiFiConfigSheet } from '../components/WiFiConfigSheet';
import { BrightnessConfigSheet } from '../components/BrightnessConfigSheet';
import { FirmwareUpdateSheet } from '../components/FirmwareUpdateSheet';
import { useKidooMenuItems } from '../hooks/useKidooMenuItems';
import { useKidooDetailContext } from '../context';

export function BasicDetailScreen() {
  const { colors } = useTheme();
  const { deleteKidoo, getKidooModelHandler } = useKidooContext();
  const detail = useKidooDetailContext();
  const { kidoo, kidooId } = detail;
  const modelHandler = getKidooModelHandler(kidooId);

  const menuItems = useKidooMenuItems({
    kidoo,
    modelHandler: modelHandler ?? undefined,
    hasFirmwareUpdate: detail.hasFirmwareUpdate,
    isFirmwareCheckLoading: detail.isFirmwareCheckLoading,
    latestFirmwareVersion: detail.latestFirmwareVersion,
    onFirmwareUpdatePress: detail.handleFirmwareUpdatePress,
    onEditName: detail.handleEditName,
    onConfigureWiFi: detail.handleConfigureWiFi,
    onConfigureBrightness: detail.handleConfigureBrightness,
    // Pas de Coucher / Réveil pour Basic
  });

  return (
    <View style={[detailStyles.container, { backgroundColor: colors.background }]}>
      <ContentScrollView style={detailStyles.scrollContent}>
        <MenuList items={menuItems} />
        <DeleteKidooButton kidoo={kidoo} deleteKidoo={deleteKidoo} />
      </ContentScrollView>

      <EditKidooNameSheet bottomSheet={detail.editNameSheet} kidoo={kidoo} />
      <WiFiConfigSheet
        bottomSheet={detail.wifiConfigSheet}
        kidoo={kidoo}
        onComplete={() => detail.checkOnline.mutate(kidooId)}
      />
      <BrightnessConfigSheet bottomSheet={detail.brightnessConfigSheet} kidoo={kidoo} />
      {detail.latestFirmwareVersion && (
        <FirmwareUpdateSheet
          bottomSheet={detail.firmwareUpdateSheet}
          kidoo={kidoo}
          version={detail.latestFirmwareVersion}
          changelog={detail.latestFirmwareChangelog ?? null}
          onStartUpdate={detail.handleStartFirmwareUpdate}
          onUpdateSuccess={detail.handleFirmwareUpdateSuccess}
        />
      )}
    </View>
  );
}
