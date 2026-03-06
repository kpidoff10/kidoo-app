/**
 * ColorPickerSection Component for DefaultColorConfig
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ColorPicker } from '@/components/ui';

interface ColorPickerSectionProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

// Default color palette
const DEFAULT_COLORS = [
  '#FF0000', // Red
  '#FF8C00', // Dark Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#00FFFF', // Cyan
  '#0000FF', // Blue
  '#8000FF', // Purple
  '#FF00FF', // Magenta
  '#FF1493', // Deep Pink
  '#FFFFFF', // White
  '#FFB6C1', // Light Pink
  '#87CEEB', // Sky Blue
];

export function ColorPickerSection({
  selectedColor,
  onColorChange,
}: ColorPickerSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ColorPicker
        selectedColor={selectedColor}
        onColorChange={onColorChange}
        colors={DEFAULT_COLORS}
        label={t('kidoos.dream.defaultColor.selectColor', {
          defaultValue: 'Sélectionnez la couleur',
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
});
