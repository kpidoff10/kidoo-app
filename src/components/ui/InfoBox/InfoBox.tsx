/**
 * InfoBox - Bloc d'information avec icône (message informatif réutilisable)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

export interface InfoBoxProps {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function InfoBox({ message, icon = 'information-circle-outline' }: InfoBoxProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary + '15' }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.text} variant="body" color="secondary">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    flex: 1,
  },
});
