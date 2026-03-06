/**
 * BrightnessSlider Component for DefaultColorConfig
 */

import React, { useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui';

interface BrightnessSliderProps {
  brightness: number;
  onBrightnessChange: (brightness: number) => void;
}

export function BrightnessSlider({
  brightness,
  onBrightnessChange,
}: BrightnessSliderProps) {
  const { t } = useTranslation();
  const lastValueRef = useRef<number | null>(null);

  const handleValueChange = useCallback(
    (newValue: number) => {
      if (newValue < 0 || newValue > 100 || isNaN(newValue)) return;
      if (lastValueRef.current !== null && lastValueRef.current > 0 && newValue === 0) return;
      if (newValue !== lastValueRef.current) {
        lastValueRef.current = newValue;
        onBrightnessChange(newValue);
      }
    },
    [onBrightnessChange]
  );

  return (
    <View style={styles.container}>
      <Slider
        value={brightness ?? 50}
        minimumValue={0}
        maximumValue={100}
        step={1}
        onValueChange={handleValueChange}
        label={t('kidoos.dream.defaultColor.brightness', {
          defaultValue: 'Luminosité',
        })}
        formatValue={(val) => `${Math.round(val)}%`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    width: '100%',
  },
});
