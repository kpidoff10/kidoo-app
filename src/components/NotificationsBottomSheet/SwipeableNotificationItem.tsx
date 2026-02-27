/**
 * SwipeableNotificationItem
 * Notification item using the generic SwipeableItem
 */

import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Typography';
import { SwipeableItem } from '@/components/ui/SwipeableItem';
import { useTheme } from '@/theme';
import { type Notification } from '@/hooks/useNotifications';

interface SwipeableNotificationItemProps {
  item: Notification;
  title: string;
  message: string;
  onDelete: (id: string) => void;
  isLast?: boolean;
  isFirst?: boolean;
  wasUnreadAtOpen?: boolean;
}

const NOTIFICATION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'nighttime-alert': 'alert-circle',
  'device-offline': 'cloud-offline',
  'device-online': 'cloud-done',
};

export function SwipeableNotificationItem({
  item,
  title,
  message,
  onDelete,
  isLast = false,
  isFirst = false,
  wasUnreadAtOpen = false,
}: SwipeableNotificationItemProps) {
  const { colors } = useTheme();

  const iconName = NOTIFICATION_ICONS[item.type] || 'notifications';
  const iconColor = wasUnreadAtOpen ? colors.primary : colors.textTertiary;

  return (
    <SwipeableItem
      isFirst={isFirst}
      isLast={isLast}
      backgroundColor={colors.surface}
      borderBottomColor={colors.border}
      deleteBackgroundColor={colors.error}
      onDelete={() => onDelete(item.id)}
      deleteIcon={<Ionicons name="trash" size={24} color="#fff" />}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <Ionicons name={iconName} size={24} color={iconColor} />

        <View style={{ flex: 1 }}>
          <Text
            style={{
              marginBottom: 4,
              fontSize: 15,
              color: wasUnreadAtOpen ? colors.text : colors.textSecondary,
              fontWeight: wasUnreadAtOpen ? '600' : '400',
            }}
          >
            {title}
          </Text>
          <Text
            color="secondary"
            style={{ marginBottom: 4, lineHeight: 18, fontSize: 13 }}
            numberOfLines={1}
          >
            {message}
          </Text>
          <Text color="tertiary" style={{ fontSize: 11 }}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
    </SwipeableItem>
  );
}
