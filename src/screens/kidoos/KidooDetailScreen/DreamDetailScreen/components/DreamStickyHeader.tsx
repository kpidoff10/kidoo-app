/**
 * En-tête fixe Dream : label "Mode actuel" + CurrentModeCard + EnvBlock (optionnel)
 * EnvBlock consomme la souscription env du DreamDetailScreenContext.
 */

import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, detailStyles } from '@/theme';
import { Text } from '@/components/ui';
import { CurrentModeCard } from './CurrentModeCard';
import { EnvBlock } from './EnvBlock';

type DeviceState = 'idle' | 'bedtime' | 'wakeup';

interface DreamStickyHeaderProps {
  deviceState: DeviceState;
}

const MODE_CONFIG: Record<
  DeviceState,
  { icon: 'moon' | 'sunny' | 'sparkles'; labelKey: string; getBg: (c: { primary: string; warning: string; backgroundSecondary: string; border: string }) => string; getBorder: (c: { primary: string; warning: string; border: string }) => string }
> = {
  bedtime: {
    icon: 'moon',
    labelKey: 'kidoos.detail.deviceState.bedtime',
    getBg: (c) => c.primary + '18',
    getBorder: (c) => c.primary,
  },
  wakeup: {
    icon: 'sunny',
    labelKey: 'kidoos.detail.deviceState.wakeup',
    getBg: (c) => c.warning + '25',
    getBorder: (c) => c.warning,
  },
  idle: {
    icon: 'sparkles',
    labelKey: 'kidoos.detail.deviceState.idle',
    getBg: (c) => c.backgroundSecondary,
    getBorder: (c) => c.border,
  },
};

export function DreamStickyHeader({ deviceState }: DreamStickyHeaderProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const config = MODE_CONFIG[deviceState];

  return (
    <View
      style={[
        detailStyles.stickyHeader,
        {
          backgroundColor: colors.background,
          paddingHorizontal: spacing[4],
          paddingTop: spacing[2],
          paddingBottom: spacing[3],
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Text variant="caption" color="secondary" style={detailStyles.sectionLabel}>
        {t('kidoos.detail.currentMode')}
      </Text>
      <CurrentModeCard
        labelKey={config.labelKey}
        icon={config.icon}
        borderColor={config.getBorder(colors)}
        backgroundColor={config.getBg(colors)}
      />
      <EnvBlock marginTop={spacing[3]} />
    </View>
  );
}
