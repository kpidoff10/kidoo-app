/**
 * AccordionSection
 * Composant pour grouper les sections en accordéon déroulable
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, LayoutAnimation, Platform } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionSection({ title, children, defaultOpen = true }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { colors } = useTheme();

  const toggleOpen = () => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setIsOpen(!isOpen);
  };

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <Pressable
        style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}
        onPress={toggleOpen}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.icon, { color: colors.text }]}>
          {isOpen ? '▼' : '▶'}
        </Text>
      </Pressable>

      {isOpen && (
        <View style={[styles.content, { borderTopColor: colors.border }]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  icon: {
    fontSize: 12,
    marginLeft: 8,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
});
