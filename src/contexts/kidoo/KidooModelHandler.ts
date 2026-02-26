/**
 * Types partagés et factory pour les handlers de modèles Kidoo.
 */

import type { KidooModelId } from '@kidoo/shared';
import { Kidoo } from '@/api';
import type { MenuListItem } from '@/components/ui';
import { BasicModelHandler } from './basic';
import { DreamModelHandler } from './dream';

export const MODEL_FEATURES = {
  /** Capteur environnement : température, humidité, pression (AHT20+BMP280 ou équivalent) */
  ENV: 'env',
  LED: 'led',
  AUDIO: 'audio',
  NFC: 'nfc',
  POTENTIOMETER: 'potentiometer',
} as const;

export type ModelFeatureKey = (typeof MODEL_FEATURES)[keyof typeof MODEL_FEATURES];

export interface CustomAction {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export interface ModelHandler {
  model: KidooModelId;
  supportsFeature(feature: string): boolean;
  getAvailableFeatures(): string[];
  getMenuItems(
    kidoo: Kidoo,
    t: (key: string, options?: any) => string,
    callbacks?: {
      onConfigureBedtime?: () => void;
      onConfigureWakeup?: () => void;
      [key: string]: (() => void) | undefined;
    }
  ): MenuListItem[];
  getCustomActions?(
    kidoo: Kidoo,
    t: (key: string, options?: any) => string,
    callbacks?: {
      onStartBedtime?: () => void;
      onStopBedtime?: () => void;
      [key: string]: (() => void) | undefined;
    }
  ): CustomAction[];
}

export function getModelHandler(model: KidooModelId): ModelHandler {
  if (model === 'dream') {
    return new DreamModelHandler();
  }
  return new BasicModelHandler();
}
