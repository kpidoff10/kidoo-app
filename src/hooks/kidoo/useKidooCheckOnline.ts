/**
 * Hook pour vérifier si un Kidoo est en ligne (mise à jour cache isConnected, deviceState)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kidoosApi, Kidoo } from '@/api';
import { showToast } from '@/components/ui/Toast';
import { useTranslation } from 'react-i18next';
import { KIDOOS_KEY } from './keys';

export function useKidooCheckOnline() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => kidoosApi.checkOnline(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: KIDOOS_KEY });
      return { previousKidoos: queryClient.getQueryData<Kidoo[]>(KIDOOS_KEY) };
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData<Kidoo[]>(KIDOOS_KEY, (old) =>
        old?.map((k) =>
          k.id === id
            ? {
                ...k,
                isConnected: data.isOnline,
                lastConnected: data.isOnline ? new Date().toISOString() : k.lastConnected,
                ...(data.deviceState !== undefined && { deviceState: data.deviceState }),
              }
            : k
        )
      );
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
