/**
 * ColorOrEffectSection Component (Generic)
 * Toggle between color and effect mode with conditional display
 * Used for Bedtime and DefaultColor configuration screens
 *
 * Usage:
 * <ColorOrEffectSection
 *   control={control}
 *   colorPalette={BEDTIME_COLORS}
 *   effectsList={BEDTIME_EFFECTS}
 *   i18nPrefix="kidoos.dream.bedtime"
 * />
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Controller, Control } from 'react-hook-form';
import { useTheme } from '@/theme';
import { ColorPickerSection } from './ColorPickerSection';

interface ColorOrEffectSectionProps {
  control: Control<any>;
  colorFieldName?: string;
  effectFieldName?: string;
  colorPalette: readonly string[];
  effectsList: readonly { value: string; label: string }[];
  i18nPrefix: string; // e.g., 'kidoos.dream.bedtime' or 'kidoos.dream.defaultColor'
  allowCustomColors?: boolean;
}

export function ColorOrEffectSection({
  control,
  colorFieldName = 'color',
  effectFieldName = 'effect',
  colorPalette,
  effectsList,
  i18nPrefix,
  allowCustomColors = false,
}: ColorOrEffectSectionProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t(`${i18nPrefix}.mode`, { defaultValue: "Mode d'affichage" })}
      </Text>

      <Controller
        control={control}
        name={effectFieldName}
        render={({ field: { value: effectValue, onChange: onEffectChange } }) => {
          const isColor = effectValue === null || effectValue === 'none';

          return (
            <>
              {/* Mode Selector */}
              <View style={styles.modeSelectorContainer}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    isColor && styles.modeButtonActive,
                    {
                      backgroundColor: isColor ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    if (!isColor) onEffectChange('none');
                  }}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      { color: isColor ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {t(`${i18nPrefix}.modeColor`, { defaultValue: 'Couleur' })}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    !isColor && styles.modeButtonActive,
                    {
                      backgroundColor: !isColor ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    if (isColor) {
                      // Use current effect value if exists and is not 'none', otherwise default to first effect
                      const currentEffect =
                        effectValue && effectValue !== 'none'
                          ? effectValue
                          : effectsList[0]?.value || 'pulse';
                      onEffectChange(currentEffect);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      { color: !isColor ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {t(`${i18nPrefix}.modeEffect`, { defaultValue: 'Effet' })}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Color Picker (shown when in color mode) */}
              {isColor ? (
                <View style={styles.colorPickerContainer}>
                  <ColorPickerSection
                    control={control}
                    fieldName={colorFieldName}
                    palette={colorPalette}
                    allowCustomColors={allowCustomColors}
                    i18nKey={`${i18nPrefix}.selectColor`}
                  />
                </View>
              ) : (
                /* Effect Grid (shown when in effect mode) */
                <View style={styles.effectPickerContainer}>
                  <Text style={[styles.effectLabel, { color: colors.text }]}>
                    {t(`${i18nPrefix}.selectEffect`, {
                      defaultValue: 'Sélectionnez un effet',
                    })}
                  </Text>
                  <View style={styles.effectsGrid}>
                    {effectsList.map((effectOption) => {
                      const isSelected =
                        effectValue !== null &&
                        effectValue !== 'none' &&
                        effectOption.value === effectValue;

                      return (
                        <TouchableOpacity
                          key={effectOption.value}
                          style={[
                            styles.effectButton,
                            isSelected && styles.effectButtonActive,
                            {
                              backgroundColor: isSelected
                                ? colors.primary
                                : colors.surface,
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() => onEffectChange(effectOption.value)}
                        >
                          <Text
                            style={[
                              styles.effectButtonText,
                              {
                                color: isSelected ? '#FFFFFF' : colors.text,
                              },
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
  container: {},
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
  modeButtonActive: {
    // Style applied via backgroundColor
  },
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
  effectButtonActive: {
    // Style applied via backgroundColor
  },
  effectButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
