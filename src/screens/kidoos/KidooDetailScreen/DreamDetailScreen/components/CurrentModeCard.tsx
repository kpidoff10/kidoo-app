/**
 * Carte affichant le mode actuel Dream (idle / bedtime / wakeup)
 */

import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/components/ui';
import { useTheme, detailStyles } from '@/theme';

interface CurrentModeCardProps {
  /** Clé i18n du label (ex. kidoos.detail.deviceState.idle) */
  labelKey: string;
  /** Nom de l’icône Ionicons */
  icon: keyof typeof Ionicons.glyphMap;
  /** Couleur de bordure / accent */
  borderColor: string;
  /** Couleur de fond */
  backgroundColor: string;
}

export function CurrentModeCard({ labelKey, icon, borderColor, backgroundColor }: CurrentModeCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Card
      variant="default"
      padding="none"
      style={[
        detailStyles.modeCard,
        {
          backgroundColor,
          borderLeftWidth: 4,
          borderLeftColor: borderColor,
          borderColor: colors.border,
          paddingVertical: 12,
          paddingHorizontal: 14,
        },
      ]}
    >
      <View style={detailStyles.modeRow}>
        <View style={[detailStyles.modeIconWrap, { backgroundColor: borderColor + '30' }]}>
          <Ionicons name={icon} size={22} color={borderColor} />
        </View>
        <Text bold style={detailStyles.modeText}>
          {t(labelKey)}
        </Text>
      </View>
    </Card>
  );
}
