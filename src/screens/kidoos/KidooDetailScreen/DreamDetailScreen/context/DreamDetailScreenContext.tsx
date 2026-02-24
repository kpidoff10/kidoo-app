/**
 * Context pour l'écran Dream : souscription env temps réel.
 * Quand l'écran est ouvert, le contexte s'abonne aux mises à jour env (polling 15 s).
 * Les enfants consomment les données via useDreamDetailScreenContext().
 */

import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useKidooEnv } from '@/hooks';
import type { KidooEnvResponse } from '@/api';

const ENV_REFETCH_INTERVAL_MS = 15_000;

export interface DreamDetailScreenContextValue {
  /** Données env (température, humidité) — mises à jour toutes les 15 s quand écran ouvert */
  envData: KidooEnvResponse | undefined;
  envIsLoading: boolean;
  envIsError: boolean;
}

const DreamDetailScreenContext = createContext<DreamDetailScreenContextValue | null>(null);

export function useDreamDetailScreenContext(): DreamDetailScreenContextValue {
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
  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  const { data: envData, isLoading: envIsLoading, isError: envIsError } = useKidooEnv(kidooId, {
    enabled: true,
    refetchInterval: isFocused ? ENV_REFETCH_INTERVAL_MS : false,
  });

  const value: DreamDetailScreenContextValue = {
    envData,
    envIsLoading,
    envIsError,
  };

  return (
    <DreamDetailScreenContext.Provider value={value}>
      {children}
    </DreamDetailScreenContext.Provider>
  );
}
