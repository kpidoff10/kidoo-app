/**
 * Centralized Color Palettes and Effect Definitions
 * Used across all Dream configuration screens
 */

/**
 * UNIFIED DREAM COLOR PALETTE
 * 12 colors used across ALL Dream configuration screens (Bedtime, Wakeup, DefaultColor)
 * Ensures consistent color selection across all interfaces
 */
export const DREAM_COLORS = [
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
] as const;

/**
 * Aliases for backward compatibility
 * All point to the unified DREAM_COLORS palette
 */
export const BEDTIME_COLORS = DREAM_COLORS;
export const WAKEUP_COLORS = DREAM_COLORS;
export const DEFAULT_COLORS = DREAM_COLORS;

/**
 * BEDTIME EFFECTS
 * Available effects for bedtime mode
 */
export const BEDTIME_EFFECTS = [
  { value: 'pulse', label: 'Pulsation' },
  { value: 'rainbow_soft', label: 'Arc-en-ciel doux' },
  { value: 'breathe', label: 'Respiration' },
  { value: 'nightlight', label: 'Veilleuse' },
] as const;

/**
 * DEFAULT COLOR EFFECTS
 * Available effects for default color mode
 */
export const DEFAULT_COLOR_EFFECTS = [
  { value: 'pulse', label: 'Pulsation' },
  { value: 'rainbow_soft', label: 'Arc-en-ciel doux' },
  { value: 'breathe', label: 'Respiration' },
  { value: 'rotate', label: 'Rotation' },
  { value: 'nightlight', label: 'Veilleuse' },
] as const;

/**
 * Helper to get color palette by screen type
 * All screens use the same unified DREAM_COLORS palette
 */
export const getColorPalette = (
  screenType: 'bedtime' | 'wakeup' | 'defaultColor'
): readonly string[] => {
  // All screens use the unified DREAM_COLORS palette
  return DREAM_COLORS;
};

/**
 * Helper to get effects list by screen type
 */
export const getEffectsList = (
  screenType: 'bedtime' | 'defaultColor'
): readonly { value: string; label: string }[] => {
  switch (screenType) {
    case 'bedtime':
      return BEDTIME_EFFECTS;
    case 'defaultColor':
      return DEFAULT_COLOR_EFFECTS;
    default:
      return DEFAULT_COLOR_EFFECTS;
  }
};

/**
 * Type for effect values
 */
export type BedtimeEffect = typeof BEDTIME_EFFECTS[number]['value'];
export type DefaultColorEffect = typeof DEFAULT_COLOR_EFFECTS[number]['value'];
export type Effect = BedtimeEffect | DefaultColorEffect;
