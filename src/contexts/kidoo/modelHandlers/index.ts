/**
 * Model Handlers - Exports
 */

export { ModelHandler, MODEL_FEATURES } from './types';
export { BasicModelHandler } from './basicHandler';
export { DreamModelHandler } from './dreamHandler';

/**
 * Factory pour obtenir le handler approprié selon le modèle (KidooModelId)
 */
import type { KidooModelId } from '@kidoo/shared';
import { BasicModelHandler } from './basicHandler';
import { DreamModelHandler } from './dreamHandler';
import { ModelHandler } from './types';

export function getModelHandler(model: KidooModelId): ModelHandler {
  if (model === 'dream') {
    return new DreamModelHandler();
  }
  return new BasicModelHandler();
}
