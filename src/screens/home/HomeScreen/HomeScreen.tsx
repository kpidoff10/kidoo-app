/**
 * Home Screen
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Title, Text, Card } from '@/components/ui';
import { useTheme } from '@/theme';
import { useKidoos, useProfile } from '@/hooks';
import { WelcomeCard } from './components/WelcomeCard';
import { NewsSection } from './components/NewsSection';

export function HomeScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: user } = useProfile();
  const { data: kidoos } = useKidoos();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      await queryClient.refetchQueries({ queryKey: ['posts'] });
    } finally {
      setIsRefreshing(false);
    }
  };

  const kidoosList = Array.isArray(kidoos) ? kidoos : [];
  const onlineKidoos = kidoosList.filter((k) => k.isConnected).length;
  const totalKidoos = kidoosList.length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { padding: spacing[4], paddingBottom: insets.bottom + 24 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <WelcomeCard userName={user?.name || ''} />

      <View style={{ marginTop: spacing[6] }}>
        <Title level="h3">{t('kidoos.title')}</Title>

        <View style={[styles.statsContainer, { marginTop: spacing[4], gap: spacing[4] }]}>
          <Card style={styles.statCard} variant="elevated">
            <Text variant="caption" color="secondary">
              Total
            </Text>
            <Title level="h2">{totalKidoos}</Title>
          </Card>

          <Card style={styles.statCard} variant="elevated">
            <Text variant="caption" color="secondary">
              {t('kidoos.online')}
            </Text>
            <Title level="h2" style={{ color: colors.success }}>
              {onlineKidoos}
            </Title>
          </Card>
        </View>
      </View>

      {totalKidoos === 0 && (
        <Card style={{ marginTop: spacing[6] }}>
          <Text color="secondary" center>
            {t('home.noKidoos')}
          </Text>
        </Card>
      )}

      {/* News Section */}
      <NewsSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
});
