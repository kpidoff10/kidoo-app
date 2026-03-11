/**
 * ColorOrEffectSection (re-export)
 * Shared from @/components/dream with DefaultColor-specific config
 */

import React from 'react';
import { Control } from 'react-hook-form';
import { ColorOrEffectSection as GenericColorOrEffectSection } from '@/components/dream';
import { DEFAULT_COLORS, DEFAULT_COLOR_EFFECTS } from '@/config/colors';

interface ColorOrEffectSectionProps {
  control: Control<{
    color: string;
    effect: string | null;
    brightness: number;
  }>;
}

export function ColorOrEffectSection({ control }: ColorOrEffectSectionProps) {
  return (
    <GenericColorOrEffectSection
      control={control}
      colorFieldName="color"
      effectFieldName="effect"
      colorPalette={DEFAULT_COLORS}
      effectsList={DEFAULT_COLOR_EFFECTS}
      i18nPrefix="kidoos.dream.defaultColor"
      allowCustomColors={false}
    />
  );
}
