/**
 * Custom Hook: useDreamRealtimeSubscriber
 * Encapsulates PubNub subscription logic for Dream realtime updates
 * Handles message parsing, debouncing, and state updates
 */

import { useCallback, useEffect, useRef } from 'react';
import { usePubNub } from 'pubnub-react';
import type { RealtimeConfig } from '../KidooRealtimeContext';
import type { DreamRealtimeData } from './DreamRealtimeContext';

type DeviceState = 'idle' | 'bedtime' | 'wakeup' | 'manual';

interface UseDreamRealtimeSubscriberProps {
  config: RealtimeConfig | undefined;
  onData: (updater: DreamRealtimeData | ((prev: DreamRealtimeData) => DreamRealtimeData)) => void;
  onRoutineState: (kidooId: string, deviceState: DeviceState) => void;
  onNighttimeAlertToggled?: (kidooId: string, enabled: boolean) => void;
}

const DEBOUNCE_DELAY_MS = 100; // Batch updates within 100ms

function routineStateToDeviceState(routine: string, state: string): DeviceState {
  if (state === 'started') {
    if (routine === 'bedtime') return 'bedtime';
    if (routine === 'wakeup') return 'wakeup';
  }
  if (state === 'manual' && routine === 'bedtime') return 'manual';
  return 'idle';
}

export function useDreamRealtimeSubscriber({
  config,
  onData,
  onRoutineState,
  onNighttimeAlertToggled,
}: UseDreamRealtimeSubscriberProps): void {
  const pubnub = usePubNub();
  const channelToKidooRef = useRef<Map<string, string>>(new Map());
  const pendingUpdatesRef = useRef<Array<(prev: DreamRealtimeData) => DreamRealtimeData>>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update channel-to-kidoo mapping
  useEffect(() => {
    if (!config?.subscriptions) return;
    channelToKidooRef.current = new Map(
      config.subscriptions.map((s) => [s.channel, s.kidooId])
    );
  }, [config?.subscriptions]);

  // Debounced update accumulator
  const accumulateUpdate = useCallback(
    (updater: (prev: DreamRealtimeData) => DreamRealtimeData) => {
      pendingUpdatesRef.current.push(updater);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        const updates = pendingUpdatesRef.current;
        pendingUpdatesRef.current = [];

        if (updates.length > 0) {
          onData((prev) => {
            return updates.reduce((acc, updater) => updater(acc), prev);
          });
        }
        debounceTimeoutRef.current = null;
      }, DEBOUNCE_DELAY_MS);
    },
    [onData]
  );

  // Memoized message handler
  const handleMessage = useCallback(
    (event: { channel?: string; message?: unknown }) => {
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

      accumulateUpdate((prev) => {
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
          const infoDeviceState = parsed!.deviceState as string | undefined;
          if (infoDeviceState && ['idle', 'bedtime', 'wakeup', 'manual'].includes(infoDeviceState)) {
            onRoutineState(kidooId, infoDeviceState as DeviceState);
          }
          const envObj = parsed!.env as Record<string, unknown> | undefined;
          if (envObj && envObj.available === true) {
            const rawPressure = envObj.pressurePa != null ? Number(envObj.pressurePa) : null;
            const pressurePa =
              rawPressure != null && rawPressure >= 10000 && rawPressure <= 120000
                ? rawPressure
                : null;
            next.env[kidooId] = {
              available: true,
              temperatureC: envObj.temperatureC != null ? Number(envObj.temperatureC) : null,
              humidityPercent: envObj.humidityPercent != null ? Number(envObj.humidityPercent) : null,
              pressurePa,
              error: typeof envObj.error === 'string' ? envObj.error : undefined,
            };
          }
        } else if (msgType === 'routine') {
          const routine = parsed!.routine as string | undefined;
          const state = parsed!.state as string | undefined;
          if (routine && state) {
            const deviceState = routineStateToDeviceState(routine, state);
            next.info[kidooId] = { ...(prev.info[kidooId] as object), deviceState };
            onRoutineState(kidooId, deviceState);
          }
        } else if (msgType === 'nighttime-alert-toggled') {
          const enabled = parsed!.enabled === true;
          onNighttimeAlertToggled?.(kidooId, enabled);
        }

        return next;
      });
    },
    [accumulateUpdate, onRoutineState, onNighttimeAlertToggled]
  );

  // PubNub subscription management
  useEffect(() => {
    if (!config?.subscribeKey || config.subscriptions.length === 0) return;

    const channels = config.subscriptions.map((s) => s.channel);
    const listener = { message: handleMessage };

    pubnub.addListener(listener);
    pubnub.subscribe({ channels });

    return () => {
      pubnub.removeListener(listener);
      pubnub.unsubscribe({ channels });
    };
  }, [config?.subscribeKey, config?.subscriptions, pubnub, handleMessage]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
}
