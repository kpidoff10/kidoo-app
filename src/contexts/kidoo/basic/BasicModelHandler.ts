/**
 * Handler pour le modèle Kidoo Basic
 */

import { ModelHandler } from '../KidooModelHandler';
import type { MenuListItem } from '@/components/ui';
import { Kidoo } from '@/api';

export class BasicModelHandler implements ModelHandler {
  model = 'basic' as const;

  supportsFeature(feature: string): boolean {
    const supportedFeatures = ['nfc', 'led', 'audio', 'potentiometer'];
    return supportedFeatures.includes(feature.toLowerCase());
  }

  getAvailableFeatures(): string[] {
    return ['nfc', 'led', 'audio', 'potentiometer'];
  }

  getMenuItems(
    kidoo: Kidoo,
    t: (key: string, options?: any) => string,
    callbacks?: {
      onConfigureBedtime?: () => void;
      [key: string]: (() => void) | undefined;
    }
  ): MenuListItem[] {
    const items: MenuListItem[] = [];

    if (this.supportsFeature('nfc')) {
      items.push({
        label: t('kidoos.features.nfc', { defaultValue: 'NFC' }),
        value: t('kidoos.features.available', { defaultValue: 'Disponible' }),
        icon: 'card-outline',
        onPress: () => {
          if (__DEV__) console.log('NFC pressed for Basic');
        },
      });
    }

    if (this.supportsFeature('potentiometer')) {
      items.push({
        label: t('kidoos.features.potentiometer', { defaultValue: 'Potentiomètre' }),
        value: t('kidoos.features.available', { defaultValue: 'Disponible' }),
        icon: 'settings-outline',
        onPress: () => {
          if (__DEV__) console.log('Potentiometer pressed for Basic');
        },
      });
    }

    return items;
  }
}
