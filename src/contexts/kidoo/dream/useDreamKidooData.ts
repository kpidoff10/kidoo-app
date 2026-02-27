/**
 * Hook Dream — source de données unifiée pour un kidoo Dream.
 * Combine env temps réel (PubNub) avec polling fallback focus-aware.
 * Expose aussi deviceState et isConnected.
 */

import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useKidooEnv } from '@/hooks';
import { useKidooContext } from '../KidooContext';
import { useKidooEnvRealtime, useDreamRealtimeContext } from './DreamRealtimeContext';
import type { KidooEnvResponse } from '@/api';
import { ENV_POLL_INTERVAL_MS } from '@/config/timings';

export interface DreamKidooData {
  /** Données env (température, humidité, pression) — realtime ou polling */
  envData: KidooEnvResponse | undefined;
  envIsLoading: boolean;
  envIsError: boolean;
  /** État courant du device : idle | bedtime | wakeup */
  deviceState: 'idle' | 'bedtime' | 'wakeup';
  /** PubNub connecté et abonné */
  isConnected: boolean;
}

export function useDreamKidooData(kidooId: string | undefined): DreamKidooData {
  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  // Env realtime (PubNub) — prioritaire
  const realtimeEnv = useKidooEnvRealtime(kidooId);

  // Statut connexion PubNub (avant le hook useKidooEnv pour l'utiliser dans les options)
  const { isConnected } = useDreamRealtimeContext();

  // Env polling — fallback uniquement quand PubNub non connecté ; sinon l'ESP pousse via PubNub
  const { data: pollingEnv, isLoading: envIsLoading, isError: envIsError } = useKidooEnv(kidooId, {
    enabled: !!kidooId,
    refetchInterval: isFocused && !isConnected ? ENV_POLL_INTERVAL_MS : false,
  });

  const envData = realtimeEnv ?? pollingEnv;

  // deviceState depuis l'objet kidoo (mis à jour optimistement + via PubNub)
  const { kidoos } = useKidooContext();
  const kidoo = kidoos?.find((k) => k.id === kidooId);
  const deviceState = kidoo?.deviceState ?? 'idle';

  return {
    envData,
    envIsLoading,
    envIsError,
    deviceState,
    isConnected,
  };
}
