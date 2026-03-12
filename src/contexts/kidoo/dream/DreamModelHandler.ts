/**
 * Handler pour le modèle Kidoo Dream
 */

import { ModelHandler, CustomAction, MODEL_FEATURES } from '../KidooModelHandler';
import type { MenuListItem } from '@/components/ui';
import { Kidoo } from '@/api';

const DREAM_FEATURES: string[] = [MODEL_FEATURES.LED, MODEL_FEATURES.AUDIO, MODEL_FEATURES.ENV];

export class DreamModelHandler implements ModelHandler {
  model = 'dream' as const;

  supportsFeature(feature: string): boolean {
    return DREAM_FEATURES.includes(feature.toLowerCase());
  }

  getAvailableFeatures(): string[] {
    return [...DREAM_FEATURES];
  }

  getMenuItems(
    kidoo: Kidoo,
    t: (key: string, options?: any) => string,
    callbacks?: {
      onConfigureBedtime?: () => void;
      onConfigureWakeup?: () => void;
      onConfigureNighttimeAlert?: () => void;
      onConfigureDefaultColor?: () => void;
      onConfigureDreamHelp?: () => void;
      [key: string]: (() => void) | undefined;
    }
  ): MenuListItem[] {
    const items: MenuListItem[] = [];

    items.push({
      label: t('kidoos.dream.bedtime.title', { defaultValue: 'Heure de coucher' }),
      value: t('kidoos.dream.bedtime.subtitle', { defaultValue: 'Horaires et couleurs par jour' }),
      icon: 'moon-outline',
      onPress: callbacks?.onConfigureBedtime || (() => {
        if (__DEV__) console.log('Bedtime configuration pressed for Dream');
      }),
    });

    items.push({
      label: t('kidoos.dream.wakeup.title', { defaultValue: 'Heure de réveil' }),
      value: t('kidoos.dream.wakeup.subtitle', { defaultValue: 'Horaires et couleurs par jour' }),
      icon: 'sunny-outline',
      onPress: callbacks?.onConfigureWakeup || (() => {
        if (__DEV__) console.log('Wakeup configuration pressed for Dream');
      }),
    });

    items.push({
      label: t('kidoos.dream.nighttimeAlert.title', { defaultValue: 'Alerte veilleuse' }),
      value: t('kidoos.dream.nighttimeAlert.subtitle', { defaultValue: 'Alerte si l\'enfant se lève' }),
      icon: 'notifications-outline',
      onPress: callbacks?.onConfigureNighttimeAlert || (() => {
        if (__DEV__) console.log('Nighttime alert configuration pressed for Dream');
      }),
    });

    items.push({
      label: t('kidoos.dream.help.title', { defaultValue: 'Aide' }),
      value: t('kidoos.dream.help.subtitle', { defaultValue: 'Signification des couleurs' }),
      icon: 'help-circle-outline',
      onPress: callbacks?.onConfigureDreamHelp || (() => {
        if (__DEV__) console.log('Dream help pressed');
      }),
    });

    return items;
  }

  getCustomActions(
    kidoo: Kidoo,
    t: (key: string, options?: any) => string,
    callbacks?: {
      onDreamActivate?: () => void;
      [key: string]: (() => void) | undefined;
    }
  ): CustomAction[] {
    const actions: CustomAction[] = [];

    // Déterminer si une routine est active
    const isRoutineActive = kidoo.deviceState === 'bedtime' ||
                           kidoo.deviceState === 'wakeup' ||
                           kidoo.deviceState === 'manual';

    const label = isRoutineActive
      ? t('kidoos.dream.deactivate', { defaultValue: 'Désactiver' })
      : t('kidoos.dream.activate', { defaultValue: 'Activer' });

    actions.push({
      id: 'dream-activate',
      label,
      icon: isRoutineActive ? 'stop' : 'play',
      variant: 'primary',
      onPress: callbacks?.onDreamActivate || (() => {
        if (__DEV__) console.log('Dream activate pressed');
      }),
    });

    return actions;
  }
}
