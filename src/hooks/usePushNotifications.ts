/**
 * Hook usePushNotifications
 * Gère l'enregistrement du token Expo Push et les permissions
 */

import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, kidoosApi, apiClient } from '@/api';

// Catégorie pour la notification d'alerte nocturne (bouton "J'arrive")
const NIGHTTIME_ALERT_CATEGORY = 'nighttime-alert';
const NIGHTTIME_ALERT_ACK_ACTION = 'j_arrive';
const PENDING_ALERT_STORAGE_KEY = '@nighttime_alert_pending';

// Fonctions pour persister l'alerte en AsyncStorage
async function savePendingAlertToStorage(kidooId: string, kidooName: string, notificationId?: string) {
  try {
    const alert = { kidooId, kidooName, receivedAt: Date.now(), notificationId };
    await AsyncStorage.setItem(PENDING_ALERT_STORAGE_KEY, JSON.stringify(alert));
    console.log('[PushNotifications] Alerte sauvegardée dans AsyncStorage:', alert);
  } catch (error) {
    console.error('[PushNotifications] Erreur sauvegarde AsyncStorage:', error);
  }
}

async function loadPendingAlertFromStorage() {
  try {
    const stored = await AsyncStorage.getItem(PENDING_ALERT_STORAGE_KEY);
    if (stored) {
      const alert = JSON.parse(stored);
      console.log('[PushNotifications] Alerte chargée depuis AsyncStorage:', alert);
      return alert;
    }
  } catch (error) {
    console.error('[PushNotifications] Erreur chargement AsyncStorage:', error);
  }
  return null;
}

async function clearPendingAlertFromStorage() {
  try {
    await AsyncStorage.removeItem(PENDING_ALERT_STORAGE_KEY);
    console.log('[PushNotifications] Alerte supprimée de AsyncStorage');
  } catch (error) {
    console.error('[PushNotifications] Erreur suppression AsyncStorage:', error);
  }
}

// Configuration du handler pour les notifications reçues
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Listener pour quand une notification arrive (même en background)
// Permet de sauvegarder l'alerte sans attendre que l'utilisateur la clique
Notifications.addNotificationReceivedListener((notification) => {
  const data = notification.request.content.data as Record<string, unknown> | undefined;
  if (data?.type === 'nighttime-alert') {
    const kidooId = data?.kidooId as string | undefined;
    const kidooName = data?.kidooName as string | undefined;
    const notificationId = notification.request.identifier;
    if (kidooId && kidooName) {
      console.log('[PushNotifications] Notification nighttime-alert reçue - sauvegarde AsyncStorage');
      savePendingAlertToStorage(kidooId, kidooName, notificationId);
    }
  }
});

/**
 * Configure les catégories et canaux de notification (à appeler au démarrage)
 */
async function setupNotificationCategories() {
  // Catégorie alerte nocturne avec bouton "J'arrive"
  await Notifications.setNotificationCategoryAsync(NIGHTTIME_ALERT_CATEGORY, [
    {
      identifier: NIGHTTIME_ALERT_ACK_ACTION,
      buttonTitle: "J'arrive",
      options: { opensAppToForeground: false },
    },
  ]);
}

/**
 * Enregistre le device pour les push notifications et retourne le token Expo
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    if (finalStatus !== 'granted') {
      return null;
    }
  }

  // Configurer les catégories (boutons d'action)
  await setupNotificationCategories();

  // Android : configurer les canaux de notification
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    await Notifications.setNotificationChannelAsync('nighttime-alert', {
      name: 'Alerte veilleuse',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenData.data;
}

/**
 * Valide une alerte nocturne pour Feature 2
 * Retourne true SEULEMENT si:
 * 1. L'alerte a moins de 2 minutes
 * 2. La notification correspondante est non-lue en base de données
 */
