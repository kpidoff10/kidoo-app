/**
 * Edit Timezone Sheet
 * Bottom sheet pour modifier la timezone
 * Même pattern que TimezoneSelector
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
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
  const { colors, spacing, borderRadius } = useTheme();
  const { mutate: updateTimezone } = useUpdateTimezone();

  const handleSelect = useCallback(
    (timezone: string) => {
      if (timezone !== currentTimezone) {
        updateTimezone(timezone);
      }
      // Fermer immédiatement (optimistic update)
      bottomSheet.close();
    },
    [currentTimezone, updateTimezone, bottomSheet]
  );

  const handleDismiss = useCallback(() => {
    bottomSheet.handleDidDismiss({} as any);
  }, [bottomSheet]);

  const renderItem = useCallback(
    (item: (typeof SUPPORTED_TIMEZONES)[0]) => {
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
              borderRadius: borderRadius.md,
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
          {isSelected && <Text style={{ color: colors.surface, fontSize: 18 }}>✓</Text>}
        </Pressable>
      );
    },
    [currentTimezone, colors, spacing, borderRadius, handleSelect]
  );

  return (
    <BottomSheet
      ref={bottomSheet.ref}
      name={bottomSheet.id}
      scrollable={true}
      detents={[0.5, 1]}
      onDismiss={handleDismiss}
      headerTitle={t('profile.timezone', { defaultValue: 'Fuseau horaire' })}
      headerIcon="globe-outline"
    >
      <FlatList
        data={SUPPORTED_TIMEZONES}
        renderItem={({ item }) => renderItem(item)}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing[4],
          paddingTop: spacing[2],
          paddingBottom: spacing[4],
        }}
      />
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
