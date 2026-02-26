/**
 * Wakeup Config Screen
 * Page pour configurer l'heure de réveil du modèle Dream
 */

import React, { useLayoutEffect, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { ContentScrollView, Weekday, ScreenLoader } from '@/components/ui';
import { useTheme } from '@/theme';
import { useDreamWakeupConfig, useUpdateDreamWakeupConfig } from '@/hooks';
import {
  WeekdaySelectorSection,
  TimePickerSection,
  BrightnessSection,
  useScheduleConfigScreen,
} from '../shared';
import { ColorPickerSection } from './components';
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
    },
  });

  useEffect(() => {
    if (!isLoading && !configLoadedRef.current) {
      if (__DEV__) console.log('[WAKEUP-CONFIG] Initialisation:', { config, isLoading });
      isInitializingRef.current = true;
      if (config) {
        const colorHex = rgbToHex(config.colorR, config.colorG, config.colorB);
        reset({
          color: colorHex,
          brightness: config.brightness,
        });
        initializeFromConfig(config);
      } else {
        initializeFromConfig(undefined);
      }
      requestAnimationFrame(() => {
        configLoadedRef.current = true;
        isInitializingRef.current = false;
        if (__DEV__) console.log('[WAKEUP-CONFIG] Données chargées, sauvegarde activée');
      });
    }
  }, [config, isLoading, reset, initializeFromConfig]);

  // Fonction pour sauvegarder la configuration
  const saveConfig = useCallback(() => {
    // Vérifications de base
    if (!kidooId) {
      if (__DEV__) console.log('[WAKEUP-CONFIG] Sauvegarde ignorée: pas de kidooId');
      return;
    }

    if (isInitializingRef.current) {
      if (__DEV__) console.log('[WAKEUP-CONFIG] Sauvegarde ignorée: initialisation en cours');
      return;
    }

    if (!configLoadedRef.current) {
      if (__DEV__) console.log('[WAKEUP-CONFIG] Sauvegarde ignorée: config pas encore chargée');
      return;
    }

    debouncedSave(() => {
      const formValues = getValues();
      const color = formValues.color || '#FFC864';
      const brightness = formValues.brightness ?? 50;

      // Construire weekdaySchedule avec seulement les jours activés
      const weekdaySchedule: Record<string, { hour: number; minute: number; activated: boolean }> = {};
      Object.entries(weekdayTimesRef.current).forEach(([day, time]) => {
        if (time && time.activated) {
          weekdaySchedule[day] = {
            hour: time.hour,
            minute: time.minute,
            activated: true,
          };
        }
      });

      if (__DEV__) console.log('[WAKEUP-CONFIG] Sauvegarde en cours:', {
        kidooId,
        weekdaySchedule,
        color,
        brightness,
      });

      updateConfig.mutate(
        {
          id: kidooId,
          data: {
            weekdaySchedule: Object.keys(weekdaySchedule).length > 0 ? weekdaySchedule : undefined,
            color,
            brightness,
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

  // Sauvegarder automatiquement lors des changements de weekdayTimes
  useEffect(() => {
    if (!isInitializingRef.current && configLoadedRef.current) {
      if (__DEV__) console.log('[WAKEUP-CONFIG] Changement de weekdayTimes détecté:', weekdayTimes);
      saveConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekdayTimes]);

  const color = watch('color');
  const brightness = watch('brightness');
  
  useEffect(() => {
    if (!isInitializingRef.current && configLoadedRef.current) {
      if (__DEV__) console.log('[WAKEUP-CONFIG] Changement de formulaire détecté:', { color, brightness });
      saveConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, brightness]);

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ContentScrollView>
        <View style={styles.content}>
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

          <ColorPickerSection control={control} />

          <BrightnessSection control={control} i18nPrefix="kidoos.dream.wakeup" />
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
    padding: 16,
    paddingVertical: 10,
  },
});
