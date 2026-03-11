/**
 * Hook pour vérifier si un Kidoo est en ligne (mise à jour cache isConnected, deviceState, env).
 * Quand PubNub est connecté, deviceState n'est pas mis à jour (évite d'écraser le temps réel).
 * Les données env retournées par check-online sont mises à jour dans le contexte Dream.
 *
 * Cache: Les résultats sont cachés pendant 60s - pas de nouvel appel API si dernière requête < 60s.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useCallback } from 'react';
import { kidoosApi, Kidoo, type KidooEnvResponse } from '@/api';
import { showToast } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { queryClient } from '@/lib/queryClient';
import type { DreamRealtimeData } from '@/contexts/kidoo/dream/DreamRealtimeContext';
import { KIDOOS_KEY } from './keys';

const CACHE_DURATION_MS = 60 * 1000; // 60 secondes

export type CheckOnlineVariables =
  | string
  | { id: string; skipDeviceStateUpdate?: boolean; forceRefresh?: boolean };

interface CacheEntry {
  timestamp: number;
  data: { isOnline: boolean; reason?: string; deviceState?: 'idle' | 'bedtime' | 'wakeup' | 'manual'; env?: KidooEnvResponse };
}

function resolveVariables(v: CheckOnlineVariables): { id: string; skipDeviceStateUpdate: boolean; forceRefresh: boolean } {
  if (typeof v === 'string') return { id: v, skipDeviceStateUpdate: false, forceRefresh: false };
  return {
    id: v.id,
    skipDeviceStateUpdate: v.skipDeviceStateUpdate ?? false,
    forceRefresh: v.forceRefresh ?? false
  };
}

export function useKidooCheckOnline() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  const isCacheFresh = useCallback((kidooId: string): boolean => {
    const entry = cacheRef.current.get(kidooId);
    if (!entry) return false;
    const elapsed = Date.now() - entry.timestamp;
    const isFresh = elapsed < CACHE_DURATION_MS;
    if (__DEV__ && isFresh) {
      console.log('[useKidooCheckOnline] Cache hit:', kidooId, `(${elapsed}ms ago)`);
    }
    return isFresh;
  }, []);

  const getCachedData = useCallback((kidooId: string) => {
    return cacheRef.current.get(kidooId)?.data;
  }, []);

  return useMutation({
    mutationFn: async (variables: CheckOnlineVariables) => {
      const { id, forceRefresh } = resolveVariables(variables);

      // Vérifier le cache avant de faire la requête (sauf si forceRefresh)
      if (!forceRefresh && isCacheFresh(id)) {
        const cachedData = getCachedData(id);
        if (cachedData) {
          if (__DEV__) {
            console.log('[useKidooCheckOnline] Returning cached data for:', id);
          }
          // Merger avec les données env fraîches du contexte Dream (via PubNub temps réel)
          const DREAM_ENV_KEY = ['dream', 'env', id] as const;
          const freshEnvFromContext = queryClient.getQueryData<KidooEnvResponse>(DREAM_ENV_KEY);
          const mergedData = freshEnvFromContext
            ? { ...cachedData, env: freshEnvFromContext }
            : cachedData;
          if (__DEV__ && freshEnvFromContext) {
            console.log('[useKidooCheckOnline] Merged cache with fresh env from PubNub for:', id);
          }
          return mergedData;
        }
      }

      if (__DEV__ && forceRefresh) {
        console.log('[useKidooCheckOnline] Force refresh requested for:', id);
      }

      // Cache miss ou expiré → faire la requête
      const data = await kidoosApi.checkOnline(id);

      // Enregistrer en cache
      cacheRef.current.set(id, { timestamp: Date.now(), data });
      if (__DEV__) {
        console.log('[useKidooCheckOnline] Cached response for:', id);
      }

      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: KIDOOS_KEY });
      return { previousKidoos: queryClient.getQueryData<Kidoo[]>(KIDOOS_KEY) };
    },
    onSuccess: (data, variables) => {
      const { id, skipDeviceStateUpdate } = resolveVariables(variables);
      queryClient.setQueryData<Kidoo[]>(KIDOOS_KEY, (old) =>
        old?.map((k) => {
          if (k.id !== id) return k;
          // Ne pas écraser "manual" par "idle" : course critique possible (get-info reçu avant start-bedtime)
          const shouldUpdateDeviceState =
            !skipDeviceStateUpdate &&
            data.deviceState !== undefined &&
            !(k.deviceState === 'manual' && data.deviceState === 'idle');
          if (__DEV__ && shouldUpdateDeviceState) {
            console.log('[useKidooCheckOnline] setQueryData deviceState:', data.deviceState, 'kidooId:', id, 'skipDeviceStateUpdate:', skipDeviceStateUpdate);
          }
          return {
            ...k,
            isConnected: data.isOnline,
            lastConnected: data.isOnline ? new Date().toISOString() : k.lastConnected,
            ...(shouldUpdateDeviceState && { deviceState: data.deviceState }),
          };
        })
      );

      // Mettre à jour le contexte Dream avec les données env
      // Si check-online retourne env, utilise ça. Sinon, utilise les données fraîches du contexte (PubNub)
      let envToUpdate = data.env;
      if (!envToUpdate) {
        // Si pas d'env dans la réponse (timeout), merger avec les données fraîches du contexte
        const DREAM_ENV_KEY = ['dream', 'env', id] as const;
        const freshEnvFromContext = queryClient.getQueryData<KidooEnvResponse>(DREAM_ENV_KEY);
        envToUpdate = freshEnvFromContext;
        if (__DEV__ && freshEnvFromContext) {
          console.log('[useKidooCheckOnline] check-online timeout: using fresh env from PubNub for kidooId:', id);
        }
      }

      if (envToUpdate) {
        // Mettre à jour via queryClient (le DreamRealtimeProvider utilise aussi queryClient)
        const DREAM_ENV_KEY = ['dream', 'env', id] as const;
        queryClient.setQueryData(DREAM_ENV_KEY, envToUpdate);
        if (__DEV__) {
          console.log('[useKidooCheckOnline] Updated env data for kidooId:', id, envToUpdate);
        }
      }
    },
    onError: (_err, _id, context) => {
      if (context?.previousKidoos) {
        queryClient.setQueryData(KIDOOS_KEY, context.previousKidoos);
      }
      showToast.error({
        title: t('toast.error'),
        message: t('errors.generic'),
      });
    },
  });
}
