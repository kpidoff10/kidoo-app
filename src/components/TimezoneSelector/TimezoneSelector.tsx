import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text, BottomSheet } from '@/components/ui';
import { useTheme } from '@/theme';
import { useBottomSheet } from '@/hooks';
import { SUPPORTED_TIMEZONES } from '@/utils/timezone';

interface TimezoneSelectorProps {
  currentTimezone: string;
  onSelect: (timezoneId: string) => Promise<void>;
  isLoading?: boolean;
}

export function TimezoneSelector({
  currentTimezone,
  onSelect,
  isLoading = false,
}: TimezoneSelectorProps) {
  const { colors, spacing, borderRadius } = useTheme();
  const bottomSheet = useBottomSheet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectTimezone = async (timezoneId: string) => {
    setIsSubmitting(true);
    try {
      await onSelect(timezoneId);
      await bottomSheet.close();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
          },
        ]}
        onPress={() => bottomSheet.open()}
        disabled={isLoading || isSubmitting}
      >
        <Text style={{ marginRight: spacing[2] }}>🌍</Text>
        <Text bold>
          {SUPPORTED_TIMEZONES.find((tz) => tz.id === currentTimezone)?.label ||
            currentTimezone}
        </Text>
      </Pressable>

      <BottomSheet ref={bottomSheet.ref} name={bottomSheet.id} detents={['auto']}>
        <View style={{ paddingHorizontal: spacing[4], paddingBottom: spacing[6] }}>
          <Text bold level="h4" style={{ marginBottom: spacing[4] }}>
            Sélectionner votre fuseau horaire
          </Text>

          <FlatList
            data={SUPPORTED_TIMEZONES}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.timezoneItem,
                  {
                    backgroundColor:
                      item.id === currentTimezone
                        ? colors.primary + '15'
                        : colors.surface,
                    paddingVertical: spacing[3],
                    paddingHorizontal: spacing[3],
                    marginBottom: spacing[2],
                    borderRadius: borderRadius.sm,
                    borderColor:
                      item.id === currentTimezone ? colors.primary : colors.border,
                    borderWidth: item.id === currentTimezone ? 2 : 1,
                  },
                ]}
                onPress={() => handleSelectTimezone(item.id)}
                disabled={isSubmitting || isLoading}
              >
                <Text
                  style={{
                    color:
                      item.id === currentTimezone ? colors.primary : colors.text,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            )}
          />
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  timezoneItem: {
    justifyContent: 'center',
  },
});
