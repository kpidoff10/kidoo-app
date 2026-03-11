/**
 * ColorPickerSection Component (Generic)
 * Flexible color picker supporting both controlled (react-hook-form) and uncontrolled modes
 * Supports static palettes or dynamic custom color additions
 *
 * Usage:
 * 1. Controlled with custom colors (Wakeup):
 *    <ColorPickerSection control={control} fieldName="color" palette={WAKEUP_COLORS} allowCustomColors />
 *
 * 2. Controlled without custom colors (Bedtime):
 *    <ColorPickerSection control={control} fieldName="color" palette={BEDTIME_COLORS} />
 *
 * 3. Uncontrolled (DefaultColor):
 *    <ColorPickerSection selectedColor={color} onColorChange={setColor} palette={DEFAULT_COLORS} />
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ColorPicker } from '@/components/ui';
import { Controller, Control, useWatch } from 'react-hook-form';

interface ColorPickerSectionPropsControlled {
  // Controlled mode (react-hook-form)
  control: Control<any>;
  fieldName?: string;
  selectedColor?: never;
  onColorChange?: never;
}

interface ColorPickerSectionPropsUncontrolled {
  // Uncontrolled mode
  control?: never;
  fieldName?: never;
  selectedColor: string;
  onColorChange: (color: string) => void;
}

interface ColorPickerSectionPropsCommon {
  palette: readonly string[];
  allowCustomColors?: boolean;
  i18nKey?: string; // e.g., 'kidoos.dream.bedtime.selectColor'
}

type ColorPickerSectionProps =
  | (ColorPickerSectionPropsControlled & ColorPickerSectionPropsCommon)
  | (ColorPickerSectionPropsUncontrolled & ColorPickerSectionPropsCommon);

function ColorPickerSectionControlled({
  control,
  fieldName = 'color',
  palette,
  allowCustomColors = false,
  i18nKey,
}: ColorPickerSectionPropsControlled & ColorPickerSectionPropsCommon) {
  const { t } = useTranslation();
  const selectedColor = useWatch({ control, name: fieldName });

  // Add custom color to palette if allowed and not already present
  const colors = useMemo(() => {
    if (!allowCustomColors || !selectedColor) {
      return palette;
    }

    const normalizedSelected = selectedColor.toUpperCase();
    const colorExists = palette.some(
      color => color.toUpperCase() === normalizedSelected
    );

    if (colorExists) {
      return palette;
    }

    return [normalizedSelected, ...palette];
  }, [selectedColor, palette, allowCustomColors]);

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={fieldName}
        render={({ field: { value, onChange } }) => {
          const normalizedValue = value ? value.toUpperCase() : '';

          return (
            <ColorPicker
              selectedColor={normalizedValue}
              onColorChange={(color) => onChange(color.toUpperCase())}
              colors={colors}
              label={
                i18nKey
                  ? t(i18nKey, { defaultValue: 'Sélectionnez la couleur' })
                  : t('kidoos.dream.selectColor', {
                      defaultValue: 'Sélectionnez la couleur',
                    })
              }
            />
          );
        }}
      />
    </View>
  );
}

function ColorPickerSectionUncontrolled({
  selectedColor,
  onColorChange,
  palette,
  allowCustomColors = false,
  i18nKey,
}: ColorPickerSectionPropsUncontrolled & ColorPickerSectionPropsCommon) {
  const { t } = useTranslation();

  // Add custom color to palette if allowed and not already present
  const colors = useMemo(() => {
    if (!allowCustomColors || !selectedColor) {
      return palette;
    }

    const normalizedSelected = selectedColor.toUpperCase();
    const colorExists = palette.some(
      color => color.toUpperCase() === normalizedSelected
    );

    if (colorExists) {
      return palette;
    }

    return [normalizedSelected, ...palette];
  }, [selectedColor, palette, allowCustomColors]);

  const normalizedValue = selectedColor ? selectedColor.toUpperCase() : '';

  return (
    <View style={styles.container}>
      <ColorPicker
        selectedColor={normalizedValue}
        onColorChange={(color) => onColorChange(color.toUpperCase())}
        colors={colors}
        label={
          i18nKey
            ? t(i18nKey, { defaultValue: 'Sélectionnez la couleur' })
            : t('kidoos.dream.selectColor', {
                defaultValue: 'Sélectionnez la couleur',
              })
        }
      />
    </View>
  );
}

export function ColorPickerSection(
  props: ColorPickerSectionProps
): React.ReactElement {
  if (props.control) {
    return <ColorPickerSectionControlled {...props} />;
  }

  return <ColorPickerSectionUncontrolled {...props} />;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },
});
