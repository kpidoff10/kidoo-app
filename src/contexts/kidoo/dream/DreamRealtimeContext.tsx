/**
 * Contexte temps réel PubNub pour le modèle Dream.
 * Gère env, info, routine. nighttime-alert : ESP32 → PubNub → webhook serveur → Expo → notification native (pas d'app).
 */

import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react';
import { useKidooRealtimeBase, type RealtimeConfig } from '../KidooRealtimeContext';
import { KIDOOS_KEY } from '@/hooks';
import { DREAM_NIGHTTIME_ALERT_KEY } from '@/hooks/kidoo/useDreamNighttimeAlert';
import { queryClient } from '@/lib/queryClient';
import { useDreamRealtimeSubscriber } from './useDreamRealtimeSubscriber';
import type { KidooEnvResponse, Kidoo } from '@/api';

type DeviceState = 'idle' | 'bedtime' | 'wakeup' | 'manual';

export interface DreamRealtimeData {
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

// Composant interne — doit être rendu à l'intérieur du PubNubProvider
interface DreamRealtimeSubscriberProps {
  config: RealtimeConfig;
  onData: Dispatch<SetStateAction<DreamRealtimeData>>;
  onRoutineState: (kidooId: string, deviceState: DeviceState) => void;
  onNighttimeAlertToggled?: (kidooId: string, enabled: boolean) => void;
  children: ReactNode;
}

function DreamRealtimeSubscriber({ config, onData, onRoutineState, onNighttimeAlertToggled, children }: DreamRealtimeSubscriberProps) {
  // Use custom hook to handle all PubNub subscription logic
  useDreamRealtimeSubscriber({
    config,
    onData,
    onRoutineState,
    onNighttimeAlertToggled,
  });

  return <>{children}</>;
}

// Memoize subscriber to prevent unnecessary rerenders and double subscriptions
const MemoizedDreamRealtimeSubscriber = React.memo(DreamRealtimeSubscriber);

interface DreamRealtimeProviderProps {
  children: ReactNode;
}

export function DreamRealtimeProvider({ children }: DreamRealtimeProviderProps) {
  const { config } = useKidooRealtimeBase();
  // Use ref for data to prevent provider rerenders when messages arrive
  // Only state changes trigger Context updates (config/connection status)
  const dataRef = useRef<DreamRealtimeData>({ env: {}, info: {} });
  const [, forceUpdateToken] = useState({});

  const handleRoutineState = useCallback(
    (kidooId: string, deviceState: DeviceState) => {
      if (__DEV__) console.log('[DreamRealtimeContext] handleRoutineState deviceState:', deviceState, 'kidooId:', kidooId);
      queryClient.setQueryData<Kidoo[]>(KIDOOS_KEY, (old) => {
        if (!old) return old;
        return old.map((k) => (k.id === kidooId ? { ...k, deviceState } : k));
      });
    },
    []
  );

  const handleNighttimeAlertToggled = useCallback((kidooId: string, enabled: boolean) => {
    queryClient.setQueryData([...DREAM_NIGHTTIME_ALERT_KEY, kidooId], {
      nighttimeAlertEnabled: enabled,
    });
  }, []);

  // Update ref when data changes (via debounced accumulator)
  const setData = useCallback((updater: DreamRealtimeData | ((prev: DreamRealtimeData) => DreamRealtimeData)) => {
    dataRef.current = typeof updater === 'function' ? updater(dataRef.current) : updater;
    // Minimal update to trigger context refresh without cascading rerenders
    forceUpdateToken({});
  }, []);

  const getEnvData = useCallback(
    (kidooId: string) => dataRef.current.env[kidooId],
    []
  );

  const value = useMemo<DreamRealtimeContextValue>(
    () => ({
      envData: dataRef.current.env,
      infoData: dataRef.current.info,
      getEnvData,
      isConnected: !!config?.subscribeKey && config.subscriptions.length > 0,
    }),
    [config, getEnvData]
  );

  // Memoize children to prevent unnecessary rerenders of consumers
  const memoizedChildren = useMemo(() => children, [children]);

  const isReady = !!config?.subscribeKey && config.subscriptions.length > 0;

  return (
    <DreamRealtimeContext.Provider value={value}>
      {isReady ? (
        <MemoizedDreamRealtimeSubscriber
          config={config!}
          onData={setData}
          onRoutineState={handleRoutineState}
          onNighttimeAlertToggled={handleNighttimeAlertToggled}
        >
          {memoizedChildren}
        </MemoizedDreamRealtimeSubscriber>
      ) : (
        memoizedChildren
      )}
    </DreamRealtimeContext.Provider>
  );
}
