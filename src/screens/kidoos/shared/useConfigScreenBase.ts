/**
 * useConfigScreenBase Hook
 * Encapsulates common config screen logic (refs, initialization, save debounce)
 * Eliminates ~80 lines of duplicate code across Bedtime/Wakeup/DefaultColor screens
 *
 * Usage:
 * const { isReady, debouncedSave } = useConfigScreenBase({
 *   kidooId,
 *   isLoading: configIsLoading,
 * });
 *
 * // In save callback:
 * const saveConfig = useCallback(() => {
 *   if (!isReady()) return;
 *   debouncedSave(() => saveFn());
 * }, [isReady, debouncedSave]);
 */

import { useRef, useCallback, useEffect } from 'react';
import { SAVE_DEBOUNCE_MS } from '@/config/timings';

interface UseConfigScreenBaseProps {
  kidooId: string | undefined;
  isLoading: boolean;
}

interface UseConfigScreenBaseResult {
  /**
   * Check if screen is ready for saving
   * Returns true only if: not initializing, config loaded, kidooId exists
   */
  isReady: () => boolean;

  /**
   * Debounced save function
   * Prevents rapid-fire saves, ensures only latest values are saved
   */
  debouncedSave: (saveFn: () => void) => void;

  /**
   * Refs exposed for advanced usage (initialize-from-config patterns)
   */
  isInitializingRef: React.MutableRefObject<boolean>;
  configLoadedRef: React.MutableRefObject<boolean>;
}

export function useConfigScreenBase({
  kidooId,
  isLoading,
}: UseConfigScreenBaseProps): UseConfigScreenBaseResult {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);
  const configLoadedRef = useRef(false);

  /**
   * Check if config is ready for saving
   */
  const isReady = useCallback((): boolean => {
    return (
      !!kidooId &&
      !isInitializingRef.current &&
      configLoadedRef.current &&
      !isLoading
    );
  }, [kidooId, isLoading]);

  /**
   * Debounced save with configurable delay
   */
  const debouncedSave = useCallback((saveFn: () => void) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (isReady()) {
        saveFn();
      }
      saveTimeoutRef.current = null;
    }, SAVE_DEBOUNCE_MS);
  }, [isReady]);

  /**
   * Cleanup: clear timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isReady,
    debouncedSave,
    isInitializingRef,
    configLoadedRef,
  };
}
