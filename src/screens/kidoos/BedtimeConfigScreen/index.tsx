/**
 * Bedtime Config Screen
 * Page pour configurer l'heure de coucher du modèle Dream
 */

import React, { useLayoutEffect, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { ContentScrollView, Weekday, ScreenLoader } from '@/components/ui';
import { useTheme } from '@/theme';
import { useDreamBedtimeConfig, useUpdateDreamBedtimeConfig } from '@/hooks';
import {
  WeekdaySelectorSection,
  TimePickerSection,
  BrightnessSection,
  useScheduleConfigScreen,
} from '../shared';
import {
  ColorPickerSection,
  ColorOrEffectSection,
  NightlightSwitch,
} from './components';
import { rgbToHex } from '@/utils/color';

type RouteParams = {
  kidooId: string;
};

export function BedtimeConfigScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { kidooId } = (route.params as RouteParams) || {};

  const { data: config, isLoading } = useDreamBedtimeConfig(kidooId);
  const updateConfig = useUpdateDreamBedtimeConfig();

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
  } = useScheduleConfigScreen({ defaultHour: 22, defaultMinute: 0 });

  // Mettre à jour le titre de la page
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('kidoos.dream.bedtime.title', { defaultValue: 'Heure de coucher' }),
    });
  }, [navigation, t]);

  // Formulaire simplifié (sans Zod pour éviter les problèmes)
  const { control, reset, watch, getValues } = useForm({
    defaultValues: {
      color: '#FF6B6B',
      effect: null as string | null,
      brightness: 50,
      nightlightAllNight: false,
    },
  });

  // Charger les données existantes depuis la config
  useEffect(() => {
    if (!isLoading && !configLoadedRef.current) {
      if (__DEV__) console.log('[BEDTIME-CONFIG] Initialisation:', { config, isLoading });
      isInitializingRef.current = true;
      if (config) {
        const colorHex = rgbToHex(config.colorR, config.colorG, config.colorB);
        reset({
          color: colorHex,
          effect: config.effect || null,
          brightness: config.brightness,
          nightlightAllNight: config.nightlightAllNight,
        });
        initializeFromConfig(config);
      } else {
        initializeFromConfig(undefined);
      }
      requestAnimationFrame(() => {
        configLoadedRef.current = true;
        isInitializingRef.current = false;
        if (__DEV__) console.log('[BEDTIME-CONFIG] Données chargées, sauvegarde activée');
      });
    }
  }, [config, isLoading, reset, initializeFromConfig]);

  // Fonction pour sauvegarder la configuration
  const saveConfig = useCallback(() => {
    // Vérifications de base
    if (!kidooId) {
      if (__DEV__) console.log('[BEDTIME-CONFIG] Sauvegarde ignorée: pas de kidooId');
      return;
    }

    if (isInitializingRef.current) {
      if (__DEV__) console.log('[BEDTIME-CONFIG] Sauvegarde ignorée: initialisation en cours');
      return;
    }

    if (!configLoadedRef.current) {
      if (__DEV__) console.log('[BEDTIME-CONFIG] Sauvegarde ignorée: config pas encore chargée');
      return;
    }

    debouncedSave(() => {
      const formValues = getValues();
      const color = formValues.color || '#FF6B6B';
      const effect = formValues.effect;
      const brightness = formValues.brightness ?? 50;
      const nightlightAllNight = formValues.nightlightAllNight ?? false;

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

      if (__DEV__) console.log('[BEDTIME-CONFIG] Sauvegarde en cours:', {
        kidooId,
        weekdaySchedule,
        color,
        effect,
        brightness,
        nightlightAllNight,
      });

      // Préparer les données : soit color soit effect
      const updateData: {
        weekdaySchedule?: Record<string, { hour: number; minute: number; activated: boolean }>;
        color?: string;
        effect?: string;
        brightness: number;
        nightlightAllNight: boolean;
      } = {
        brightness,
        nightlightAllNight,
      };

      if (effect && effect !== 'none') {
        // Mode effet
        updateData.effect = effect;
      } else {
        // Mode couleur fixe
        updateData.color = color;
      }

      if (Object.keys(weekdaySchedule).length > 0) {
        updateData.weekdaySchedule = weekdaySchedule;
      }

      updateConfig.mutate(
        {
          id: kidooId,
          data: updateData,
        },
        {
          onSuccess: () => {
            if (__DEV__) console.log('[BEDTIME-CONFIG] Sauvegarde réussie');
          },
          onError: (error) => {
            console.error('[BEDTIME-CONFIG] Erreur de sauvegarde:', error);
          },
        },
      );
    });
  }, [kidooId, getValues, updateConfig, debouncedSave]);

  // Sauvegarder automatiquement lors des changements de weekdayTimes
  useEffect(() => {
    if (!isInitializingRef.current && configLoadedRef.current) {
      if (__DEV__) console.log('[BEDTIME-CONFIG] Changement de weekdayTimes détecté:', weekdayTimes);
      saveConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekdayTimes]);

  // Sauvegarder automatiquement lors des changements du formulaire (couleur, effect, brightness, nightlightAllNight)
  const color = watch('color');
  const effect = watch('effect');
  const brightness = watch('brightness');
  const nightlightAllNight = watch('nightlightAllNight');
  
  useEffect(() => {
    if (!isInitializingRef.current && configLoadedRef.current) {
      if (__DEV__) console.log('[BEDTIME-CONFIG] Changement de formulaire détecté:', { color, effect, brightness, nightlightAllNight });
      saveConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, effect, brightness, nightlightAllNight]);

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ContentScrollView>
        <View style={styles.content}>
          <WeekdaySelectorSection
            i18nPrefix="kidoos.dream.bedtime"
            selectedDay={selectedDayForTime}
            activeDays={activeDays}
            configuredDays={savedConfiguredDays}
            weekdayTimes={weekdayTimes}
            onDaySelect={setSelectedDayForTime}
            onSwitchChange={handleSwitchChange}
          />

          {weekdayTimes[selectedDayForTime]?.activated && (
            <TimePickerSection
              i18nPrefix="kidoos.dream.bedtime"
              selectedDay={selectedDayForTime}
              hour={weekdayTimes[selectedDayForTime]?.hour ?? 22}
              minute={weekdayTimes[selectedDayForTime]?.minute ?? 0}
              onTimeChange={(hour, minute) => handleTimeChange(selectedDayForTime, hour, minute)}
            />
          )}

          <ColorOrEffectSection control={control} />

          <BrightnessSection control={control} i18nPrefix="kidoos.dream.bedtime" />

          <NightlightSwitch control={control} />
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
