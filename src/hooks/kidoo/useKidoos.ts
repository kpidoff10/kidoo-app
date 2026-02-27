/**
 * Hooks de lecture : liste des Kidoos et Kidoo par ID
 * Préserve deviceState du cache lors des refetch (PubNub temps réel).
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { kidoosApi } from '@/api';
import type { Kidoo } from '@/api';
import { KIDOOS_KEY } from './keys';

export function useKidoos() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: KIDOOS_KEY,
    queryFn: async () => {
      const fresh = await kidoosApi.getAll();
      const prev = queryClient.getQueryData<Kidoo[]>(KIDOOS_KEY);
      if (prev) {
        return fresh.map((k) => {
          const p = prev.find((x) => x.id === k.id);
          return {
            ...k,
            deviceState: k.deviceState ?? p?.deviceState ?? 'idle',
          };
        });
      }
      return fresh;
    },
  });
}

export function useKidoo(id: string) {
  return useQuery({
    queryKey: [...KIDOOS_KEY, id],
    queryFn: () => kidoosApi.getById(id),
    enabled: !!id,
  });
}