async function validateNighttimeAlert(alert: {
  kidooId: string;
  kidooName: string;
  receivedAt: number;
  notificationId?: string;
}): Promise<boolean> {
  try {
    // Vérifier l'âge: moins de 2 minutes (120000 ms)
    const ageMs = Date.now() - alert.receivedAt;
    if (ageMs > 2 * 60 * 1000) {
      console.log('[PushNotifications] Alerte expirée (âge:', ageMs, 'ms)');
      return false;
    }
    console.log('[PushNotifications] Alerte valide en âge (', ageMs, 'ms)');

    // Vérifier que la notification est non-lue en base de données
    const response = await apiClient.get('/api/users/me/notifications', {
      params: { limit: 10, offset: 0 },
    });
    const notificationsData = response.data.data;
    if (!notificationsData || !notificationsData.notifications) {
      console.warn('[PushNotifications] Impossible de récupérer les notifications');
      return false;
    }

    // Chercher la notification nighttime-alert la plus récente pour ce kidoo
    const notification = notificationsData.notifications.find(
      (n: any) => n.type === 'nighttime-alert' && n.kidooId === alert.kidooId && !n.isRead
    );

    if (notification) {
      console.log('[PushNotifications] Notification non-lue trouvée:', notification.id);
      return true;
    }

    console.log('[PushNotifications] Aucune notification non-lue trouvée pour ce kidoo');
    return false;
  } catch (error) {
    console.error('[PushNotifications] Erreur validation alerte:', error);
    // En cas d'erreur, on ne montre pas le bottomSheet pour plus de sécurité
    return false;
  }
}

/**
 * Traite une réponse de notification (tap ou bouton) pour l'alerte nocturne
 * - Si action "j_arrive": appel API direct sans bottomSheet
 * - Sinon: sauvegarde dans AsyncStorage pour que le bottomSheet la propose
 */
async function handleNighttimeAlertResponse(
  response: Notifications.NotificationResponse,
  storePendingAlert: any,
  queryClient?: any
) {
  const data = response.notification.request.content.data as Record<string, unknown> | undefined;
  const kidooId = data?.kidooId as string | undefined;
  const kidooName = data?.kidooName as string | undefined;
  const notificationId = response.notification.request.identifier;
  const actionIdentifier = response.actionIdentifier;

  console.log('[PushNotifications] Réponse notification:', { kidooId, kidooName, actionIdentifier, notificationId });

  // Si l'utilisateur a cliqué sur le bouton "J'arrive" de la notification
  if (actionIdentifier === NIGHTTIME_ALERT_ACK_ACTION && kidooId) {
    console.log('[PushNotifications] Action "j_arrive" - appel API direct');
    try {
      await kidoosApi.sendNighttimeAlertAck(kidooId);
      // Dismisser la notification
      if (notificationId) {
        await Notifications.dismissNotificationAsync(notificationId);
      }
      // Refetch les notifications pour mettre à jour le badge
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    } catch (error) {
      console.error('[PushNotifications] Erreur envoi direct:', error);
    }
  } else if (kidooId && kidooName) {
    // Sinon (tap sur la notification elle-même), sauvegarder pour le bottomSheet
    console.log('[PushNotifications] Tap sur notification - sauvegarde AsyncStorage pour bottomSheet');
    await savePendingAlertToStorage(kidooId, kidooName, notificationId);
    // Stocker aussi dans le contexte
    if (storePendingAlert) {
      storePendingAlert({
        kidooId,
        kidooName,
        notificationId,
        receivedAt: Date.now(),
      });
    }
  } else {
    console.warn('[PushNotifications] Données incomplètes');
  }
}

/**
 * Hook pour enregistrer le token push auprès du serveur quand l'utilisateur est connecté
 * et gérer les réponses aux notifications (ex: bouton "J'arrive" sur alerte nocturne)
 */
