/**
 * Hooks Dream : config coucher, mise à jour, contrôle manuel, test
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kidoosApi } from '@/api';
import { showToast } from '@/components/ui/Toast';
import { useTranslation } from 'react-i18next';
import { KIDOOS_KEY } from './keys';
import { useKidooCheckOnline } from './useKidooCheckOnline';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 255, g: 107, b: 107 };
}

export function useDreamBedtimeConfig(kidooId: string) {
  return useQuery({
    queryKey: [...KIDOOS_KEY, kidooId, 'dream-bedtime-config'],
    queryFn: () => kidoosApi.getDreamBedtimeConfig(kidooId),
    enabled: !!kidooId,
  });
}

export function useControlDreamBedtime() {
  const { t } = useTranslation();
  const checkOnline = useKidooCheckOnline();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'start' | 'stop' }) =>
      kidoosApi.controlDreamBedtime(id, action),
    onError: () => {
      showToast.error({ title: t('toast.error'), message: t('errors.generic') });
    },
    onSuccess: (_data, variables) => {
      showToast.success({
        title: t('toast.success'),
        message:
          variables.action === 'start'
            ? t('kidoos.dream.bedtime.started', { defaultValue: 'Routine démarrée' })
            : t('kidoos.dream.bedtime.stopped', { defaultValue: 'Routine arrêtée' }),
      });
      checkOnline.mutate(variables.id);
    },
  });
}

export function useStopDreamRoutine() {
  const { t } = useTranslation();
  const checkOnline = useKidooCheckOnline();

  return useMutation({
    mutationFn: (id: string) => kidoosApi.stopDreamRoutine(id),
    onError: () => {
      showToast.error({ title: t('toast.error'), message: t('errors.generic') });
    },
    onSuccess: (_data, id) => {
      showToast.success({
        title: t('toast.success'),
        message: t('kidoos.dream.routine.stopped', { defaultValue: 'Routine arrêtée' }),
      });
      checkOnline.mutate(id);
    },
  });
}

export function useTestDreamBedtime() {
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
    }) => kidoosApi.testDreamBedtime(id, action, params),
    onError: () => {
      showToast.error({ title: t('toast.error'), message: t('errors.generic') });
    },
  });
}

export function useUpdateDreamBedtimeConfig() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        weekdaySchedule?: Record<string, { hour: number; minute: number; activated: boolean }>;
        color?: string;
        effect?: string;
        brightness: number;
        nightlightAllNight: boolean;
      };
    }) => kidoosApi.updateDreamBedtimeConfig(id, data),
    onMutate: async ({ id, data }) => {
      const queryKey = [...KIDOOS_KEY, id, 'dream-bedtime-config'];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      const optimisticData: Record<string, unknown> = {
        brightness: data.brightness,
        nightlightAllNight: data.nightlightAllNight,
      };
      if (data.color) {
        const rgb = hexToRgb(data.color);
        optimisticData.colorR = rgb.r;
        optimisticData.colorG = rgb.g;
        optimisticData.colorB = rgb.b;
      }
      if (data.effect) optimisticData.effect = data.effect === 'none' ? null : data.effect;
      if (data.weekdaySchedule) optimisticData.weekdaySchedule = data.weekdaySchedule;
      queryClient.setQueryData(queryKey, optimisticData);
      return { previousData };
    },
    onError: (_error, variables, context) => {
      const queryKey = [...KIDOOS_KEY, variables.id, 'dream-bedtime-config'];
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      showToast.error({ title: t('toast.error'), message: t('errors.generic') });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...KIDOOS_KEY, variables.id, 'dream-bedtime-config'],
      });
    },
  });
}
