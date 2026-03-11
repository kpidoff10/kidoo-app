/**
 * CardSection
 * Composant pour grouper les sections dans des cards
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

interface CardSectionProps {
  title: string;
  children: React.ReactNode;
}

export function CardSection({ title, children }: CardSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
});
