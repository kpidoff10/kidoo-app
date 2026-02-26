/**
 * Hook partagé pour la logique schedule (jours + heures) des écrans Bedtime/Wakeup.
 * Gère weekdayTimes, selectedDayForTime, savedConfiguredDays, handlers.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Weekday } from '@/components/ui';
import { SAVE_DEBOUNCE_MS } from '@/config/timings';

export type WeekdaySchedule = Partial<
  Record<Weekday, { hour: number; minute: number; activated: boolean }>
>;

export interface UseScheduleConfigScreenOptions {
  defaultHour: number;
  defaultMinute: number;
}

export function useScheduleConfigScreen({ defaultHour, defaultMinute }: UseScheduleConfigScreenOptions) {
  const [selectedDayForTime, setSelectedDayForTime] = useState<Weekday>('monday');
  const [weekdayTimes, setWeekdayTimes] = useState<WeekdaySchedule>({});
  const [savedConfiguredDays, setSavedConfiguredDays] = useState<Weekday[]>([]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);
  const configLoadedRef = useRef(false);
  const weekdayTimesRef = useRef<WeekdaySchedule>({});

  const handleSwitchChange = useCallback(
    (day: Weekday, activated: boolean) => {
      setWeekdayTimes((prev) => {
        const currentTime = prev[day];
        if (activated) {
          if (!currentTime) {
            return { ...prev, [day]: { hour: defaultHour, minute: defaultMinute, activated: true } };
          }
          return { ...prev, [day]: { ...currentTime, activated: true } };
        }
        if (currentTime) {
          return { ...prev, [day]: { ...currentTime, activated: false } };
        }
        return prev;
      });
    },
    [defaultHour, defaultMinute]
  );

  const handleTimeChange = useCallback((day: Weekday, hour: number, minute: number) => {
    setWeekdayTimes((prev) => ({
      ...prev,
      [day]: {
        hour,
        minute,
        activated: prev[day]?.activated ?? true,
      },
    }));
  }, []);

  const activeDays = Object.entries(weekdayTimes)
    .filter(([_, time]) => time?.activated === true)
    .map(([day]) => day as Weekday);

  useEffect(() => {
    weekdayTimesRef.current = weekdayTimes;
  }, [weekdayTimes]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const initializeFromConfig = useCallback((config: { weekdaySchedule?: WeekdaySchedule } | undefined) => {
    if (config?.weekdaySchedule) {
      setWeekdayTimes(config.weekdaySchedule);
      weekdayTimesRef.current = config.weekdaySchedule;
      const configuredDays = Object.entries(config.weekdaySchedule)
        .filter(([_, time]) => time.activated)
        .map(([day]) => day as Weekday);
      setSavedConfiguredDays(configuredDays);
    } else {
      weekdayTimesRef.current = {};
    }
  }, []);

  const debouncedSave = useCallback(
    (saveFn: () => void) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveFn();
        saveTimeoutRef.current = null;
      }, SAVE_DEBOUNCE_MS);
    },
    []
  );

  return {
    selectedDayForTime,
    setSelectedDayForTime,
    weekdayTimes,
    weekdayTimesRef,
    savedConfiguredDays,
    activeDays,
    handleSwitchChange,
    handleTimeChange,
    initializeFromConfig,
    debouncedSave,
    isInitializingRef,
    configLoadedRef,
  };
}
