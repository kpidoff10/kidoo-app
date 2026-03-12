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
    console.log('[REALTIME] Hook iniciado', { pubnub: !!pubnub, kidoosCount: kidoos?.length });

    if (!pubnub || !kidoos?.length) {
      console.log('[REALTIME] Pulando subscription - PubNub ou kidoos vazios');
      return;
    }

    // Subscribe a todos os channels dos devices
    const channels = kidoos.map((k) => `kidoo-${k.id}`);
    console.log('[REALTIME] Subscrevendo aos canais:', channels);

    if (channels.length === 0) {
      console.log('[REALTIME] Nenhum canal para subscrever');
      return;
    }

    pubnub.subscribe({
      channels,
    });
    console.log('[REALTIME] ✓ Subscrito aos canais');

    // Handler para mensagens de status
    const messageListener = {
      message: (msg: any) => {
        console.log('[REALTIME] Mensagem recebida:', { channel: msg.channel, message: msg.message });

        const { channel, message } = msg;

        // Extrair kidooId do channel (format: kidoo-{id})
        const kidooIdMatch = channel.match(/^kidoo-(.+)$/);
        if (!kidooIdMatch) {
          console.log('[REALTIME] Formato de canal inválido:', channel);
          return;
        }

        const kidooId = kidooIdMatch[1];
        console.log('[REALTIME] Processando mensagem para Kidoo:', kidooId);

        // Processar mensagens de status (ESP32 envia {"status":"online"})
        if (message?.status) {
          console.log(`[REALTIME] Mensagem de status recebida: ${message.status}`);

          if (message.status === 'online') {
            console.log(`[REALTIME] ✓ Kidoo ${kidooId} ONLINE - atualizando cache`);

            // Atualizar o cache React Query com status online
            queryClient.setQueryData(
              KIDOOS_KEY,
              (oldData: any[] | undefined) => {
                if (!Array.isArray(oldData)) {
                  console.log('[REALTIME] Cache vazio, ignorando');
                  return oldData;
                }
                const updated = oldData.map((kidoo) =>
                  kidoo.id === kidooId
                    ? {
                        ...kidoo,
                        isConnected: true,
                        lastConnected: new Date().toISOString(),
                      }
                    : kidoo
                );
                console.log('[REALTIME] ✓ Cache atualizado com online');
                return updated;
              }
            );
          } else if (message.status === 'offline') {
            console.log(`[REALTIME] ✓ Kidoo ${kidooId} OFFLINE - atualizando cache`);

            // Atualizar o cache com status offline
            queryClient.setQueryData(
              KIDOOS_KEY,
              (oldData: any[] | undefined) => {
                if (!Array.isArray(oldData)) {
                  console.log('[REALTIME] Cache vazio, ignorando');
                  return oldData;
                }
                const updated = oldData.map((kidoo) =>
                  kidoo.id === kidooId
                    ? { ...kidoo, isConnected: false }
                    : kidoo
                );
                console.log('[REALTIME] ✓ Cache atualizado com offline');
                return updated;
              }
            );
          }
        } else {
          console.log('[REALTIME] Mensagem sem campo status:', JSON.stringify(message));
        }
      },
    };

    console.log('[REALTIME] Adicionando listener');
    pubnub.addListener(messageListener);

    // Cleanup
    return () => {
      console.log('[REALTIME] Limpando subscription');
      pubnub.removeListener(messageListener);
      pubnub.unsubscribe({ channels });
    };
  }, [pubnub, kidoos, queryClient]);
}
