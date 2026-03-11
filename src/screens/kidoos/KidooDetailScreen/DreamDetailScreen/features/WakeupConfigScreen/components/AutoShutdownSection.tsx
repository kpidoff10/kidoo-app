/**
 * AutoShutdownSection
 * Section pour configurer l'extinction automatique du wakeup
 */

import React from 'react';
import { View, StyleSheet, Pressable, Switch } from 'react-native';
import { Controller, Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, Title } from '@/components/ui';
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
            <Title>{t('kidoos.dream.wakeup.autoShutdown', { defaultValue: 'Extinction automatique' })}</Title>
            <Switch value={autoShutdown ?? true} onValueChange={setAutoShutdown} />
          </View>

          {autoShutdown && (
            <Controller
              control={control}
              name="autoShutdownMinutes"
              render={({ field: { value: minutes, onChange: setMinutes } }) => (
                <View style={styles.durationContainer}>
                  <Text style={styles.label}>
                    {t('kidoos.dream.wakeup.autoShutdownDuration', { defaultValue: 'Durée' })}
                  </Text>

                  <View style={styles.stepperContainer}>
                    <Pressable
                      style={[styles.stepButton, styles.minusButton]}
                      onPress={() => {
                        const current = minutes ?? 30;
                        if (current > 5) {
                          setMinutes(current - 5);
                        }
                      }}
                    >
                      <Text style={styles.stepButtonText}>−</Text>
                    </Pressable>

                    <View style={styles.valueDisplay}>
                      <Text style={styles.valueText}>{formatDuration(minutes)}</Text>
                    </View>

                    <Pressable
                      style={[styles.stepButton, styles.plusButton]}
                      onPress={() => {
                        const current = minutes ?? 30;
                        if (current < 120) {
                          setMinutes(current + 5);
                        }
                      }}
                    >
                      <Text style={styles.stepButtonText}>+</Text>
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
    backgroundColor: '#f0f0f0',
  },
  minusButton: {
    backgroundColor: '#E8E8E8',
  },
  plusButton: {
    backgroundColor: '#E8E8E8',
  },
  stepButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  valueDisplay: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
