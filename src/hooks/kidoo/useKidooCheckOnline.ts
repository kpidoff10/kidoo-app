/**
 * Hook pour vérifier si un Kidoo est en ligne (mise à jour cache isConnected, deviceState, env).
 * Quand PubNub est connecté, deviceState n'est pas mis à jour (évite d'écraser le temps réel).
 * Les données env retournées par check-online sont mises à jour dans le contexte Dream.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kidoosApi, Kidoo } from '@/api';
import { showToast } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { queryClient } from '@/lib/queryClient';
import type { DreamRealtimeData } from '@/contexts/kidoo/dream/DreamRealtimeContext';
import { KIDOOS_KEY } from './keys';

export type CheckOnlineVariables =
  | string
  | { id: string; skipDeviceStateUpdate?: boolean };

function resolveVariables(v: CheckOnlineVariables): { id: string; skipDeviceStateUpdate: boolean } {
  if (typeof v === 'string') return { id: v, skipDeviceStateUpdate: false };
  return { id: v.id, skipDeviceStateUpdate: v.skipDeviceStateUpdate ?? false };
}

export function useKidooCheckOnline() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (variables: CheckOnlineVariables) =>
      kidoosApi.checkOnline(resolveVariables(variables).id),
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

      // Mettre à jour le contexte Dream avec les données env si présentes
      if (data.env) {
        // Mettre à jour via queryClient (le DreamRealtimeProvider utilise aussi queryClient)
        const DREAM_ENV_KEY = ['dream', 'env', id] as const;
        queryClient.setQueryData(DREAM_ENV_KEY, data.env);
        if (__DEV__) {
          console.log('[useKidooCheckOnline] Updated env data for kidooId:', id, data.env);
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
