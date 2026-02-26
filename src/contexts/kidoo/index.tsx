/**
 * Kidoo Context - Exports
 */

import type { ReactNode } from 'react';
import { DreamRealtimeProvider } from './dream';

export { KidooProvider, useKidooContext } from './KidooContext';
export { KidooRealtimeProvider, useKidooRealtimeBase } from './KidooRealtimeContext';
export { getModelHandler, ModelHandler, MODEL_FEATURES } from './KidooModelHandler';
export type { CustomAction, ModelFeatureKey } from './KidooModelHandler';
export { useDreamRealtimeContext, useKidooEnvRealtime } from './dream';

/**
 * Composite provider — regroupe tous les providers realtime par modèle.
 * Pour ajouter un nouveau modèle : imbriquer son provider ici uniquement.
 */
export function KidooModelsRealtimeProvider({ children }: { children: ReactNode }) {
  return (
    <DreamRealtimeProvider>
      {children}
    </DreamRealtimeProvider>
  );
}
