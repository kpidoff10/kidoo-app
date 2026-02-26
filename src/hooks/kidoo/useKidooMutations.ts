/**
 * Mutations CRUD Kidoo : create, update, updateName, delete, brightness
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kidoosApi, Kidoo, CreateKidooRequest, UpdateKidooRequest } from '@/api';
import { showToast } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { KIDOOS_KEY } from './keys';

export function useCreateKidoo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateKidooRequest) => kidoosApi.create(data),
    onSuccess: (newKidoo) => {
      queryClient.setQueryData<Kidoo[]>(KIDOOS_KEY, (old) =>
        old ? [...old, newKidoo] : [newKidoo]
      );
    },
    onError: () => {
      showToast.error({
        title: t('toast.error'),
        message: t('errors.generic'),
      });
    },
  });
}

export function useUpdateKidoo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKidooRequest }) =>
      kidoosApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: KIDOOS_KEY });
      const previousKidoos = queryClient.getQueryData<Kidoo[]>(KIDOOS_KEY);
      queryClient.setQueryData<Kidoo[]>(KIDOOS_KEY, (old) =>
        old?.map((k) => (k.id === id ? { ...k, ...data } : k))
      );
      return { previousKidoos };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousKidoos) {
        queryClient.setQueryData(KIDOOS_KEY, context.previousKidoos);
      }
      showToast.error({
        title: t('toast.error'),
        message: t('errors.generic'),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KIDOOS_KEY });
    },
    onSuccess: () => {
      showToast.success({
        title: t('toast.success'),
        message: t('toast.updated'),
      });
    },
  });
}

export function useUpdateKidooName() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      kidoosApi.updateName(id, name),
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: KIDOOS_KEY });
      const previousKidoos = queryClient.getQueryData<Kidoo[]>(KIDOOS_KEY);
      queryClient.setQueryData<Kidoo[]>(KIDOOS_KEY, (old) =>
        old?.map((k) => (k.id === id ? { ...k, name } : k))
      );
      return { previousKidoos };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousKidoos) {
        queryClient.setQueryData(KIDOOS_KEY, context.previousKidoos);
      }
      showToast.error({
        title: t('toast.error'),
        message: t('errors.generic'),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KIDOOS_KEY });
    },
  });
}

export function useDeleteKidoo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => kidoosApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KIDOOS_KEY });
      const previousKidoos = queryClient.getQueryData<Kidoo[]>(KIDOOS_KEY);
      queryClient.setQueryData<Kidoo[]>(KIDOOS_KEY, (old) =>
        old?.filter((k) => k.id !== id)
      );
      return { previousKidoos };
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KIDOOS_KEY });
    },
    onSuccess: () => {
      showToast.success({
        title: t('toast.success'),
        message: t('toast.deleted'),
      });
    },
  });
}

export function useUpdateBrightness() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, brightness }: { id: string; brightness: number }) =>
      kidoosApi.updateBrightness(id, brightness),
    onError: () => {
      showToast.error({
        title: t('toast.error'),
        message: t('errors.generic'),
      });
    },
  });
}
