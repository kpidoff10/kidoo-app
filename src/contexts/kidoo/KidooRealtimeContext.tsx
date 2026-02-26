/**
 * Base PubNub realtime context.
 * Gère uniquement la connexion PubNub et la config des channels.
 * Les contextes par modèle (Dream, etc.) s'appuient sur ce provider.
 */

import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from 'react';
import PubNub from 'pubnub';
import { PubNubProvider } from 'pubnub-react';
import { useQuery } from '@tanstack/react-query';
import { kidoosApi } from '@/api';
import { useKidooContext } from './KidooContext';

const REALTIME_CONFIG_KEY = ['kidoos', 'realtime-config'];

export type RealtimeConfig = {
  subscribeKey: string;
  subscriptions: { channel: string; kidooId: string }[];
};

interface KidooRealtimeBaseContextValue {
  config: RealtimeConfig | undefined;
  isLoading: boolean;
}

const KidooRealtimeBaseContext = createContext<KidooRealtimeBaseContextValue>({
  config: undefined,
  isLoading: false,
});

export function useKidooRealtimeBase(): KidooRealtimeBaseContextValue {
  return useContext(KidooRealtimeBaseContext);
}

interface KidooRealtimeProviderProps {
  children: ReactNode;
}

export function KidooRealtimeProvider({ children }: KidooRealtimeProviderProps) {
  const { kidoos } = useKidooContext();
  const hasKidoosWithMac = kidoos?.some((k) => k.macAddress) ?? false;

  const { data: config, isLoading } = useQuery({
    queryKey: REALTIME_CONFIG_KEY,
    queryFn: kidoosApi.getRealtimeConfig,
    staleTime: 5 * 60 * 1000,
    enabled: hasKidoosWithMac,
  });

  const pubnub = useMemo(
    () =>
      config?.subscribeKey
        ? new PubNub({ subscribeKey: config.subscribeKey, uuid: `kidoo-app-${Date.now()}` })
        : null,
    [config?.subscribeKey]
  );

  const contextValue = useMemo<KidooRealtimeBaseContextValue>(
    () => ({ config, isLoading }),
    [config, isLoading]
  );

  if (!pubnub || !config?.subscribeKey || !config.subscriptions.length) {
    return (
      <KidooRealtimeBaseContext.Provider value={contextValue}>
        {children}
      </KidooRealtimeBaseContext.Provider>
    );
  }

  return (
    <KidooRealtimeBaseContext.Provider value={contextValue}>
      <PubNubProvider client={pubnub}>
        {children}
      </PubNubProvider>
    </KidooRealtimeBaseContext.Provider>
  );
}
