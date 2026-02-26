/**
 * WeekdaySelectorSection - Composant partagé Bedtime/Wakeup
 * Section avec le sélecteur de jour et le switch pour activer/désactiver
 */

import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WeekdaySelector, Weekday, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export type ScheduleI18nPrefix = 'kidoos.dream.bedtime' | 'kidoos.dream.wakeup';

interface WeekdaySelectorSectionProps {
  i18nPrefix: ScheduleI18nPrefix;
  selectedDay: Weekday;
  activeDays: Weekday[];
  configuredDays: Weekday[];
  weekdayTimes: Partial<Record<Weekday, { hour: number; minute: number; activated: boolean }>>;
  onDaySelect: (day: Weekday) => void;
  onSwitchChange: (day: Weekday, activated: boolean) => void;
}

export function WeekdaySelectorSection({
  i18nPrefix,
  selectedDay,
  activeDays,
  configuredDays,
  weekdayTimes,
  onDaySelect,
  onSwitchChange,
}: WeekdaySelectorSectionProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const dayLabels: Record<Weekday, string> = {
    monday: t(`${i18nPrefix}.monday`, { defaultValue: 'Lundi' }),
    tuesday: t(`${i18nPrefix}.tuesday`, { defaultValue: 'Mardi' }),
    wednesday: t(`${i18nPrefix}.wednesday`, { defaultValue: 'Mercredi' }),
    thursday: t(`${i18nPrefix}.thursday`, { defaultValue: 'Jeudi' }),
    friday: t(`${i18nPrefix}.friday`, { defaultValue: 'Vendredi' }),
    saturday: t(`${i18nPrefix}.saturday`, { defaultValue: 'Samedi' }),
    sunday: t(`${i18nPrefix}.sunday`, { defaultValue: 'Dimanche' }),
  };

  return (
    <View>
      <WeekdaySelector
        selectedDay={selectedDay}
        activeDays={activeDays}
        configuredDays={activeDays}
        onDaySelect={onDaySelect}
        label={t(`${i18nPrefix}.selectDayToConfigure`, {
          defaultValue: "Sélectionnez un jour pour configurer l'heure",
        })}
        containerStyle={styles.daySelectorContainer}
      />

      <View style={styles.switchContainer}>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>
            {t(`${i18nPrefix}.activateFor`, {
              defaultValue: `Activer pour ${dayLabels[selectedDay]}`,
              day: dayLabels[selectedDay],
            })}
          </Text>
          <Switch
            value={weekdayTimes[selectedDay]?.activated ?? false}
            onValueChange={(value) => onSwitchChange(selectedDay, value)}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={(weekdayTimes[selectedDay]?.activated ?? false) ? colors.primary : colors.textTertiary}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  daySelectorContainer: {
    width: '100%',
  },
  switchContainer: {
    marginTop: 12,
    width: '100%',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
  },
});
