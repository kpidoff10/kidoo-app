/**
 * NotificationsBottomSheet
 * Affiche la liste des notifications avec options
 */

import React, { useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet/BottomSheet';
import { useNotificationsSheet } from '@/contexts/NotificationsSheetContext';
import {
  useNotifications,
  useDeleteNotification,
  useMarkNotificationAsRead,
  useClearAllNotifications,
  getNotificationContent,
  type Notification,
} from '@/hooks/useNotifications';
import { SwipeableNotificationItem } from './SwipeableNotificationItem';
import { useTheme } from '@/theme';

interface NotificationsBottomSheetProps {
  unreadCount?: number;
}

export function NotificationsBottomSheet({ unreadCount = 0 }: NotificationsBottomSheetProps) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const { bottomSheet } = useNotificationsSheet();
  const { data, isLoading, error } = useNotifications(50, 0);
  const deleteNotification = useDeleteNotification();
  const markAsRead = useMarkNotificationAsRead();
  const clearAll = useClearAllNotifications();

  const notifications = useMemo(() => data?.notifications ?? [], [data?.notifications]);

  useEffect(() => {
    if (error) {
      console.error('Erreur notifications:', error);
    }
  }, [error]);

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification.mutateAsync(id);
    } catch (error) {
      console.error('Erreur suppression notification:', error);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    try {
      await markAsRead.mutateAsync({ id, isRead: !isRead });
    } catch (error) {
      console.error('Erreur marquer notification:', error);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Supprimer toutes les notifications ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', onPress: () => {}, style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              await clearAll.mutateAsync();
            } catch (error) {
              console.error('Erreur suppression notifications:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDismiss = useCallback(() => {
    bottomSheet.handleDidDismiss({} as any);
  }, [bottomSheet]);

  const renderNotification = ({ item }: { item: Notification }) => {
    const kidooName = item.kidoo?.name || `Kidoo ${item.kidooId?.slice(-4)}` || 'Kidoo';
    const { title, message } = getNotificationContent(item.type, kidooName, t);

    return (
      <SwipeableNotificationItem
        item={item}
        title={title}
        message={message}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
      />
    );
  };

  return (
    <BottomSheet
      ref={bottomSheet.ref}
      name={bottomSheet.id}
      detents={['auto']}
      onDismiss={handleDismiss}
    >
      <View style={[styles.container, { paddingHorizontal: spacing[6] }]}>
        {/* Header */}
        <View style={[styles.header, { marginBottom: spacing[4] }]}>
          <Text level="h3" style={styles.headerTitle}>
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </Text>
          {notifications.length > 0 && (
            <Button
              title="Tout supprimer"
              variant="outline"
              onPress={handleClearAll}
              style={styles.clearButton}
            />
          )}
        </View>

        {/* Liste */}
        {isLoading ? (
          <ActivityIndicator color={colors.primary} size="large" />
        ) : error ? (
          <Text color="error">Erreur lors du chargement des notifications</Text>
        ) : notifications.length === 0 ? (
          <Text color="secondary" style={styles.emptyText}>
            Aucune notification
          </Text>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          />
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 32,
  },
});
