/**
 * NotificationsScreen
 * Affiche la liste des notifications avec swipe-to-delete
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { ContentScrollView } from '@/components/ui';
import { useTheme, detailStyles } from '@/theme';
import {
  useNotifications,
  useDeleteNotification,
  useMarkNotificationAsRead,
  useClearAllNotifications,
  getNotificationContent,
  type Notification,
} from '@/hooks/useNotifications';
import { SwipeableNotificationItem } from '@/components/NotificationsBottomSheet/SwipeableNotificationItem';
import { RootStackParamList } from '@/navigation/types';

export function NotificationsScreen() {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading, error, refetch } = useNotifications(50, 0);
  const deleteNotification = useDeleteNotification();
  const markAsRead = useMarkNotificationAsRead();
  const clearAll = useClearAllNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const unreadAtOpenRef = useRef<Set<string>>(new Set());

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Refetch les notifications au focus de l'écran
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Stocker les IDs des notifications non lues à la première ouverture
  useEffect(() => {
    if (!isLoading && data?.notifications) {
      if (unreadAtOpenRef.current.size === 0) {
        const unreadIds = data.notifications
          .filter(n => !n.isRead)
          .map(n => n.id);
        unreadAtOpenRef.current = new Set(unreadIds);
      }
    }
  }, [isLoading, data?.notifications]);

  // Marquer toutes les notifications non lues comme lues une seule fois
  useEffect(() => {
    const unreadNotifications = data?.notifications?.filter(n => !n.isRead) ?? [];
    if (unreadNotifications.length > 0) {
      unreadNotifications.forEach(notification => {
        markAsRead.mutateAsync({ id: notification.id, isRead: true }).catch(() => {
          // Silencieusement ignorer les erreurs (ex: notification déjà supprimée)
        });
      });
    }
  }, [data?.notifications?.length]); // Dépendre du nombre, pas de l'array complet

  // Refetch quand une notification Expo est reçue
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      handleRefresh();
    });

    return () => {
      subscription.remove();
    };
  }, [handleRefresh]);

  // Configurer l'en-tête avec le titre et bouton supprimer tout
  useEffect(() => {
    const unreadCount = data?.unreadCount ?? 0;
    navigation.setOptions({
      headerTitle: `${t('notifications.title')} ${unreadCount > 0 ? `(${unreadCount})` : ''}`,
      headerTitleAlign: 'left',
    });
  }, [navigation, data?.unreadCount, t]);

  const notifications = data?.notifications ?? [];

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification.mutateAsync(id);
    } catch (error) {
      console.error('Erreur suppression notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      setIsClearing(true);
      await clearAll.mutateAsync();
      // Animation complète, reset state
      setTimeout(() => setIsClearing(false), 300);
    } catch (error) {
      console.error('Erreur suppression notifications:', error);
      setIsClearing(false);
    }
  };

  const renderNotification = ({ item, index }: { item: Notification; index: number }) => {
    const kidooName = item.kidoo?.name || `Kidoo ${item.kidooId?.slice(-4)}` || 'Kidoo';
    const { title, message } = getNotificationContent(item.type, kidooName, t);
    const isLast = index === notifications.length - 1;
    const wasUnreadAtOpen = unreadAtOpenRef.current.has(item.id);

    return (
      <SwipeableNotificationItem
        item={item}
        title={title}
        message={message}
        onDelete={handleDeleteNotification}
        isLast={isLast}
        isFirst={index === 0}
        wasUnreadAtOpen={wasUnreadAtOpen}
      />
    );
  };

  return (
    <View style={[detailStyles.container, { backgroundColor: colors.background }]}>
      <ContentScrollView
        style={detailStyles.scrollContent}
        contentContainerStyle={styles.contentContainer}
        contentPadding={0}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text color="error">{t('notifications.loadError')}</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.centered}>
            <Text color="secondary">{t('notifications.empty')}</Text>
          </View>
        ) : (
          <View style={[styles.listContainer, { backgroundColor: colors.surface }]}>
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </ContentScrollView>

      {/* Fixed button at bottom */}
      {notifications.length > 0 && (
        <View style={[styles.footer, { borderTopColor: colors.border, paddingHorizontal: spacing[4], paddingBottom: insets.bottom + spacing[4], backgroundColor: colors.background }]}>
          <View style={styles.clearAllButton}>
            <Button
              title={t('notifications.clearAll')}
              onPress={handleClearAll}
              style={{ backgroundColor: colors.error }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  listContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  clearAllButton: {
    width: '100%',
  },
});
