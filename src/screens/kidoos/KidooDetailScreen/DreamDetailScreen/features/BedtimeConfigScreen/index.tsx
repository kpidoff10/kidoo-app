/**
 * Bedtime Config Screen
 * Page pour configurer l'heure de coucher du modèle Dream
 */

import React, { useLayoutEffect, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { ContentScrollView, ScreenLoader } from '@/components/ui';
import { useTheme } from '@/theme';
import { useDreamBedtimeConfig, useUpdateDreamBedtimeConfig } from '@/hooks';
import {
  WeekdaySelectorSection,
  TimePickerSection,
  BrightnessSection,
  useScheduleConfigScreen,
} from '../../../../shared';
import {
  ColorOrEffectSection,
  NightlightSwitch,
  CardSection,
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
      color: '#0000FF',
      effect: 'pulse' as string | null,
      brightness: 50,
      nightlightAllNight: false,
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
      });
    }
  }, [config, isLoading, reset, initializeFromConfig]);

  // Save config with debounce
  const saveConfig = useCallback(() => {
    if (!kidooId || isInitializingRef.current || !configLoadedRef.current) return;

    debouncedSave(() => {
      const { color: formColor, effect, brightness, nightlightAllNight } = getValues();
      const color = formColor || '#FF6B6B';

      // Build weekday schedule with only activated days
      const weekdaySchedule: Record<string, { hour: number; minute: number; activated: boolean }> = {};
      Object.entries(weekdayTimesRef.current).forEach(([day, time]) => {
        if (time?.activated) {
          weekdaySchedule[day] = { hour: time.hour, minute: time.minute, activated: true };
        }
      });

      // Préparer les données : color toujours envoyée (utilisée avec ou sans effet)
      const updateData: {
        weekdaySchedule?: Record<string, { hour: number; minute: number; activated: boolean }>;
        color?: string;
        effect?: string;
        brightness: number;
        nightlightAllNight: boolean;
      } = {
        brightness,
        nightlightAllNight,
        color: color || '#0000FF',
      };

      updateData.effect = effect && effect !== 'none' ? effect : 'none';

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
          {/* Horaire */}
          <CardSection
            title={t('kidoos.dream.bedtime.schedule', { defaultValue: 'Horaire' })}
          >
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
          </CardSection>

          {/* Apparence */}
          <CardSection
            title={t('kidoos.dream.bedtime.appearance', { defaultValue: 'Apparence' })}
          >
            <ColorOrEffectSection control={control} />

            <View style={{ marginTop: 12 }}>
              <BrightnessSection control={control} i18nPrefix="kidoos.dream.bedtime" />
            </View>
          </CardSection>

          {/* Comportement */}
          <CardSection
            title={t('kidoos.dream.bedtime.behavior', { defaultValue: 'Comportement' })}
          >
            <NightlightSwitch control={control} />
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
