/**
 * Hook pour l'alerte réveil nocturne (Dream)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kidoosApi } from '@/api';
import { KIDOOS_KEY } from './keys';

export const DREAM_NIGHTTIME_ALERT_KEY = [...KIDOOS_KEY, 'dream-nighttime-alert'] as const;

export function useDreamNighttimeAlert(kidooId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...DREAM_NIGHTTIME_ALERT_KEY, kidooId],
    queryFn: () => kidoosApi.getDreamNighttimeAlert(kidooId!),
    enabled: !!kidooId,
  });

  const mutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      kidoosApi.updateDreamNighttimeAlert(id, enabled),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        [...DREAM_NIGHTTIME_ALERT_KEY, variables.id],
        { nighttimeAlertEnabled: variables.enabled }
      );
    },
  });

  return {
    nighttimeAlertEnabled: query.data?.nighttimeAlertEnabled ?? false,
    isLoading: query.isLoading,
    updateNighttimeAlert: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
