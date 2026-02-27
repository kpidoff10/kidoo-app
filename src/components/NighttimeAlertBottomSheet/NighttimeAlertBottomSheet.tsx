/**
 * Bottom sheet pour confirmer l'alerte nocturne du kidoo
 * Demande si l'utilisateur veut notifier le kidoo qu'il arrive
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import * as Notifications from 'expo-notifications';
import { BottomSheet } from '@/components/ui/BottomSheet/BottomSheet';
import { useNighttimeAlert } from '@/contexts/NighttimeAlertContext';
import { useBottomSheet, useMarkNotificationAsRead } from '@/hooks';
import { kidoosApi } from '@/api';
import { useTheme } from '@/theme';

export function NighttimeAlertBottomSheet() {
  const { pendingAlert, clearPendingAlert, isAlertExpired } = useNighttimeAlert();
  const bottomSheet = useBottomSheet();
  const { spacing, colors } = useTheme();
  const markAsRead = useMarkNotificationAsRead();
  const [loading, setLoading] = useState(false);
  const isProcessingRef = useRef(false);

  // Ouvrir le sheet automatiquement quand une alerte est reçue
  useEffect(() => {
    if (pendingAlert && !isAlertExpired(pendingAlert)) {
      console.log('[NighttimeAlertBottomSheet] Ouverture du sheet pour alerte:', pendingAlert);
      // Vérifier que le sheet n'est pas déjà ouvert avant d'appeler open()
      if (!bottomSheet.isOpen()) {
        bottomSheet.open();
      }
    } else {
      console.log('[NighttimeAlertBottomSheet] Fermeture du sheet');
      if (bottomSheet.isOpen()) {
        bottomSheet.close();
      }
    }
  }, [pendingAlert, bottomSheet]);

  // Réinitialiser le loading quand une nouvelle alerte arrive
  useEffect(() => {
    setLoading(false);
  }, [pendingAlert?.kidooId]);

  const handleRespond = async () => {
    // Eviter les appels multiples
    if (isProcessingRef.current || loading) {
      console.log('[NighttimeAlertBottomSheet] Opération déjà en cours, appel ignoré');
      return;
    }

    isProcessingRef.current = true;
    setLoading(true);
    try {
      console.log('[NighttimeAlertBottomSheet] Envoi réponse pour:', pendingAlert.kidooId);
      await kidoosApi.sendNighttimeAlertAck(pendingAlert.kidooId);

      // Marquer la notification comme lue en base de données
      if (pendingAlert?.dbNotificationId) {
        console.log('[NighttimeAlertBottomSheet] Marquage notification comme lue:', pendingAlert.dbNotificationId);
        await markAsRead.mutateAsync({ id: pendingAlert.dbNotificationId, isRead: true });
      }

      // Dismisser la notification du centre de notifications du téléphone
      if (pendingAlert.notificationId) {
        await Notifications.dismissNotificationAsync(pendingAlert.notificationId);
      }

      clearPendingAlert();
      await bottomSheet.close();
    } catch (error) {
      console.error('[NighttimeAlert] Erreur envoi réponse:', error);
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  const handleDismiss = async () => {
    // Eviter les appels multiples
    if (isProcessingRef.current || loading) {
      console.log('[NighttimeAlertBottomSheet] Opération déjà en cours, appel ignoré');
      return;
    }

    isProcessingRef.current = true;
    setLoading(true);
    try {
      // Marquer la notification comme lue en base de données
      if (pendingAlert?.dbNotificationId) {
        console.log('[NighttimeAlertBottomSheet] Marquage notification comme lue:', pendingAlert.dbNotificationId);
        await markAsRead.mutateAsync({ id: pendingAlert.dbNotificationId, isRead: true });
      }
    } catch (error) {
      console.error('[NighttimeAlertBottomSheet] Erreur marquage notification:', error);
    } finally {
      clearPendingAlert();
      await bottomSheet.close();
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  // Toujours rendre le BottomSheet (il gère son propre state via open/close)
  return (
    <BottomSheet
      ref={bottomSheet.ref}
      name={bottomSheet.id}
      detents={['auto']}
      onDismiss={bottomSheet.handleDidDismiss}
    >
      {pendingAlert && !isAlertExpired(pendingAlert) && (
        <>
          {/* Header avec icône et titre */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🌙</Text>
            </View>
            <Text style={styles.title}>Alerte nocturne</Text>
          </View>

          {/* Ligne de séparation */}
          <View style={styles.divider} />

          {/* Message */}
          <View style={styles.contentSection}>
            <Text style={styles.kidooName}>{pendingAlert.kidooName}</Text>
            <Text style={styles.message}>vous a envoyé une alerte</Text>
            <Text style={styles.subMessage}>
              Voulez-vous notifier {pendingAlert.kidooName} que vous arrivez ?
            </Text>
          </View>

          {/* Boutons en bas */}
          <View style={[styles.buttonsContainer, { marginTop: spacing[6] }]}>
            <Pressable
              style={({ pressed }) => [
                styles.buttonIgnorer,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleDismiss}
              disabled={loading}
            >
              <Text style={styles.buttonIgnorerText}>Ignorer</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.buttonArrive,
                pressed && styles.buttonArrivePressedState,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleRespond}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonArriveText}>J'arrive</Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  contentSection: {
    marginBottom: 8,
  },
  kidooName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 12,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonIgnorer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIgnorerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  buttonArrive: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonArriveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonArrivePressedState: {
    backgroundColor: '#1976D2',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
