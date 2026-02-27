/**
 * Hook usePushNotifications
 * Gère l'enregistrement du token Expo Push et les permissions
 */

import { useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { authApi, kidoosApi } from '@/api';

// Catégorie pour la notification d'alerte nocturne (bouton "J'arrive")
const NIGHTTIME_ALERT_CATEGORY = 'nighttime-alert';
const NIGHTTIME_ALERT_ACK_ACTION = 'j_arrive';

// Configuration du handler pour les notifications reçues
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
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
 * Traite une réponse de notification (tap ou bouton) pour l'alerte nocturne
 */
async function handleNighttimeAlertResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data as Record<string, unknown> | undefined;
  const kidooId = data?.kidooId as string | undefined;

  // Envoyer le signal : tap sur le bouton "J'arrive" ou tap sur la notification
  if (kidooId) {
    try {
      await kidoosApi.sendNighttimeAlertAck(kidooId);
    } catch (error) {
      console.error("[PushNotifications] Erreur envoi signal J'arrive:", error);
    }
  }
}

/**
 * Hook pour enregistrer le token push auprès du serveur quand l'utilisateur est connecté
 * et gérer les réponses aux notifications (ex: bouton "J'arrive" sur alerte nocturne)
 */
export function usePushNotifications(isAuthenticated: boolean) {
  const lastTokenRef = useRef<string | null>(null);

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
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      if (data?.type === 'nighttime-alert') {
        handleNighttimeAlertResponse(response);
      }
    });

    return () => subscription.remove();
  }, []);

  // Vérifier si l'app a été ouverte depuis une notification (cold start)
  useEffect(() => {
    if (!isAuthenticated) return;

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data as Record<string, unknown> | undefined;
        if (data?.type === 'nighttime-alert') {
          handleNighttimeAlertResponse(response);
        }
      }
    });
  }, [isAuthenticated]);

  return { registerToken, unregisterToken };
}
