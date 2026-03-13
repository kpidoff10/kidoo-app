/**
 * Home Screen
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { useProfile } from '@/hooks';
import { WelcomeCard } from './components/WelcomeCard';
import { NewsSection } from './components/NewsSection';

export function HomeScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: user } = useProfile();
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Welcome Card */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={{ paddingHorizontal: spacing[4], paddingVertical: spacing[4] }}>
          <WelcomeCard userName={user?.name || ''} />
        </View>
      </View>

      {/* Scrollable News Section */}
      <ScrollView
        style={styles.newsContainer}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={{ paddingHorizontal: spacing[4], paddingBottom: insets.bottom + spacing[4] }}>
          <NewsSection />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    paddingBottom: 0,
  },
  newsContainer: {
    flex: 1,
  },
});
