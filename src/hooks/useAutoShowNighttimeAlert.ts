/**
 * Hook pour afficher automatiquement le bottomsheet nighttime-alert
 * Écoute les notifications et affiche le sheet si:
 * 1. Une notification nighttime-alert non-lue est trouvée
 * 2. Elle date de moins de 2 minutes
 */

import { useEffect } from 'react';
import { useNotifications } from './useNotifications';
import { useNighttimeAlert } from '@/contexts/NighttimeAlertContext';

export function useAutoShowNighttimeAlert() {
  const { data: notificationsData } = useNotifications(50, 0);
  const { storePendingAlert } = useNighttimeAlert();

  useEffect(() => {
    if (!notificationsData?.notifications || notificationsData.notifications.length === 0) {
      return;
    }

    // Chercher une notification nighttime-alert non-lue
    const nighttimeAlert = notificationsData.notifications.find(
      (n) => n.type === 'nighttime-alert' && !n.isRead && n.kidoo
    );

    if (!nighttimeAlert) {
      console.log('[AutoShowNighttimeAlert] Aucune alerte nighttime-alert non-lue trouvée');
      return;
    }

    // Vérifier l'âge: moins de 2 minutes (120000 ms)
    const ageMs = Date.now() - new Date(nighttimeAlert.createdAt).getTime();
    if (ageMs > 2 * 60 * 1000) {
      console.log('[AutoShowNighttimeAlert] Alerte expirée (âge:', ageMs, 'ms)');
      return;
    }

    console.log('[AutoShowNighttimeAlert] Affichage du bottomsheet pour alerte valide:', nighttimeAlert.id);
    storePendingAlert({
      kidooId: nighttimeAlert.kidooId!,
      kidooName: nighttimeAlert.kidoo?.name || 'Kidoo',
      receivedAt: new Date(nighttimeAlert.createdAt).getTime(),
      notificationId: nighttimeAlert.id,
      dbNotificationId: nighttimeAlert.id,
    });
  }, [notificationsData, storePendingAlert]);
}
