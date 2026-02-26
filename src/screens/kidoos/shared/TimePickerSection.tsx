/**
 * TimePickerSection - Composant partagé Bedtime/Wakeup
 * Section avec le TimePicker pour le jour sélectionné
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TimePicker, Weekday } from '@/components/ui';

import type { ScheduleI18nPrefix } from './WeekdaySelectorSection';

interface TimePickerSectionProps {
  i18nPrefix: ScheduleI18nPrefix;
  selectedDay: Weekday;
  hour: number;
  minute: number;
  onTimeChange: (hour: number, minute: number) => void;
}

export function TimePickerSection({
  i18nPrefix,
  hour,
  minute,
  onTimeChange,
}: TimePickerSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TimePicker
        hour={hour}
        minute={minute}
        onTimeChange={onTimeChange}
        label={t(`${i18nPrefix}.configureTimeForDay`, {
          defaultValue: i18nPrefix === 'kidoos.dream.bedtime' ? 'Heure de coucher' : 'Heure de réveil',
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    width: '100%',
  },
});
