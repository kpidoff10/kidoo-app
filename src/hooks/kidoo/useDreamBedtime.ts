/**
 * Hooks Dream : config coucher, mise à jour, contrôle manuel, test
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kidoosApi, type Kidoo } from '@/api';
import { showToast } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { KIDOOS_KEY } from './keys';
import { useKidooCheckOnline } from './useKidooCheckOnline';
import { hexToRgb } from '@/utils/color';

export function useDreamBedtimeConfig(kidooId: string) {
  return useQuery({
    queryKey: [...KIDOOS_KEY, kidooId, 'dream-bedtime-config'],
    queryFn: () => kidoosApi.getDreamBedtimeConfig(kidooId),
    enabled: !!kidooId,
  });
}

export function useControlDreamBedtime() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const checkOnline = useKidooCheckOnline();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'start' | 'stop' }) =>
      kidoosApi.controlDreamBedtime(id, action),
    onError: () => {
      showToast.error({ title: t('toast.error'), message: t('errors.generic') });
    },
    onSuccess: (_data, variables) => {
      // Mise à jour optimiste du deviceState (évite d'attendre PubNub ou checkOnline)
      const deviceState = variables.action === 'start' ? 'bedtime' : 'idle';
      queryClient.setQueryData<Kidoo[]>(KIDOOS_KEY, (old) =>
        old?.map((k) =>
          k.id === variables.id ? { ...k, deviceState } : k
        )
      );
      showToast.success({
        title: t('toast.success'),
        message:
          variables.action === 'start'
            ? t('kidoos.dream.bedtime.started', { defaultValue: 'Routine démarrée' })
            : t('kidoos.dream.bedtime.stopped', { defaultValue: 'Routine arrêtée' }),
      });
      // Au stop : checkOnline confirme immédiatement 'idle'.
      // Au start : checkOnline avec délai pour que l'appareil ait le temps de passer en bedtime
      // (l'API peut renvoyer 'idle' si appelée trop tôt).
      if (variables.action === 'stop') {
        checkOnline.mutate(variables.id);
      } else {
        setTimeout(() => checkOnline.mutate(variables.id), CHECK_ONLINE_AFTER_START_MS);
      }
    },
  });
}

export function useStopDreamRoutine() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const checkOnline = useKidooCheckOnline();

  return useMutation({
    mutationFn: (id: string) => kidoosApi.stopDreamRoutine(id),
    onError: () => {
      showToast.error({ title: t('toast.error'), message: t('errors.generic') });
    },
    onSuccess: (_data, id) => {
      // Mise à jour optimiste du deviceState
      queryClient.setQueryData<Kidoo[]>(KIDOOS_KEY, (old) =>
        old?.map((k) =>
          k.id === id ? { ...k, deviceState: 'idle' as const } : k
        )
      );
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
        const rgb = hexToRgb(data.color) ?? { r: 0, g: 0, b: 0 };
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
