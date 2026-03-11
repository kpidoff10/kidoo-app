/**
 * ColorOrEffectSection (re-export)
 * Shared from @/components/dream with Bedtime-specific config
 */

import React from 'react';
import { Control } from 'react-hook-form';
import { ColorOrEffectSection as GenericColorOrEffectSection } from '@/components/dream';
import { BEDTIME_COLORS, BEDTIME_EFFECTS } from '@/config/colors';

interface ColorOrEffectSectionProps {
  control: Control<{
    color: string;
    effect: string | null;
    brightness: number;
    nightlightAllNight: boolean;
  }>;
}

export function ColorOrEffectSection({ control }: ColorOrEffectSectionProps) {
  return (
    <GenericColorOrEffectSection
      control={control}
      colorFieldName="color"
      effectFieldName="effect"
      colorPalette={BEDTIME_COLORS}
      effectsList={BEDTIME_EFFECTS}
      i18nPrefix="kidoos.dream.bedtime"
      allowCustomColors={false}
    />
  );
}
