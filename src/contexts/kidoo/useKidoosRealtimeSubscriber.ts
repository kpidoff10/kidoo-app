/**
 * Hook para subscrever a eventos tempo real de todos os Kidoos na lista
 * Atualiza o cache React Query quando um device fica online/offline
 */

import { useEffect } from 'react';
import { usePubNub } from 'pubnub-react';
import { useQueryClient } from '@tanstack/react-query';
import { useKidooContext } from './KidooContext';
import { KIDOOS_KEY } from '@/hooks';

export function useKidoosRealtimeSubscriber() {
  const pubnub = usePubNub();
  const { kidoos } = useKidooContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('[REALTIME] Hook lancé', { pubnub: !!pubnub, kidoosCount: kidoos?.length });

    if (!pubnub || !kidoos?.length) {
      console.log('[REALTIME] Abonnement ignoré - PubNub ou kidoos vides');
      return;
    }

    // S'abonner à tous les canals des devices (basé sur l'adresse MAC, pas l'UUID)
    const channels = kidoos
      .filter((k) => k.macAddress)
      .map((k) => `kidoo-${k.macAddress?.replace(/:/g, '')}`);
    console.log('[REALTIME] Abonnement aux canals:', channels);

    if (channels.length === 0) {
      console.log('[REALTIME] Aucun canal à abonner');
      return;
    }

    pubnub.subscribe({
      channels,
    });
    console.log('[REALTIME] ✓ Abonné aux canals');

    // Handler pour les messages de statut
    const messageListener = {
      message: (msg: any) => {
        console.log('[REALTIME] Message reçu:', { channel: msg.channel, message: msg.message });

        const { channel, message } = msg;

        // Extraire kidooId du canal (format: kidoo-{id})
        const kidooIdMatch = channel.match(/^kidoo-(.+)$/);
        if (!kidooIdMatch) {
          console.log('[REALTIME] Format de canal invalide:', channel);
          return;
        }

        const kidooId = kidooIdMatch[1];
        console.log('[REALTIME] Traitement message pour Kidoo:', kidooId);

        // Traiter les messages de statut (ESP32 envoie {"status":"online"})
        if (message?.status) {
          console.log(`[REALTIME] Message de statut reçu: ${message.status}`);

          if (message.status === 'online') {
            console.log(`[REALTIME] ✓ Kidoo ${kidooId} CONNECTÉ - mise à jour cache`);

            // Mettre à jour le cache React Query avec statut en ligne
            console.log('[REALTIME] Clé cache utilisée:', KIDOOS_KEY);
            queryClient.setQueryData(
              KIDOOS_KEY,
              (oldData: any[] | undefined) => {
                console.log('[REALTIME] oldData reçue:', {
                  isArray: Array.isArray(oldData),
                  length: oldData?.length,
                  kidoos: oldData?.map((k: any) => ({ id: k.id, isConnected: k.isConnected }))
                });
                if (!Array.isArray(oldData)) {
                  console.log('[REALTIME] ⚠️ oldData pas un array, ignoré');
                  return oldData;
                }
                const updated = oldData.map((kidoo) =>
                  kidoo.macAddress?.replace(/:/g, '') === kidooId
                    ? {
                        ...kidoo,
                        isConnected: true,
                        lastConnected: new Date().toISOString(),
                      }
                    : kidoo
                );
                console.log('[REALTIME] ✓ Cache mis à jour (en ligne):', JSON.stringify(updated));
                return updated;
              }
            );
          } else if (message.status === 'offline') {
            console.log(`[REALTIME] ✓ Kidoo ${kidooId} DÉCONNECTÉ - mise à jour cache`);

            // Mettre à jour le cache avec statut hors ligne
            queryClient.setQueryData(
              KIDOOS_KEY,
              (oldData: any[] | undefined) => {
                console.log('[REALTIME] oldData reçue (offline):', {
                  isArray: Array.isArray(oldData),
                  length: oldData?.length,
                  kidoos: oldData?.map((k: any) => ({ id: k.id, isConnected: k.isConnected }))
                });
                if (!Array.isArray(oldData)) {
                  console.log('[REALTIME] ⚠️ oldData pas un array, ignoré');
                  return oldData;
                }
                const updated = oldData.map((kidoo) =>
                  kidoo.macAddress?.replace(/:/g, '') === kidooId
                    ? { ...kidoo, isConnected: false }
                    : kidoo
                );
                console.log('[REALTIME] ✓ Cache mis à jour (hors ligne):', JSON.stringify(updated));
                return updated;
              }
            );
          }
        } else {
          console.log('[REALTIME] Message sans champ statut:', JSON.stringify(message));
        }
      },
    };

    console.log('[REALTIME] Ajout listener');
    pubnub.addListener(messageListener);

    // Nettoyage
    return () => {
      console.log('[REALTIME] Suppression abonnement');
      pubnub.removeListener(messageListener);
      pubnub.unsubscribe({ channels });
    };
  }, [pubnub, kidoos, queryClient]);
}
