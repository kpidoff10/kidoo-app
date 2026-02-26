/**
 * BrightnessSection - Composant partagé Bedtime/Wakeup
 * Section avec le slider de luminosité
 */

import React, { useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

import type { ScheduleI18nPrefix } from './WeekdaySelectorSection';

interface BrightnessSectionProps<T extends FieldValues> {
  control: Control<T>;
  i18nPrefix: ScheduleI18nPrefix;
}

export function BrightnessSection<T extends FieldValues & { brightness: number }>({
  control,
  i18nPrefix,
}: BrightnessSectionProps<T>) {
  const { t } = useTranslation();
  const lastValueRef = useRef<number | null>(null);

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={'brightness' as Path<T>}
        render={({ field: { value, onChange } }) => {
          if (value !== undefined && value !== null && lastValueRef.current === null) {
            lastValueRef.current = value;
          }

          const handleValueChange = useCallback(
            (newValue: number) => {
              if (newValue < 0 || newValue > 100 || isNaN(newValue)) return;
              if (lastValueRef.current !== null && lastValueRef.current > 0 && newValue === 0) return;
              if (newValue !== lastValueRef.current) {
                lastValueRef.current = newValue;
                onChange(newValue);
              }
            },
            [onChange]
          );

          return (
            <Slider
              value={value ?? 50}
              minimumValue={0}
              maximumValue={100}
              step={1}
              onValueChange={handleValueChange}
              label={t(`${i18nPrefix}.brightness`, { defaultValue: 'Luminosité' })}
              formatValue={(val) => `${Math.round(val)}%`}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    width: '100%',
  },
});
