/**
 * Contexte temps réel PubNub pour le modèle Dream.
 * Gère les messages env, info et routine spécifiques au Dream.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react';
import { usePubNub } from 'pubnub-react';
import { useKidooRealtimeBase, type RealtimeConfig } from '../KidooRealtimeContext';
import { KIDOOS_KEY } from '@/hooks';
import { queryClient } from '@/lib/queryClient';
import type { KidooEnvResponse, Kidoo } from '@/api';

type DeviceState = 'idle' | 'bedtime' | 'wakeup';

interface DreamRealtimeData {
  env: Record<string, KidooEnvResponse>;
  info: Record<string, Record<string, unknown>>;
}

interface DreamRealtimeContextValue {
  envData: Record<string, KidooEnvResponse>;
  infoData: Record<string, Record<string, unknown>>;
  getEnvData: (kidooId: string) => KidooEnvResponse | undefined;
  isConnected: boolean;
}

const DreamRealtimeContext = createContext<DreamRealtimeContextValue | null>(null);

export function useDreamRealtimeContext(): DreamRealtimeContextValue {
  const value = useContext(DreamRealtimeContext);
  if (!value) {
    throw new Error('useDreamRealtimeContext must be used within DreamRealtimeProvider');
  }
  return value;
}

export function useKidooEnvRealtime(kidooId: string | undefined): KidooEnvResponse | undefined {
  const { getEnvData } = useDreamRealtimeContext();
  return kidooId ? getEnvData(kidooId) : undefined;
}

function routineStateToDeviceState(routine: string, state: string): DeviceState {
  if (state === 'started') {
    if (routine === 'bedtime') return 'bedtime';
    if (routine === 'wakeup') return 'wakeup';
  }
  return 'idle';
}

// Composant interne — doit être rendu à l'intérieur du PubNubProvider
interface DreamRealtimeSubscriberProps {
  config: RealtimeConfig;
  onData: Dispatch<SetStateAction<DreamRealtimeData>>;
  onRoutineState: (kidooId: string, deviceState: DeviceState) => void;
  children: ReactNode;
}

function DreamRealtimeSubscriber({ config, onData, onRoutineState, children }: DreamRealtimeSubscriberProps) {
  const pubnub = usePubNub();
  const channelToKidooRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    channelToKidooRef.current = new Map(
      config.subscriptions.map((s) => [s.channel, s.kidooId])
    );
  }, [config.subscriptions]);

  useEffect(() => {
    if (!config.subscribeKey || config.subscriptions.length === 0) return;

    const channels = config.subscriptions.map((s) => s.channel);

    const handleMessage = (event: { channel?: string; message?: unknown }) => {
      const channel = event.channel;
      const msg = event.message;
      if (!channel || msg === undefined) return;

      const kidooId = channelToKidooRef.current.get(channel);
      if (!kidooId) return;

      let parsed: Record<string, unknown> | null = null;
      if (typeof msg === 'string') {
        try {
          const normalized = msg.replace(/:nan\b/g, ':null');
          parsed = JSON.parse(normalized) as Record<string, unknown>;
        } catch {
          return;
        }
      } else if (msg && typeof msg === 'object') {
        parsed = msg as Record<string, unknown>;
      }
      if (!parsed) return;

      const msgType = parsed.type as string | undefined;

      onData((prev) => {
        const next = { ...prev, env: { ...prev.env }, info: { ...prev.info } };

        if (msgType === 'env') {
          const rawPressure = parsed!.pressurePa != null ? Number(parsed!.pressurePa) : null;
          const pressurePa =
            rawPressure != null && rawPressure >= 10000 && rawPressure <= 120000
              ? rawPressure
              : null;
          next.env[kidooId] = {
            available: parsed!.available === true,
            temperatureC: parsed!.temperatureC != null ? Number(parsed!.temperatureC) : null,
            humidityPercent: parsed!.humidityPercent != null ? Number(parsed!.humidityPercent) : null,
            pressurePa,
            error: typeof parsed!.error === 'string' ? parsed!.error : undefined,
          };
        } else if (msgType === 'info') {
          next.info[kidooId] = parsed!;
        } else if (msgType === 'routine') {
          const routine = parsed!.routine as string | undefined;
          const state = parsed!.state as string | undefined;
          if (routine && state) {
            const deviceState = routineStateToDeviceState(routine, state);
            next.info[kidooId] = { ...(prev.info[kidooId] as object), deviceState };
            onRoutineState(kidooId, deviceState);
          }
        }

        return next;
      });
    };

    const listener = { message: handleMessage };

    pubnub.addListener(listener);
    pubnub.subscribe({ channels });

    return () => {
      pubnub.removeListener(listener);
      pubnub.unsubscribe({ channels });
    };
  }, [config.subscribeKey, config.subscriptions, pubnub, onData, onRoutineState]);

  return <>{children}</>;
}

interface DreamRealtimeProviderProps {
  children: ReactNode;
}

export function DreamRealtimeProvider({ children }: DreamRealtimeProviderProps) {
  const { config } = useKidooRealtimeBase();
  const [data, setData] = useState<DreamRealtimeData>({ env: {}, info: {} });

  const handleRoutineState = useCallback(
    (kidooId: string, deviceState: DeviceState) => {
      queryClient.setQueryData<Kidoo[]>(KIDOOS_KEY, (old) =>
        old?.map((k) => (k.id === kidooId ? { ...k, deviceState } : k))
      );
    },
    []
  );

  const getEnvData = useCallback(
    (kidooId: string) => data.env[kidooId],
    [data.env]
  );

  const value = useMemo<DreamRealtimeContextValue>(
    () => ({
      envData: data.env,
      infoData: data.info,
      getEnvData,
      isConnected: !!config?.subscribeKey && config.subscriptions.length > 0,
    }),
    [data, getEnvData, config]
  );

  const isReady = !!config?.subscribeKey && config.subscriptions.length > 0;

  return (
    <DreamRealtimeContext.Provider value={value}>
      {isReady ? (
        <DreamRealtimeSubscriber
          config={config!}
          onData={setData}
          onRoutineState={handleRoutineState}
        >
          {children}
        </DreamRealtimeSubscriber>
      ) : (
        children
      )}
    </DreamRealtimeContext.Provider>
  );
}
