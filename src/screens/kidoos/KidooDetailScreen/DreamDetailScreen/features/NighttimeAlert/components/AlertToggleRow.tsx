/**
 * AlertToggleRow - Ligne avec label et switch pour activer/désactiver
 */

import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

interface AlertToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function AlertToggleRow({ label, value, onValueChange, disabled }: AlertToggleRowProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { marginTop: spacing[6] }]}>
      <Text variant="body" style={styles.label}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary + '80' }}
        thumbColor={value ? colors.primary : colors.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  label: {
    flex: 1,
  },
});
