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
    if (!pubnub || !kidoos?.length) return;

    // Subscribe a todos os channels dos devices
    const channels = kidoos.map((k) => `kidoo-${k.id}`);
    if (channels.length === 0) return;

    pubnub.subscribe({
      channels,
    });

    // Handler para mensagens de status
    const messageListener = {
      message: (msg: any) => {
        const { channel, message } = msg;

        // Extrair kidooId do channel (format: kidoo-{id})
        const kidooIdMatch = channel.match(/^kidoo-(.+)$/);
        if (!kidooIdMatch) return;

        const kidooId = kidooIdMatch[1];

        // Processar mensagens de status
        if (message?.type === 'status') {
          if (message.status === 'online') {
            if (__DEV__) console.log(`[REALTIME] Kidoo ${kidooId} online`);

            // Atualizar o cache React Query com status online
            queryClient.setQueryData(
              KIDOOS_KEY,
              (oldData: any[] | undefined) => {
                if (!Array.isArray(oldData)) return oldData;
                return oldData.map((kidoo) =>
                  kidoo.id === kidooId
                    ? {
                        ...kidoo,
                        isConnected: true,
                        lastConnected: new Date().toISOString(),
                      }
                    : kidoo
                );
              }
            );
          } else if (message.status === 'offline') {
            if (__DEV__) console.log(`[REALTIME] Kidoo ${kidooId} offline`);

            // Atualizar o cache com status offline
            queryClient.setQueryData(
              KIDOOS_KEY,
              (oldData: any[] | undefined) => {
                if (!Array.isArray(oldData)) return oldData;
                return oldData.map((kidoo) =>
                  kidoo.id === kidooId
                    ? { ...kidoo, isConnected: false }
                    : kidoo
                );
              }
            );
          }
        }
      },
    };

    pubnub.addListener(messageListener);

    // Cleanup
    return () => {
      pubnub.removeListener(messageListener);
      pubnub.unsubscribe({ channels });
    };
  }, [pubnub, kidoos, queryClient]);
}
