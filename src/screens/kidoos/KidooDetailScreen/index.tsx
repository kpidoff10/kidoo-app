/**
 * Kidoo Detail Screen — point d'entrée unique.
 * Dispatche vers l'écran de détail du modèle (Dream, Basic, …).
 * Le Provider expose les fonctions communes (sheets, firmware, checkOnline, etc.) via le context.
 */

import React from 'react';
import { useRoute } from '@react-navigation/native';
import { useKidooContext } from '@/contexts';
import { KidooNotFound } from './components/KidooNotFound';
import { KidooDetailProvider } from './context';
import { DreamDetailScreen } from './DreamDetailScreen';
import { BasicDetailScreen } from './BasicDetailScreen';

type RouteParams = { kidooId: string };

export function KidooDetailScreen() {
  const route = useRoute();
  const { kidooId } = (route.params as RouteParams) || {};
  const { getKidooById } = useKidooContext();
  const kidoo = getKidooById(kidooId);

  if (!kidoo) {
    return <KidooNotFound />;
  }

  return (
    <KidooDetailProvider kidoo={kidoo} kidooId={kidooId}>
      {kidoo.model === 'dream' ? <DreamDetailScreen /> : <BasicDetailScreen />}
    </KidooDetailProvider>
  );
}
