/**
 * Edit Timezone Sheet
 * Bottom sheet pour modifier la timezone
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text, BottomSheet } from '@/components/ui';
import { useTheme } from '@/theme';
import { useUpdateTimezone } from '@/hooks/useTimezone';
import { SUPPORTED_TIMEZONES } from '@/utils/timezone';
import type { UseBottomSheetReturn } from '@/hooks';

interface EditTimezoneSheetProps {
  bottomSheet: UseBottomSheetReturn;
  currentTimezone?: string;
}

export function EditTimezoneSheet({ bottomSheet, currentTimezone = 'UTC' }: EditTimezoneSheetProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { mutate: updateTimezone } = useUpdateTimezone();
  const insets = useSafeAreaInsets();

  const handleSelect = useCallback((timezone: string) => {
    if (timezone !== currentTimezone) {
      updateTimezone(timezone);
    }
    bottomSheet.close();
  }, [currentTimezone, updateTimezone, bottomSheet]);

  const handleDismiss = useCallback(() => {
    bottomSheet.handleDidDismiss({} as any);
  }, [bottomSheet]);

  return (
    <BottomSheet
      ref={bottomSheet.ref}
      name={bottomSheet.id}
      detents={['auto']}
      onDismiss={handleDismiss}
      headerTitle={t('profile.timezone', { defaultValue: 'Fuseau horaire' })}
      headerIcon="globe-outline"
    >
      <View style={{ paddingBottom: insets.bottom + spacing[6] }}>
        {SUPPORTED_TIMEZONES.map((item) => {
          const isSelected = currentTimezone === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => handleSelect(item.id)}
              style={[
                styles.timezoneItem,
                {
                  backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  paddingHorizontal: spacing[4],
                  paddingVertical: spacing[3],
                  marginBottom: spacing[2],
                  borderRadius: 8,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  variant="body"
                  style={{
                    color: isSelected ? colors.surface : colors.text,
                    fontWeight: isSelected ? '600' : '400',
                  }}
                >
                  {item.label}
                </Text>
              </View>
              {isSelected && (
                <Text style={{ color: colors.surface, fontSize: 18 }}>✓</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  timezoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
