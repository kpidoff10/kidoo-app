/**
 * Écran de détail pour le modèle Dream
 * Affiche : mode actuel (idle/bedtime/wakeup), env (temp/humidité), menu (dont Coucher/Réveil), composants communs.
 * Utilise useKidooDetailContext() pour les données et handlers communs.
 */

import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MenuList, ContentScrollView } from '@/components/ui';
import { useTheme, detailStyles } from '@/theme';
import { useKidooContext } from '@/contexts';
import { RootStackParamList } from '@/navigation/types';
import { useKidooDetailContext } from '../context';
import { DeleteKidooButton } from '../components/DeleteKidooButton';
import { useKidooMenuItems } from '../hooks/useKidooMenuItems';
import { DreamDetailScreenProvider } from './context';
import { DreamStickyHeader, DreamDetailSheets } from './components';

export function DreamDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { deleteKidoo, getKidooModelHandler } = useKidooContext();
  const detail = useKidooDetailContext();
  const { kidooId } = detail;
  const modelHandler = getKidooModelHandler(kidooId);

  const handleConfigureBedtime = useCallback(() => {
    navigation.navigate('BedtimeConfig', { kidooId });
  }, [navigation, kidooId]);

  const handleConfigureWakeup = useCallback(() => {
    navigation.navigate('WakeupConfig', { kidooId });
  }, [navigation, kidooId]);

  const menuItems = useKidooMenuItems({
    kidoo: detail.kidoo,
    modelHandler: modelHandler ?? undefined,
    hasFirmwareUpdate: detail.hasFirmwareUpdate,
    isFirmwareCheckLoading: detail.isFirmwareCheckLoading,
    latestFirmwareVersion: detail.latestFirmwareVersion,
    onFirmwareUpdatePress: detail.handleFirmwareUpdatePress,
    onEditName: detail.handleEditName,
    onConfigureWiFi: detail.handleConfigureWiFi,
    onConfigureBrightness: detail.handleConfigureBrightness,
    onConfigureBedtime: handleConfigureBedtime,
    onConfigureWakeup: handleConfigureWakeup,
  });

  const deviceState = (detail.kidoo.deviceState ?? 'idle') as 'idle' | 'bedtime' | 'wakeup';

  return (
    <DreamDetailScreenProvider kidooId={kidooId}>
      <View style={[detailStyles.container, { backgroundColor: colors.background }]}>
        <DreamStickyHeader deviceState={deviceState} />

        <ContentScrollView style={detailStyles.scrollContent}>
          <MenuList items={menuItems} />
          <DeleteKidooButton kidoo={detail.kidoo} deleteKidoo={deleteKidoo} />
        </ContentScrollView>

        <DreamDetailSheets />
      </View>
    </DreamDetailScreenProvider>
  );
}
