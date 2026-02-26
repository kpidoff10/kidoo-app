/**
 * Hooks Dream : config réveil, mise à jour, test
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kidoosApi } from '@/api';
import { showToast } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { KIDOOS_KEY } from './keys';
import { hexToRgb } from '@/utils/color';

export function useDreamWakeupConfig(kidooId: string) {
  return useQuery({
    queryKey: [...KIDOOS_KEY, kidooId, 'dream-wakeup-config'],
    queryFn: () => kidoosApi.getDreamWakeupConfig(kidooId),
    enabled: !!kidooId,
  });
}

export function useTestDreamWakeup() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      id,
      action,
      params,
    }: {
      id: string;
      action: 'start' | 'stop';
      params?: { hour?: number; minute?: number; color?: string; brightness?: number };
    }) => kidoosApi.testDreamWakeup(id, action, params),
    onError: () => {
      showToast.error({ title: t('toast.error'), message: t('errors.generic') });
    },
  });
}

export function useUpdateDreamWakeupConfig() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        weekdaySchedule?: Record<string, { hour: number; minute: number }>;
        color: string;
        brightness: number;
      };
    }) => kidoosApi.updateDreamWakeupConfig(id, data),
    onMutate: async ({ id, data }) => {
      const queryKey = [...KIDOOS_KEY, id, 'dream-wakeup-config'];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      const rgb = hexToRgb(data.color) ?? { r: 0, g: 0, b: 0 };
      const optimisticData: Record<string, unknown> = {
        colorR: rgb.r,
        colorG: rgb.g,
        colorB: rgb.b,
        brightness: data.brightness,
      };
      if (data.weekdaySchedule) optimisticData.weekdaySchedule = data.weekdaySchedule;
      queryClient.setQueryData(queryKey, optimisticData);
      return { previousData };
    },
    onError: (_error, variables, context) => {
      const queryKey = [...KIDOOS_KEY, variables.id, 'dream-wakeup-config'];
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      showToast.error({ title: t('toast.error'), message: t('errors.generic') });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...KIDOOS_KEY, variables.id, 'dream-wakeup-config'],
      });
    },
  });
}
