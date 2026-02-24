/**
 * Bloc température / humidité (capteur env) pour Dream.
 * Consomme la souscription env du DreamDetailScreenContext (mises à jour toutes les 15 s).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, detailStyles } from '@/theme';
import { Text } from '@/components/ui';
import { useKidooDetailContext } from '../../context';
import { useDreamDetailScreenContext } from '../context';

interface EnvBlockProps {
  marginTop?: number;
}

function EnvCell({
  icon,
  value,
  unit,
  label,
  accentColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  unit: string;
  label: string;
  accentColor: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.cell, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}>
      <Ionicons name={icon} size={22} color={accentColor} style={styles.cellIcon} />
      <View>
        <Text variant="caption" color="secondary" style={styles.cellLabel}>
          {label}
        </Text>
        <Text variant="body" bold style={{ color: colors.text }}>
          {value} {unit}
        </Text>
      </View>
    </View>
  );
}

export function EnvBlock({ marginTop }: EnvBlockProps) {
  const { t } = useTranslation();
  const { spacing, colors } = useTheme();
  const { kidoo } = useKidooDetailContext();
  const { envData: data, envIsLoading: isLoading, envIsError: isError } = useDreamDetailScreenContext();
  const supportsEnv = kidoo?.model === 'dream';

  if (!supportsEnv) return null;

  const top = marginTop ?? spacing[3];

  if (isLoading) {
    return (
      <View style={[styles.row, { marginTop: top }]}>
        <View style={styles.loadingRow}>
          <Ionicons name="thermometer-outline" size={20} color={colors.textTertiary} />
          <Text variant="caption" color="secondary">
            {t('kidoos.detail.env.loading', { defaultValue: 'Chargement…' })}
          </Text>
        </View>
      </View>
    );
  }

  if (isError || (data && !data.available)) {
    return (
      <View style={[styles.row, { marginTop: top }]}>
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
          <Text variant="caption" color="secondary">
            {data?.error ?? t('kidoos.detail.env.error', { defaultValue: 'Erreur chargement capteur' })}
          </Text>
        </View>
      </View>
    );
  }

  if (!data?.available) return null;

  const hasTemp = data.temperatureC != null;
  const hasHumidity = data.humidityPercent != null;

  if (!hasTemp && !hasHumidity) return null;

  return (
    <View style={[styles.row, { marginTop: top }]}>
      {hasTemp && (
        <EnvCell
          icon="thermometer-outline"
          value={data.temperatureC!.toFixed(1)}
          unit="°C"
          label={t('kidoos.detail.env.temperature', { defaultValue: 'Température' })}
          accentColor="#E67E22"
        />
      )}
      {hasHumidity && (
        <EnvCell
          icon="water-outline"
          value={data.humidityPercent!.toFixed(0)}
          unit="%"
          label={t('kidoos.detail.env.humidity', { defaultValue: 'Humidité' })}
          accentColor="#3498DB"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  cellIcon: {
    marginRight: 10,
  },
  cellLabel: {
    marginBottom: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
