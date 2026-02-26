/**
 * Context pour l'écran Dream.
 * Wrapper fin autour de useDreamKidooData — partage les données entre les composants enfants.
 */

import { createContext, useContext, ReactNode } from 'react';
import { useDreamKidooData, type DreamKidooData } from '@/contexts/kidoo/dream';

const DreamDetailScreenContext = createContext<DreamKidooData | null>(null);

export function useDreamDetailScreenContext(): DreamKidooData {
  const value = useContext(DreamDetailScreenContext);
  if (!value) {
    throw new Error('useDreamDetailScreenContext must be used within DreamDetailScreenProvider');
  }
  return value;
}

interface DreamDetailScreenProviderProps {
  kidooId: string;
  children: ReactNode;
}

export function DreamDetailScreenProvider({ kidooId, children }: DreamDetailScreenProviderProps) {
  const data = useDreamKidooData(kidooId);

  return (
    <DreamDetailScreenContext.Provider value={data}>
      {children}
    </DreamDetailScreenContext.Provider>
  );
}
