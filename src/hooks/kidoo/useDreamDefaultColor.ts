/**
 * Hook pour la configuration de couleur/effet par défaut (Dream)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kidoosApi } from '@/api';
import { KIDOOS_KEY } from './keys';

export const DREAM_DEFAULT_COLOR_KEY = [...KIDOOS_KEY, 'dream-default-color'] as const;

export function useDreamDefaultColor(kidooId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...DREAM_DEFAULT_COLOR_KEY, kidooId],
    queryFn: () => kidoosApi.getDreamDefaultColor(kidooId!),
    enabled: !!kidooId,
  });

  const mutation = useMutation({
    mutationFn: ({
      colorR,
      colorG,
      colorB,
      brightness,
      effect,
    }: {
      colorR?: number;
      colorG?: number;
      colorB?: number;
      brightness?: number;
      effect?: string | null;
    }) => kidoosApi.updateDreamDefaultColor(kidooId!, { colorR, colorG, colorB, brightness, effect }),
    // Update optimistic: mettre à jour immédiatement avant l'appel API
    onMutate: (variables) => {
      // Sauvegarder l'ancienne valeur pour rollback en cas d'erreur
      const previousData = queryClient.getQueryData([...DREAM_DEFAULT_COLOR_KEY, kidooId]);

      // Mettre à jour le cache immédiatement avec les nouvelles valeurs
      const currentData = previousData as any;
      queryClient.setQueryData([...DREAM_DEFAULT_COLOR_KEY, kidooId], {
        colorR: variables.colorR ?? currentData?.colorR ?? 255,
        colorG: variables.colorG ?? currentData?.colorG ?? 0,
        colorB: variables.colorB ?? currentData?.colorB ?? 0,
        brightness: variables.brightness ?? currentData?.brightness ?? 50,
        effect: variables.effect !== undefined ? variables.effect : currentData?.effect ?? null,
      });

      return { previousData };
    },
    // Si succès, les données sont déjà à jour (de onMutate)
    onSuccess: (_, variables) => {
      queryClient.setQueryData([...DREAM_DEFAULT_COLOR_KEY, kidooId], {
        colorR: variables.colorR,
        colorG: variables.colorG,
        colorB: variables.colorB,
        brightness: variables.brightness,
        effect: variables.effect,
      });
    },
    // Si erreur, restaurer l'ancienne valeur
    onError: (_, variables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData([...DREAM_DEFAULT_COLOR_KEY, kidooId], context.previousData);
      }
    },
  });

  return {
    colorR: query.data?.colorR ?? 255,
    colorG: query.data?.colorG ?? 0,
    colorB: query.data?.colorB ?? 0,
    brightness: query.data?.brightness ?? 50,
    effect: query.data?.effect ?? null,
    isLoading: query.isLoading,
    updateDefaultColor: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
