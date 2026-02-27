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
      onConfigureDreamHelp?: () => void;
      [key: string]: (() => void) | undefined;
    }
  ): MenuListItem[] {
    const items: MenuListItem[] = [];

    items.push({
      label: t('kidoos.dream.bedtime.title', { defaultValue: 'Heure de coucher' }),
      value: t('kidoos.dream.bedtime.configure', { defaultValue: 'Configurer' }),
      icon: 'moon-outline',
      onPress: callbacks?.onConfigureBedtime || (() => {
        if (__DEV__) console.log('Bedtime configuration pressed for Dream');
      }),
    });

    items.push({
      label: t('kidoos.dream.wakeup.title', { defaultValue: 'Heure de réveil' }),
      value: t('kidoos.dream.wakeup.configure', { defaultValue: 'Configurer' }),
      icon: 'sunny-outline',
      onPress: callbacks?.onConfigureWakeup || (() => {
        if (__DEV__) console.log('Wakeup configuration pressed for Dream');
      }),
    });

    items.push({
      label: t('kidoos.dream.nighttimeAlert.title', { defaultValue: 'Alerte veilleuse' }),
      value: t('kidoos.dream.nighttimeAlert.configure', { defaultValue: 'Configurer' }),
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
      onStartBedtime?: () => void;
      onStopBedtime?: () => void;
      onStopRoutine?: () => void;
      [key: string]: (() => void) | undefined;
    }
  ): CustomAction[] {
    const actions: CustomAction[] = [];

    actions.push({
      id: 'start-bedtime',
      label: t('kidoos.dream.bedtime.startRoutine', { defaultValue: 'Lancer la routine' }),
      icon: 'play',
      variant: 'primary',
      onPress: callbacks?.onStartBedtime || (() => {
        if (__DEV__) console.log('Start bedtime routine pressed for Dream');
      }),
    });

    actions.push({
      id: 'stop-routine',
      label: t('kidoos.dream.routine.stop', { defaultValue: 'Arrêter la routine' }),
      icon: 'stop',
      variant: 'secondary',
      onPress: callbacks?.onStopRoutine || (() => {
        if (__DEV__) console.log('Stop routine pressed for Dream');
      }),
    });

    return actions;
  }
}