export function usePushNotifications(isAuthenticated: boolean, storePendingAlert?: (alert: any) => void) {
  const lastTokenRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

  const registerToken = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = await registerForPushNotificationsAsync();
      if (token && token !== lastTokenRef.current) {
        await authApi.registerPushToken(token);
        lastTokenRef.current = token;
      }
    } catch (error) {
      console.error('Erreur enregistrement push token:', error);
    }
  }, [isAuthenticated]);

  const unregisterToken = useCallback(async () => {
    if (lastTokenRef.current) {
      try {
        await authApi.unregisterPushToken(lastTokenRef.current);
      } catch (error) {
        console.error('Erreur suppression push token:', error);
      } finally {
        lastTokenRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      registerToken();
    } else {
      unregisterToken();
    }
  }, [isAuthenticated, registerToken, unregisterToken]);

  // Listener pour les réponses aux notifications (tap ou bouton)
  useEffect(() => {
    console.log('[PushNotifications] Installation du listener des notifications');
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      console.log('[PushNotifications] Notification reçue:', { type: data?.type, data });
      if (data?.type === 'nighttime-alert' && storePendingAlert) {
        console.log('[PushNotifications] Type nighttime-alert détecté, appel handleNighttimeAlertResponse');
        handleNighttimeAlertResponse(response, storePendingAlert, queryClient);
      } else {
        console.log('[PushNotifications] Type non nighttime-alert ou pas de storePendingAlert');
      }
    });

    return () => {
      console.log('[PushNotifications] Suppression du listener');
      subscription.remove();
    };
  }, [storePendingAlert, queryClient]);

  // Listener AppState pour refetch les notifications quand l'app reprend le focus
  // Cela permet de récupérer les notifications reçues en background
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('[PushNotifications] Installation du listener AppState');
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('[PushNotifications] App reprend le focus - refetch des notifications');
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    });

    return () => {
      console.log('[PushNotifications] Suppression du listener AppState');
      subscription.remove();
    };
  }, [isAuthenticated, queryClient]);

  // Vérifier si l'app a été ouverte depuis une notification (cold start)
  // NOTE: Pour les alertes nocturnes, on ne répond pas automatiquement.
  // L'ouverture de l'app avec une alerte est maintenant gérée par un context
  // qui affiche une bottom sheet de confirmation au lieu d'envoyer automatiquement.
  // Feature 2: Auto-afficher le bottomSheet SEULEMENT si alerte < 2 minutes ET non-lue
  useEffect(() => {
    console.log('[PushNotifications] Cold start useEffect - isAuthenticated:', isAuthenticated, 'storePendingAlert:', !!storePendingAlert);
    if (!isAuthenticated || !storePendingAlert) return;

    const loadAlert = async () => {
      console.log('[PushNotifications] loadAlert() lancé');
      try {
        // Chercher d'abord dans AsyncStorage (si app ouverte sans taper notification)
        const storedAlert = await loadPendingAlertFromStorage();
        console.log('[PushNotifications] Résultat loadPendingAlertFromStorage:', storedAlert);
        if (storedAlert) {
          // Feature 2: Valider l'alerte (moins de 2 minutes + non-lue)
          const isValid = await validateNighttimeAlert(storedAlert);
          if (isValid) {
            console.log('[PushNotifications] Alerte valide - chargement depuis AsyncStorage');
            storePendingAlert(storedAlert);
          } else {
            console.log('[PushNotifications] Alerte expirée ou lue - suppression');
            await clearPendingAlertFromStorage();
          }
          return;
        }

        // Sinon vérifier getLastNotificationResponseAsync (si app ouverte en tapant notification)
        const response = await Notifications.getLastNotificationResponseAsync();
        console.log('[PushNotifications] Résultat getLastNotificationResponseAsync:', response);
        if (response) {
          const data = response.notification.request.content.data as Record<string, unknown> | undefined;
          // Stocker les alertes nocturnes pour la bottom sheet
          if (data?.type === 'nighttime-alert') {
            const kidooId = data?.kidooId as string | undefined;
            const kidooName = data?.kidooName as string | undefined;
            if (kidooId && kidooName) {
              const alert = {
                kidooId,
                kidooName,
                receivedAt: Date.now(),
              };
              // Feature 2: Valider l'alerte
              const isValid = await validateNighttimeAlert(alert);
              if (isValid) {
                console.log('[PushNotifications] Alerte valide - chargement depuis getLastNotificationResponseAsync');
                storePendingAlert(alert);
                // Sauvegarder aussi pour la prochaine fois
                await savePendingAlertToStorage(kidooId, kidooName);
              } else {
                console.log('[PushNotifications] Alerte expirée ou lue - non affichée');
              }
            }
            return;
          }
        }
        console.log('[PushNotifications] Aucune alerte trouvée au démarrage');
      } catch (error) {
        console.error('[PushNotifications] Erreur loadAlert:', error);
      }
    };

    loadAlert();
  }, [isAuthenticated, storePendingAlert]);

  return { registerToken, unregisterToken };
}
