/**
 * AutoShutdownSection
 * Section pour configurer l'extinction automatique du wakeup
 */

import React from 'react';
import { View, StyleSheet, Pressable, Switch } from 'react-native';
import { Controller, Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

interface AutoShutdownSectionProps {
  control: Control<{
    color: string;
    brightness: number;
    autoShutdown: boolean;
    autoShutdownMinutes: number;
  }>;
}

export function AutoShutdownSection({ control }: AutoShutdownSectionProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '30 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <Controller
      control={control}
      name="autoShutdown"
      render={({ field: { value: autoShutdown, onChange: setAutoShutdown } }) => (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.headerLabel, { color: colors.text }]}>
              {t('kidoos.dream.wakeup.autoShutdown', { defaultValue: 'Extinction automatique' })}
            </Text>
            <Switch
              value={autoShutdown ?? true}
              onValueChange={setAutoShutdown}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={(autoShutdown ?? true) ? colors.primary : colors.textTertiary}
            />
          </View>

          {autoShutdown && (
            <Controller
              control={control}
              name="autoShutdownMinutes"
              render={({ field: { value: minutes, onChange: setMinutes } }) => (
                <View style={styles.durationContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('kidoos.dream.wakeup.autoShutdownDuration', { defaultValue: 'Durée' })}
                  </Text>

                  <View style={styles.stepperContainer}>
                    <Pressable
                      style={[styles.stepButton, { backgroundColor: colors.backgroundSecondary }]}
                      onPress={() => {
                        const current = minutes ?? 30;
                        if (current > 5) {
                          setMinutes(current - 5);
                        }
                      }}
                    >
                      <Text style={[styles.stepButtonText, { color: colors.text }]}>−</Text>
                    </Pressable>

                    <View style={[styles.valueDisplay, { backgroundColor: colors.background }]}>
                      <Text style={[styles.valueText, { color: colors.text }]}>{formatDuration(minutes)}</Text>
                    </View>

                    <Pressable
                      style={[styles.stepButton, { backgroundColor: colors.backgroundSecondary }]}
                      onPress={() => {
                        const current = minutes ?? 30;
                        if (current < 120) {
                          setMinutes(current + 5);
                        }
                      }}
                    >
                      <Text style={[styles.stepButtonText, { color: colors.text }]}>+</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLabel: {
    fontSize: 16,
    flex: 1,
  },
  durationContainer: {
    paddingLeft: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  valueDisplay: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
