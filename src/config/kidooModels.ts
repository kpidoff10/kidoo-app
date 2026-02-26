/**
 * Configuration des modèles Kidoo
 * Basée sur l'enum partagé (@kidoo/shared) pour rester alignée avec l'API et la base.
 */

import {
  KIDOO_MODELS,
  getKidooModel,
  isKidooModelId,
  type KidooModelId,
  type KidooModel,
} from '@kidoo/shared';

// Ré-export pour usage dans l'app
export { KIDOO_MODELS, getKidooModel, isKidooModelId };
export type { KidooModelId, KidooModel };

/** Noms BLE diffusés par le firmware (pour détecter le modèle depuis device.name) */
export const BLE_MODEL_NAMES = ['Kidoo-Basic', 'Kidoo-Dream'] as const;

/**
 * Convertir un nom BLE (détecté depuis device.name) vers l'id modèle API / base (KidooModelId).
 */
export function convertBleModelToApiModel(bleName: string): KidooModelId {
  const normalized = bleName.toLowerCase();
  if (normalized.includes('basic')) return 'basic';
  if (normalized.includes('dream')) return 'dream';
  return 'basic';
}

/**
 * Obtenir le nom d'affichage d'un modèle (accepte KidooModelId ou chaîne pour rétrocompat).
 */
export function getKidooModelDisplayName(model: KidooModelId | string): string {
  const m = getKidooModel(model);
  return m?.label ?? model;
}

/**
 * Obtenir le nom de l'icône Ionicons pour un modèle.
 */
export function getKidooModelIcon(model: KidooModelId | string): string {
  const m = getKidooModel(model);
  if (!m) return 'cube-outline';
  return m.id === 'dream' ? 'sparkles-outline' : 'cube-outline';
}

/** @deprecated Utiliser KidooModelId */
export type KidooApiModel = KidooModelId;
