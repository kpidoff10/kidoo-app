/**
 * Hook useNotifications
 * Gère les notifications avec react-query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { type Notification, type NotificationsResponse } from '@/shared/models/notifications';
import { apiClient } from '@/api';

export type { Notification, NotificationsResponse };

const NOTIFICATIONS_QUERY_KEY = ['notifications'];

/**
 * Helper: Obtenir le titre et message traduits basés sur le type
 */
export function getNotificationContent(
  notificationType: string,
  kidooName: string,
  t: any
): { title: string; message: string } {
  const typeConfig = t(`notifications.types.${notificationType}`, {
    returnObjects: true,
    defaultValue: null,
  });

  if (typeConfig && typeof typeConfig === 'object') {
    return {
      title: typeConfig.title,
      message: (typeConfig.message || '').replace('{{kidooName}}', kidooName),
    };
  }

  // Fallback si la clé de traduction n'existe pas
  return {
    title: 'Notification',
    message: kidooName,
  };
}

/**
 * Récupère les notifications de l'utilisateur
 */
export function useNotifications(limit = 50, offset = 0) {
  return useQuery<NotificationsResponse>({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, limit, offset],
    queryFn: async () => {
      const response = await apiClient.get('/api/users/me/notifications', {
        params: { limit, offset },
      });
      return response.data.data;
    },
  });
}

/**
 * Marquer une notification comme lue
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const response = await apiClient.patch(`/api/notifications/${id}`, { isRead });
      return response.data.data;
    },
    onSuccess: () => {
      // Invalider le cache pour recharger les notifications
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

/**
 * Supprimer une notification avec mutation optimistic
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/notifications/${id}`);
      return response.data.data;
    },
    onMutate: async (id: string) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      // Récupérer les données précédentes
      const previousData = queryClient.getQueryData<NotificationsResponse>(NOTIFICATIONS_QUERY_KEY);

      // Mettre à jour le cache de manière optimistic
      if (previousData) {
        const updatedNotifications = previousData.notifications.filter(n => n.id !== id);
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, {
          ...previousData,
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.isRead).length,
        });
      }

      // Retourner les données précédentes pour le rollback si erreur
      return { previousData };
    },
    onError: (_error, _id, context) => {
      // Restaurer les données précédentes en cas d'erreur
      if (context?.previousData) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previousData);
      }
    },
    onSuccess: () => {
      // Invalider pour recharger depuis le serveur
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

/**
 * Supprimer toutes les notifications
 */
export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete('/api/users/me/notifications');
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}
