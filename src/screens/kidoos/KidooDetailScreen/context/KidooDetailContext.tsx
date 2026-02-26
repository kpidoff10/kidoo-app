/**
 * Context pour l'écran de détail Kidoo.
 * Le Provider expose kidoo, kidooId et toutes les fonctions/état communs (checkOnline, sheets, firmware, handlers).
 * La logique commune (focus, titre, sheets, firmware) est intégrée ici.
 */

import React, { createContext, useContext, useCallback, useLayoutEffect, useRef, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { UseMutationResult } from '@tanstack/react-query';
import { showToast } from '@/components/ui';
import { useKidooContext } from '@/contexts';
import { useBottomSheet, useFirmwareUpdateAvailable, KIDOOS_KEY } from '@/hooks';
import { firmwareQueryKey } from '@/config/timings';
import { RootStackParamList } from '@/navigation/types';
import { kidoosApi, Kidoo } from '@/api';
import type { UseBottomSheetReturn } from '@/hooks';
import { queryClient } from '@/lib/queryClient';
import type { FirmwareUpdateResult } from '../components/FirmwareUpdateSheet';

export interface KidooDetailContextValue {
  kidoo: Kidoo;
  kidooId: string;
  checkOnline: UseMutationResult<
    { isOnline: boolean; reason?: string; deviceState?: 'idle' | 'bedtime' | 'wakeup' },
    Error,
    string,
    unknown
  >;
  editNameSheet: UseBottomSheetReturn;
  wifiConfigSheet: UseBottomSheetReturn;
  brightnessConfigSheet: UseBottomSheetReturn;
  firmwareUpdateSheet: UseBottomSheetReturn;
  handleEditName: () => void;
  handleConfigureWiFi: () => void;
  handleConfigureBrightness: () => void;
  handleFirmwareUpdatePress: () => void;
  handleStartFirmwareUpdate: () => Promise<FirmwareUpdateResult>;
  handleFirmwareUpdateSuccess: (newVersion: string) => void;
  hasFirmwareUpdate: boolean;
  isFirmwareCheckLoading: boolean;
  latestFirmwareVersion: string | null | undefined;
  latestFirmwareChangelog: string | null | undefined;
}

const KidooDetailContext = createContext<KidooDetailContextValue | null>(null);

export function useKidooDetailContext(): KidooDetailContextValue {
  const value = useContext(KidooDetailContext);
  if (!value) {
    throw new Error('useKidooDetailContext must be used within KidooDetailProvider');
  }
  return value;
}

interface KidooDetailProviderProps {
  kidoo: Kidoo;
  kidooId: string;
  children: ReactNode;
}

export function KidooDetailProvider({ kidoo, kidooId, children }: KidooDetailProviderProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { checkOnline } = useKidooContext();
  const editNameSheet = useBottomSheet();
  const wifiConfigSheet = useBottomSheet();
  const brightnessConfigSheet = useBottomSheet();
  const firmwareUpdateSheet = useBottomSheet();
  const hasCheckedOnlineRef = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (kidoo?.model) {
        queryClient.invalidateQueries({ queryKey: firmwareQueryKey(kidoo.model) });
      }
    }, [kidoo?.model, queryClient])
  );

  useFocusEffect(
    useCallback(() => {
      if (hasCheckedOnlineRef.current !== kidooId) {
        hasCheckedOnlineRef.current = kidooId;
        if (kidoo?.macAddress) {
          checkOnline.mutateAsync(kidooId)
            .then((result) => {
              if (!result.isOnline) {
                showToast.warning({
                  title: t('kidoos.detail.offline.title', { defaultValue: 'Kidoo hors ligne' }),
                  message: t('kidoos.detail.offline.message', {
                    defaultValue: 'Les modifications seront envoyées à la reconnexion WiFi',
                  }),
                });
              }
            })
            .catch(() => {});
        }
      }
    }, [kidooId, kidoo?.macAddress, checkOnline, t])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: kidoo?.name || t('kidoos.title', { defaultValue: 'Détails du Kidoo' }),
    });
  }, [navigation, kidoo?.name, t]);

  const {
    hasFirmwareUpdate,
    isLoading: isFirmwareCheckLoading,
    latestVersion: latestFirmwareVersion,
    latestChangelog: latestFirmwareChangelog,
  } = useFirmwareUpdateAvailable(kidoo);

  const handleEditName = useCallback(() => editNameSheet.open(), [editNameSheet]);
  const handleConfigureWiFi = useCallback(() => wifiConfigSheet.open(), [wifiConfigSheet]);
  const handleConfigureBrightness = useCallback(() => brightnessConfigSheet.open(), [brightnessConfigSheet]);
  const handleFirmwareUpdatePress = useCallback(() => firmwareUpdateSheet.open(), [firmwareUpdateSheet]);

  const handleStartFirmwareUpdate = useCallback(async () => {
    if (!latestFirmwareVersion) throw new Error('Kidoo ou version manquant');
    return kidoosApi.startFirmwareUpdate(kidoo.id, latestFirmwareVersion);
  }, [kidoo.id, latestFirmwareVersion]);

  const handleFirmwareUpdateSuccess = useCallback(
    (newVersion: string) => {
      queryClient.setQueryData<Kidoo[]>(KIDOOS_KEY, (old) =>
        old ? old.map((k) => (k.id === kidooId ? { ...k, firmwareVersion: newVersion } : k)) : old
      );
      queryClient.invalidateQueries({ queryKey: firmwareQueryKey(kidoo?.model ?? '') });
      checkOnline.mutate(kidooId);
    },
    [queryClient, kidooId, kidoo?.model, checkOnline]
  );

  const value: KidooDetailContextValue = {
    kidoo,
    kidooId,
    checkOnline,
    editNameSheet,
    wifiConfigSheet,
    brightnessConfigSheet,
    firmwareUpdateSheet,
    handleEditName,
    handleConfigureWiFi,
    handleConfigureBrightness,
    handleFirmwareUpdatePress,
    handleStartFirmwareUpdate,
    handleFirmwareUpdateSuccess,
    hasFirmwareUpdate,
    isFirmwareCheckLoading,
    latestFirmwareVersion,
    latestFirmwareChangelog,
  };

  return (
    <KidooDetailContext.Provider value={value}>
      {children}
    </KidooDetailContext.Provider>
  );
}
