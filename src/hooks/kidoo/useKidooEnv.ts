/**
 * Hook pour récupérer les données env (température, humidité, pression).
 * À utiliser lorsque le modèle supporte la feature 'env' (ex. Dream avec capteur).
 */

import { useQuery } from '@tanstack/react-query';
import { kidoosApi } from '@/api';
import { KIDOOS_KEY } from './keys';

export function useKidooEnv(
  kidooId: string | undefined,
  options?: { enabled?: boolean; refetchInterval?: number | false }
) {
  const enabled = options?.enabled !== false && !!kidooId;
  const refetchInterval = options?.refetchInterval;
  return useQuery({
    queryKey: [...KIDOOS_KEY, kidooId, 'env'],
    queryFn: async () => {
      if (__DEV__) console.log('[useKidooEnv] fetch getEnv', kidooId);
      return kidoosApi.getEnv(kidooId!);
    },
    enabled,
    staleTime: 60 * 1000, // 1 min
    refetchInterval: refetchInterval ?? false,
  });
}
