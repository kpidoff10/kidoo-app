/**
 * Hooks Kidoo - exports regroupés
 */

export { KIDOOS_KEY } from './keys';
export { useKidoos, useKidoo } from './useKidoos';
export {
  useCreateKidoo,
  useUpdateKidoo,
  useUpdateKidooName,
  useDeleteKidoo,
  useUpdateBrightness,
} from './useKidooMutations';
export { useKidooCheckOnline } from './useKidooCheckOnline';
export { useKidooEnv } from './useKidooEnv';
export {
  useDreamBedtimeConfig,
  useUpdateDreamBedtimeConfig,
  useDreamActivate,
} from './useDreamBedtime';
export {
  useDreamWakeupConfig,
  useUpdateDreamWakeupConfig,
} from './useDreamWakeup';
export { useDreamNighttimeAlert } from './useDreamNighttimeAlert';
export { useDreamDefaultColor } from './useDreamDefaultColor';
