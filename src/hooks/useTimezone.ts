import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api';
import { showToast } from '@/components/ui';

export function useUpdateTimezone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timezoneId: string) => {
      return authApi.updateTimezone(timezoneId);
    },
    onSuccess: (data) => {
      // Invalider le cache du profil
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showToast.success({
        title: 'Succès',
        message: 'Fuseau horaire mis à jour',
      });
    },
    onError: (error) => {
      console.error('Erreur mise à jour timezone:', error);
      showToast.error({
        title: 'Erreur',
        message: 'Erreur lors de la mise à jour du fuseau horaire',
      });
    },
  });
}
