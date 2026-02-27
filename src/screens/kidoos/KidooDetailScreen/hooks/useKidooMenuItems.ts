/**
 * Hook pour générer les items de menu d'un Kidoo
 * Combine les items communs et les items spécifiques au modèle
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { MenuListItem } from '@/components/ui';
import { Kidoo } from '@/api';
import { ModelHandler } from '@/contexts/kidoo/KidooModelHandler';
import { getKidooModelDisplayName, getKidooModelIcon } from '@/config';
import { useAuth } from '@/contexts';
import moment from 'moment';

/** Callbacks optionnels passés au model handler (ex: onConfigureBedtime pour Dream) */
export type ModelMenuCallbacks = Record<string, (() => void) | undefined>;

interface UseKidooMenuItemsParams {
  kidoo: Kidoo | undefined;
  modelHandler: ModelHandler | undefined;
  /** Si true, affiche une icône warning sur la ligne "Version du firmware" (MAJ disponible) */
  hasFirmwareUpdate?: boolean;
  /** Si true, affiche un loader sur la ligne "Version du firmware" (vérification en cours) */
  isFirmwareCheckLoading?: boolean;
  /** Dernière version firmware disponible (pour afficher "1.0.0 → 1.0.1" avec 1.0.1 en vert) */
  latestFirmwareVersion?: string | null;
  /** Callback quand on clique sur la ligne "Version du firmware" (MAJ disponible) */
  onFirmwareUpdatePress?: () => void;
  onEditName?: () => void;
  onConfigureWiFi?: () => void;
  onConfigureBrightness?: () => void;
  /** Callbacks spécifiques au modèle, passés au handler (Dream: onConfigureBedtime, onConfigureWakeup, etc.) */
  modelCallbacks?: ModelMenuCallbacks;
}

export function useKidooMenuItems({ kidoo, modelHandler, hasFirmwareUpdate, isFirmwareCheckLoading, latestFirmwareVersion, onFirmwareUpdatePress, onEditName, onConfigureWiFi, onConfigureBrightness, modelCallbacks }: UseKidooMenuItemsParams): MenuListItem[] {
  const { t } = useTranslation();
  const { isDeveloper } = useAuth();

  return useMemo(() => {
    if (!kidoo) return [];

    // Items communs à tous les modèles
    const commonItems: MenuListItem[] = [
      {
        label: t('kidoos.name', { defaultValue: 'Nom de l\'appareil' }),
        value: kidoo.name,
        icon: 'pencil-outline',
        onPress: onEditName,
      },
      {
        label: t('kidoos.model', { defaultValue: 'Modèle' }),
        value: getKidooModelDisplayName(kidoo.model),
        icon: getKidooModelIcon(kidoo.model) as any,
        disabled: true,
      },
      {
        label: t('kidoos.status', { defaultValue: 'Statut' }),
        value: kidoo.isConnected 
          ? t('kidoos.online', { defaultValue: 'En ligne' })
          : kidoo.lastConnected 
            ? t('kidoos.lastSeen', { 
                time: moment(kidoo.lastConnected).fromNow(),
                defaultValue: 'Vu il y a {{time}}'
              })
            : t('kidoos.offline', { defaultValue: 'Hors ligne' }),
        icon: kidoo.isConnected ? 'checkmark-circle' : 'close-circle',
        disabled: true,
      },
      {
        label: t('kidoos.wifiConfig.title', { defaultValue: 'Configuration WiFi' }),
        value: t('kidoos.wifiConfig.requiresDirectConnection', { defaultValue: 'Connexion directe au Kidoo nécessaire' }),
        icon: 'wifi-outline',
        onPress: onConfigureWiFi,
      },
      {
        label: t('kidoos.brightness.title', { defaultValue: 'Luminosité' }),
        value: t('kidoos.brightness.description', { defaultValue: 'Régler la luminosité générale' }),
        icon: 'sunny-outline',
        onPress: onConfigureBrightness,
      },
    ];

    // Ajouter l'adresse MAC si disponible et en mode développeur
    if (isDeveloper && kidoo.macAddress) {
      commonItems.push({
        label: t('kidoos.macAddress', { defaultValue: 'Adresse MAC' }),
        value: kidoo.macAddress,
        icon: 'hardware-chip-outline',
        disabled: true,
      });
    }

    // Ajouter le Device ID si en mode développeur
    if (isDeveloper && kidoo.deviceId) {
      commonItems.push({
        label: t('kidoos.deviceId', { defaultValue: 'ID Appareil' }),
        value: kidoo.deviceId,
        icon: 'finger-print-outline',
        disabled: true,
      });
    }

    // Items spécifiques au modèle (via le handler)
    const modelSpecificItems = modelHandler
      ? modelHandler.getMenuItems(kidoo, t, modelCallbacks)
      : [];

    // Version du firmware (toujours en dernier, après les items communs et custom)
    const currentVersion = kidoo.firmwareVersion ?? t('kidoos.firmwareVersion.unknown', { defaultValue: 'Non connue' });
    const firmwareValue =
      !isFirmwareCheckLoading && hasFirmwareUpdate && latestFirmwareVersion
        ? `${currentVersion} → ${latestFirmwareVersion}`
        : currentVersion;
    const firmwareItem: MenuListItem = {
      label: t('kidoos.firmwareVersion.title', { defaultValue: 'Version du firmware' }),
      value: firmwareValue,
      ...(!isFirmwareCheckLoading && hasFirmwareUpdate && latestFirmwareVersion && { valueHighlight: latestFirmwareVersion }),
      icon: 'code-slash-outline',
      disabled: !onFirmwareUpdatePress || isFirmwareCheckLoading || !hasFirmwareUpdate,
      ...(isFirmwareCheckLoading && { trailingLoader: true }),
      ...(!isFirmwareCheckLoading && hasFirmwareUpdate && { trailingIcon: 'warning-outline' as const }),
      ...(!isFirmwareCheckLoading && hasFirmwareUpdate && onFirmwareUpdatePress && { onPress: onFirmwareUpdatePress }),
    };

    return [...commonItems, ...modelSpecificItems, firmwareItem];
  }, [kidoo, modelHandler, isDeveloper, hasFirmwareUpdate, isFirmwareCheckLoading, latestFirmwareVersion, onFirmwareUpdatePress, onEditName, onConfigureWiFi, onConfigureBrightness, modelCallbacks, t]);
}
