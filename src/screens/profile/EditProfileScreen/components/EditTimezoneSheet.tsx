/**
 * Edit Timezone Sheet
 * Bottom sheet pour modifier la timezone
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, BottomSheet, Button } from '@/components/ui';
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
  const { mutate: updateTimezone, isPending, isSuccess } = useUpdateTimezone();
  const [selectedTimezone, setSelectedTimezone] = useState(currentTimezone);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = useCallback((timezone: string) => {
    setSelectedTimezone(timezone);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedTimezone !== currentTimezone) {
      setIsSubmitting(true);
      updateTimezone(selectedTimezone);
    } else {
      bottomSheet.close();
    }
  }, [selectedTimezone, currentTimezone, updateTimezone, bottomSheet]);

  const handleCancel = useCallback(() => {
    setSelectedTimezone(currentTimezone);
    bottomSheet.close();
  }, [currentTimezone, bottomSheet]);

  const handleDismiss = useCallback(() => {
    bottomSheet.handleDidDismiss({} as any);
    setSelectedTimezone(currentTimezone);
  }, [bottomSheet, currentTimezone]);

  // Fermer le sheet quand la mutation réussit
  useEffect(() => {
    if (isSuccess && isSubmitting) {
      setIsSubmitting(false);
      // Petit délai pour laisser le toast s'afficher
      setTimeout(() => {
        bottomSheet.close();
      }, 500);
    }
  }, [isSuccess, isSubmitting, bottomSheet]);

  const timezoneList = useMemo(
    () =>
      SUPPORTED_TIMEZONES.map((item) => ({
        id: item.id,
        label: item.label,
      })),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof timezoneList)[0] }) => {
      const isSelected = selectedTimezone === item.id;
      return (
        <Pressable
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
                color: isSelected ? colors.primary : colors.text,
                fontWeight: isSelected ? '600' : '400',
              }}
            >
              {item.label}
            </Text>
          </View>
          {isSelected && (
            <Text style={{ color: colors.primary, fontSize: 18 }}>✓</Text>
          )}
        </Pressable>
      );
    },
    [selectedTimezone, colors, spacing, handleSelect]
  );

  return (
    <BottomSheet
      ref={bottomSheet.ref}
      name={bottomSheet.id}
      detents={['auto']}
      onDismiss={handleDismiss}
      headerTitle={t('profile.timezone', { defaultValue: 'Fuseau horaire' })}
      headerIcon="globe-outline"
    >
      <View style={{ paddingHorizontal: spacing[4] }}>
        {timezoneList.map((item) => {
          const isSelected = selectedTimezone === item.id;
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
                    color: isSelected ? colors.primary : colors.text,
                    fontWeight: isSelected ? '600' : '400',
                  }}
                >
                  {item.label}
                </Text>
              </View>
              {isSelected && (
                <Text style={{ color: colors.primary, fontSize: 18 }}>✓</Text>
              )}
            </Pressable>
          );
        })}

        <View
          style={[
            styles.actions,
            {
              marginTop: spacing[4],
              gap: spacing[2],
              marginBottom: spacing[4],
            },
          ]}
        >
          <Button
            title={t('common.cancel')}
            variant="outline"
            onPress={handleCancel}
            disabled={isPending}
            style={styles.button}
          />
          <Button
            title={t('common.save')}
            variant="primary"
            onPress={handleConfirm}
            loading={isPending}
            style={styles.button}
          />
        </View>
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
  actions: {
    flexDirection: 'row',
    paddingBottom: 16,
  },
  button: {
    flex: 1,
  },
});
