/**
 * CardSection
 * Composant pour grouper les sections dans des cards
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

interface CardSectionProps {
  title: string;
  children: React.ReactNode;
}

export function CardSection({ title, children }: CardSectionProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          shadowColor: colors.text,
        },
      ]}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>
          {title}
        </Text>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
});
