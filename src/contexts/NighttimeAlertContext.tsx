/**
 * Context pour gérer les alertes nocturnes reçues
 * Stocke l'alerte reçue et affiche une bottom sheet pour confirmation
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_ALERT_STORAGE_KEY = '@nighttime_alert_pending';

export interface NighttimeAlert {
  kidooId: string;
  kidooName: string;
  receivedAt: number; // timestamp en ms
  notificationId?: string; // ID Expo pour dismisser la notification
  dbNotificationId?: string; // ID de la notification en DB pour la marquer comme lue
}

interface NighttimeAlertContextType {
  pendingAlert: NighttimeAlert | null;
  storePendingAlert: (alert: NighttimeAlert) => void;
  clearPendingAlert: () => void;
  isAlertExpired: (alert: NighttimeAlert) => boolean;
}

const NighttimeAlertContext = createContext<NighttimeAlertContextType | undefined>(undefined);

export function NighttimeAlertProvider({ children }: { children: React.ReactNode }) {
  const [pendingAlert, setPendingAlert] = useState<NighttimeAlert | null>(null);

  const storePendingAlert = useCallback((alert: NighttimeAlert) => {
    console.log('[NighttimeAlertContext] storePendingAlert appelé:', alert);
    setPendingAlert(alert);
  }, []);

  const clearPendingAlert = useCallback(() => {
    setPendingAlert(null);
  }, []);

  // Alerte expire après 5 minutes (300000 ms)
  const isAlertExpired = useCallback((alert: NighttimeAlert): boolean => {
    const now = Date.now();
    const ageMs = now - alert.receivedAt;
    return ageMs > 5 * 60 * 1000; // 5 minutes
  }, []);

  // Auto-clear si l'alerte expire
  useEffect(() => {
    if (pendingAlert && isAlertExpired(pendingAlert)) {
      clearPendingAlert();
    }
  }, [pendingAlert, isAlertExpired, clearPendingAlert]);

  // Nettoyer AsyncStorage quand l'alerte est clairée
  useEffect(() => {
    if (!pendingAlert) {
      AsyncStorage.removeItem(PENDING_ALERT_STORAGE_KEY).catch((error) => {
        console.error('[NighttimeAlertContext] Erreur suppression AsyncStorage:', error);
      });
    }
  }, [pendingAlert]);

  return (
    <NighttimeAlertContext.Provider
      value={{
        pendingAlert,
        storePendingAlert,
        clearPendingAlert,
        isAlertExpired,
      }}
    >
      {children}
    </NighttimeAlertContext.Provider>
  );
}

export function useNighttimeAlert() {
  const context = useContext(NighttimeAlertContext);
  if (!context) {
    throw new Error('useNighttimeAlert must be used within NighttimeAlertProvider');
  }
  return context;
}
