/**
 * Wakeup Config Screen
 * Page pour configurer l'heure de réveil du modèle Dream
 */

import React, { useLayoutEffect, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { ContentScrollView, ScreenLoader } from '@/components/ui';
import { useTheme } from '@/theme';
import { useDreamWakeupConfig, useUpdateDreamWakeupConfig } from '@/hooks';
import {
  WeekdaySelectorSection,
  TimePickerSection,
  BrightnessSection,
  useScheduleConfigScreen,
} from '../../../../shared';
import { ColorPickerSection, AutoShutdownSection, CardSection } from './components';
import { rgbToHex } from '@/utils/color';

type RouteParams = {
  kidooId: string;
};

export function WakeupConfigScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { kidooId } = (route.params as RouteParams) || {};

  const { data: config, isLoading } = useDreamWakeupConfig(kidooId);
  const updateConfig = useUpdateDreamWakeupConfig();

  const {
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
  } = useScheduleConfigScreen({ defaultHour: 7, defaultMinute: 0 });

  // Mettre à jour le titre de la page
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('kidoos.dream.wakeup.title', { defaultValue: 'Heure de réveil' }),
    });
  }, [navigation, t]);

  // Formulaire simplifié (sans Zod pour éviter les problèmes)
  const { control, reset, watch, getValues } = useForm({
    defaultValues: {
      color: '#FFC864',
      brightness: 50,
      autoShutdown: true,
      autoShutdownMinutes: 30,
    },
  });

  // Load config on mount
  useEffect(() => {
    if (!isLoading && !configLoadedRef.current) {
      isInitializingRef.current = true;
      if (config) {
        const colorHex = rgbToHex(config.colorR, config.colorG, config.colorB);
        reset({
          color: colorHex,
          brightness: config.brightness,
          autoShutdown: config.autoShutdown ?? true,
          autoShutdownMinutes: config.autoShutdownMinutes ?? 30,
        });
        initializeFromConfig(config);
      } else {
        initializeFromConfig(undefined);
      }
      requestAnimationFrame(() => {
        configLoadedRef.current = true;
        isInitializingRef.current = false;
      });
    }
  }, [config, isLoading, reset, initializeFromConfig]);

  // Save config with debounce
  const saveConfig = useCallback(() => {
    if (!kidooId || isInitializingRef.current || !configLoadedRef.current) return;

    debouncedSave(() => {
      const { color: formColor, brightness, autoShutdown, autoShutdownMinutes } = getValues();
      const color = formColor || '#FFC864';

      // Build weekday schedule with only activated days
      const weekdaySchedule: Record<string, { hour: number; minute: number; activated: boolean }> = {};
      Object.entries(weekdayTimesRef.current).forEach(([day, time]) => {
        if (time?.activated) {
          weekdaySchedule[day] = { hour: time.hour, minute: time.minute, activated: true };
        }
      });

      updateConfig.mutate(
        {
          id: kidooId,
          data: {
            weekdaySchedule: Object.keys(weekdaySchedule).length > 0 ? weekdaySchedule : undefined,
            color,
            brightness,
            autoShutdown,
            autoShutdownMinutes,
          },
        },
        {
          onSuccess: () => {
            if (__DEV__) console.log('[WAKEUP-CONFIG] Sauvegarde réussie');
          },
          onError: (error) => {
            console.error('[WAKEUP-CONFIG] Erreur de sauvegarde:', error);
          },
        },
      );
    });
  }, [kidooId, getValues, updateConfig, debouncedSave]);

  // Auto-save on weekday changes
  useEffect(() => {
    if (!isInitializingRef.current && configLoadedRef.current) {
      saveConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekdayTimes]);

  const color = watch('color');
  const brightness = watch('brightness');
  const autoShutdown = watch('autoShutdown');
  const autoShutdownMinutes = watch('autoShutdownMinutes');

  // Auto-save on form changes
  useEffect(() => {
    if (!isInitializingRef.current && configLoadedRef.current) {
      saveConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, brightness, autoShutdown, autoShutdownMinutes]);

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ContentScrollView>
        <View style={styles.content}>
          {/* Horaire */}
          <CardSection
            title={t('kidoos.dream.wakeup.schedule', { defaultValue: 'Horaire' })}
          >
            <WeekdaySelectorSection
              i18nPrefix="kidoos.dream.wakeup"
              selectedDay={selectedDayForTime}
              activeDays={activeDays}
              configuredDays={savedConfiguredDays}
              weekdayTimes={weekdayTimes}
              onDaySelect={setSelectedDayForTime}
              onSwitchChange={handleSwitchChange}
            />

            {weekdayTimes[selectedDayForTime]?.activated && (
              <TimePickerSection
                i18nPrefix="kidoos.dream.wakeup"
                selectedDay={selectedDayForTime}
                hour={weekdayTimes[selectedDayForTime]?.hour ?? 7}
                minute={weekdayTimes[selectedDayForTime]?.minute ?? 0}
                onTimeChange={(hour, minute) => handleTimeChange(selectedDayForTime, hour, minute)}
              />
            )}
          </CardSection>

          {/* Apparence */}
          <CardSection
            title={t('kidoos.dream.wakeup.appearance', { defaultValue: 'Apparence' })}
          >
            <ColorPickerSection control={control} />

            <View style={{ marginTop: 12 }}>
              <BrightnessSection control={control} i18nPrefix="kidoos.dream.wakeup" />
            </View>
          </CardSection>

          {/* Comportement */}
          <CardSection
            title={t('kidoos.dream.wakeup.behavior', { defaultValue: 'Comportement' })}
          >
            <AutoShutdownSection control={control} />
          </CardSection>
        </View>
      </ContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
