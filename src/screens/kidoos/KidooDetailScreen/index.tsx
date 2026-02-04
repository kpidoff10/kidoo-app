/**
 * Kidoo Detail Screen
 * Écran pour afficher et gérer les détails d'un Kidoo
 */

import React, { useLayoutEffect, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { MenuList, ContentScrollView, Text, Card } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme';
import { useKidooContext } from '@/contexts';
import { useBottomSheet, useFirmwareUpdateAvailable } from '@/hooks';
import { RootStackParamList } from '@/navigation/types';
import { kidoosApi, Kidoo } from '@/api';
import { KidooNotFound, DeleteKidooButton, EditKidooNameSheet, WiFiConfigSheet, BrightnessConfigSheet, FirmwareUpdateSheet, useKidooMenuItems } from './components';

type RouteParams = {
  kidooId: string;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function KidooDetailScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { kidooId } = (route.params as RouteParams) || {};
  const { getKidooById, deleteKidoo, getKidooModelHandler, checkOnline } = useKidooContext();
  const editNameSheet = useBottomSheet();
  const wifiConfigSheet = useBottomSheet();
  const brightnessConfigSheet = useBottomSheet();
  const firmwareUpdateSheet = useBottomSheet();

  const kidoo = getKidooById(kidooId);
  const modelHandler = kidoo ? getKidooModelHandler(kidooId) : undefined;
  const queryClient = useQueryClient();

  // Ref pour éviter d'appeler checkOnline plusieurs fois pour le même kidooId dans une session
  const hasCheckedOnlineRef = useRef<string | null>(null);

  // À chaque focus : invalider le cache "dernière version firmware" pour refetch (évite d'afficher 1.0.1 après avoir créé 1.0.2)
  useFocusEffect(
    useCallback(() => {
      if (kidoo?.model) {
        queryClient.invalidateQueries({ queryKey: ['firmware', 'latest', kidoo.model] });
      }
    }, [kidoo?.model, queryClient])
  );

  // Vérifier si le Kidoo est en ligne quand on arrive sur l'écran ou quand on revient dessus
  useFocusEffect(
    useCallback(() => {
      // Réinitialiser le ref si on change de Kidoo
      if (hasCheckedOnlineRef.current !== kidooId) {
        hasCheckedOnlineRef.current = kidooId;

        // Vérifier que le Kidoo existe et a une adresse MAC avant de vérifier
        if (kidoo && kidoo.macAddress) {
          // Appeler checkOnline pour mettre à jour le statut
          checkOnline.mutateAsync(kidooId)
            .then((result) => {
              // Si le Kidoo n'est pas en ligne, afficher un toast warning
              if (!result.isOnline) {
                showToast.warning({
                  title: t('kidoos.detail.offline.title', {
                    defaultValue: 'Kidoo hors ligne',
                  }),
                  message: t('kidoos.detail.offline.message', {
                    defaultValue: 'Les modifications seront envoyées à la reconnexion WiFi',
                  }),
                });
              }
            })
            .catch(() => {
              // Erreur déjà gérée dans le hook useKidooCheckOnline
            });
        }
      }
    }, [kidooId, kidoo?.macAddress, checkOnline, t])
  );

  const handleEditName = useCallback(() => {
    editNameSheet.open();
  }, [editNameSheet]);

  const handleConfigureWiFi = useCallback(() => {
    wifiConfigSheet.open();
  }, [wifiConfigSheet]);

  const handleConfigureBrightness = useCallback(() => {
    brightnessConfigSheet.open();
  }, [brightnessConfigSheet]);

  const handleConfigureBedtime = useCallback(() => {
    navigation.navigate('BedtimeConfig', { kidooId });
  }, [navigation, kidooId]);

  const handleConfigureWakeup = useCallback(() => {
    navigation.navigate('WakeupConfig', { kidooId });
  }, [navigation, kidooId]);

  const { hasFirmwareUpdate, isLoading: isFirmwareCheckLoading, latestVersion: latestFirmwareVersion, latestChangelog: latestFirmwareChangelog } = useFirmwareUpdateAvailable(kidoo);

  const handleFirmwareUpdatePress = useCallback(() => {
    firmwareUpdateSheet.open();
  }, [firmwareUpdateSheet]);

  const handleStartFirmwareUpdate = useCallback(async () => {
    if (!kidoo || !latestFirmwareVersion) throw new Error('Kidoo ou version manquant');
    return kidoosApi.startFirmwareUpdate(kidoo.id, latestFirmwareVersion);
  }, [kidoo, latestFirmwareVersion]);

  const handleFirmwareUpdateSuccess = useCallback(
    (newVersion: string) => {
      queryClient.setQueryData<Kidoo[]>(['kidoos'], (old) =>
        old
          ? old.map((k) =>
              k.id === kidooId ? { ...k, firmwareVersion: newVersion } : k
            )
          : old
      );
      queryClient.invalidateQueries({ queryKey: ['firmware', 'latest', kidoo?.model] });
      checkOnline.mutate(kidooId);
    },
    [queryClient, kidooId, kidoo?.model, checkOnline]
  );

  const menuItems = useKidooMenuItems({
    kidoo,
    modelHandler,
    hasFirmwareUpdate,
    isFirmwareCheckLoading,
    latestFirmwareVersion,
    onFirmwareUpdatePress: handleFirmwareUpdatePress,
    onEditName: handleEditName,
    onConfigureWiFi: handleConfigureWiFi,
    onConfigureBrightness: handleConfigureBrightness,
    onConfigureBedtime: handleConfigureBedtime,
    onConfigureWakeup: handleConfigureWakeup,
  });

  // Mettre à jour le titre de la page avec le nom du Kidoo
  useLayoutEffect(() => {
    navigation.setOptions({
      title: kidoo?.name || t('kidoos.title', { defaultValue: 'Détails du Kidoo' }),
    });
  }, [navigation, kidoo?.name, t]);

  if (!kidoo) {
    return <KidooNotFound />;
  }

  const deviceState = kidoo.model === 'dream' ? (kidoo.deviceState ?? 'idle') : null;
  const modeConfig = deviceState
    ? {
        bedtime: {
          icon: 'moon' as const,
          bg: colors.primary + '18',
          border: colors.primary,
          labelKey: 'kidoos.detail.deviceState.bedtime',
        },
        wakeup: {
          icon: 'sunny' as const,
          bg: colors.warning + '25',
          border: colors.warning,
          labelKey: 'kidoos.detail.deviceState.wakeup',
        },
        idle: {
          icon: 'sparkles' as const,
          bg: colors.backgroundSecondary,
          border: colors.border,
          labelKey: 'kidoos.detail.deviceState.idle',
        },
      }[deviceState]
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Mode actuel (Dream) — fixe en haut, ne défile pas */}
      {modeConfig && (
        <View
          style={[
            styles.currentModeSticky,
            {
              backgroundColor: colors.background,
              paddingHorizontal: spacing[4],
              paddingTop: spacing[2],
              paddingBottom: spacing[3],
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text variant="caption" color="secondary" style={styles.currentModeLabel}>
            {t('kidoos.detail.currentMode')}
          </Text>
          <Card
            variant="default"
            padding="md"
            style={[
              styles.currentModeCard,
              {
                backgroundColor: modeConfig.bg,
                borderLeftWidth: 4,
                borderLeftColor: modeConfig.border,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.currentModeRow}>
              <View style={[styles.currentModeIconWrap, { backgroundColor: modeConfig.border + '30' }]}>
                <Ionicons name={modeConfig.icon} size={28} color={modeConfig.border} />
              </View>
              <Text bold style={styles.currentModeText}>
                {t(modeConfig.labelKey)}
              </Text>
            </View>
          </Card>
        </View>
      )}
      <ContentScrollView style={styles.scrollContent}>
        <MenuList items={menuItems} />
        <DeleteKidooButton kidoo={kidoo} deleteKidoo={deleteKidoo} />
      </ContentScrollView>

      {/* Bottom Sheet pour modifier le nom */}
      {kidoo && (
        <EditKidooNameSheet
          bottomSheet={editNameSheet}
          kidoo={kidoo}
        />
      )}

      {/* Bottom Sheet pour configurer le WiFi */}
      {kidoo && (
        <WiFiConfigSheet
          bottomSheet={wifiConfigSheet}
          kidoo={kidoo}
          onComplete={() => {
            // Rafraîchir les données du Kidoo après configuration
            checkOnline.mutate(kidooId);
          }}
        />
      )}

      {/* Bottom Sheet pour configurer la luminosité */}
      {kidoo && (
        <BrightnessConfigSheet
          bottomSheet={brightnessConfigSheet}
          kidoo={kidoo}
        />
      )}

      {/* Bottom Sheet mise à jour firmware (quand une nouvelle version est disponible) */}
      {kidoo && latestFirmwareVersion && (
        <FirmwareUpdateSheet
          bottomSheet={firmwareUpdateSheet}
          kidoo={kidoo}
          version={latestFirmwareVersion}
          changelog={latestFirmwareChangelog ?? null}
          onStartUpdate={handleStartFirmwareUpdate}
          onUpdateSuccess={handleFirmwareUpdateSuccess}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentModeSticky: {
    // Bloc fixe en haut, pas de flex pour qu'il prenne juste sa hauteur
  },
  currentModeLabel: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentModeCard: {
    marginBottom: 0,
  },
  currentModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentModeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  currentModeText: {
    fontSize: 18,
  },
  scrollContent: {
    flex: 1,
  },
});
