/**
 * ColorOrEffectSection Component
 * Section pour choisir entre une couleur fixe ou un effet pour la couleur par défaut
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ColorPicker } from '@/components/ui';
import { Controller, Control } from 'react-hook-form';
import { useTheme } from '@/theme';

interface ColorOrEffectSectionProps {
  control: Control<{
    color: string;
    effect: string | null;
    brightness: number;
  }>;
}

// Effets disponibles pour la couleur par défaut (format ESP32 parseDefaultEffect)
const DEFAULT_COLOR_EFFECTS = [
  { value: 'pulse', label: 'Pulsation' },
  { value: 'rainbow_soft', label: 'Arc-en-ciel doux' },
  { value: 'breathe', label: 'Respiration' },
  { value: 'rotate', label: 'Rotation' },
  { value: 'nightlight', label: 'Veilleuse' },
] as const;

const DEFAULT_COLORS = [
  '#FF0000', '#FF8C00', '#FFFF00', '#00FF00', '#00FFFF',
  '#0000FF', '#8000FF', '#FF00FF', '#FF1493', '#FFFFFF',
];

export function ColorOrEffectSection({ control }: ColorOrEffectSectionProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t('kidoos.dream.defaultColor.mode', { defaultValue: 'Mode d\'affichage' })}
      </Text>

      <Controller
        control={control}
        name="effect"
        render={({ field: { value: effectValue, onChange: onEffectChange } }) => {
          const isColor = effectValue === null || effectValue === 'none';

          return (
            <>
              <View style={styles.modeSelectorContainer}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    isColor && styles.modeButtonActive,
                    { backgroundColor: isColor ? colors.primary : colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => {
                    if (!isColor) onEffectChange('none');
                  }}
                >
                  <Text style={[styles.modeButtonText, { color: isColor ? '#FFFFFF' : colors.text }]}>
                    Couleur
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    !isColor && styles.modeButtonActive,
                    { backgroundColor: !isColor ? colors.primary : colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => {
                    if (isColor) {
                      const currentEffect = effectValue && effectValue !== 'none' ? effectValue : 'pulse';
                      onEffectChange(currentEffect);
                    }
                  }}
                >
                  <Text style={[styles.modeButtonText, { color: !isColor ? '#FFFFFF' : colors.text }]}>
                    Effet
                  </Text>
                </TouchableOpacity>
              </View>

              {isColor ? (
                <View style={styles.colorPickerContainer}>
                  <Controller
                    control={control}
                    name="color"
                    render={({ field: { value, onChange } }) => (
                      <ColorPicker
                        selectedColor={value ? value.toUpperCase() : ''}
                        onColorChange={(color) => onChange(color.toUpperCase())}
                        colors={DEFAULT_COLORS}
                        label={t('kidoos.dream.defaultColor.selectColor', {
                          defaultValue: 'Sélectionnez la couleur',
                        })}
                      />
                    )}
                  />
                </View>
              ) : (
                <View style={styles.effectPickerContainer}>
                  <Text style={[styles.effectLabel, { color: colors.text }]}>
                    {t('kidoos.dream.defaultColor.selectEffect', {
                      defaultValue: 'Sélectionnez un effet',
                    })}
                  </Text>
                  <View style={styles.effectsGrid}>
                    {DEFAULT_COLOR_EFFECTS.map((effectOption) => {
                      const isSelected =
                        effectValue !== null && effectValue !== 'none' && effectOption.value === effectValue;
                      return (
                        <TouchableOpacity
                          key={effectOption.value}
                          style={[
                            styles.effectButton,
                            isSelected && styles.effectButtonActive,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.surface,
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() => onEffectChange(effectOption.value)}
                        >
                          <Text
                            style={[
                              styles.effectButtonText,
                              { color: isSelected ? '#FFFFFF' : colors.text },
                            ]}
                          >
                            {effectOption.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modeSelectorContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {},
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorPickerContainer: {
    marginTop: 8,
  },
  effectPickerContainer: {
    marginTop: 8,
  },
  effectLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  effectButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  effectButtonActive: {},
  effectButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
