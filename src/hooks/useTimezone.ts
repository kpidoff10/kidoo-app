import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api';
import { showToast } from '@/components/ui';

export function useUpdateTimezone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timezoneId: string) => {
      return authApi.updateTimezone(timezoneId);
    },
    onMutate: async (timezoneId: string) => {
      // Mettre en cache les données précédentes
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const previousProfile = queryClient.getQueryData(['profile']);

      // Optimistic update
      queryClient.setQueryData(['profile'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          timezoneId,
        };
      });

      return { previousProfile };
    },
    onSuccess: () => {
      // Toast de succès non nécessaire avec optimistic update
    },
    onError: (error, variables, context: any) => {
      // Restaurer les données précédentes en cas d'erreur
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }
      console.error('Erreur mise à jour timezone:', error);
      showToast.error({
        title: 'Erreur',
        message: 'Erreur lors de la mise à jour du fuseau horaire',
      });
    },
  });
}
