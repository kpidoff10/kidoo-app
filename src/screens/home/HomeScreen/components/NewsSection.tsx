/**
 * NewsSection Component
 * Section des actualités en liste verticale avec lazy loading
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/theme';
import { Text, Title, InfoBottomSheet } from '@/components/ui';
import { HtmlRenderer } from '@/components/HtmlRenderer';
import { usePosts } from '@/hooks/usePosts';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { Post } from '@/api';

interface NewsSectionProps {
  initialLimit?: number;
}

const INITIAL_LOAD = 5;
const LOAD_MORE_STEP = 5;

export function NewsSection({ initialLimit = INITIAL_LOAD }: NewsSectionProps) {
  const { colors, spacing } = useTheme();
  const { data: allPosts, isLoading } = usePosts(100); // Charger max au serveur
  const detailSheet = useBottomSheet();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [displayCount, setDisplayCount] = useState(initialLimit);

  // Posts affichés (lazy loading)
  const posts = useMemo(
    () => (allPosts ? allPosts.slice(0, displayCount) : []),
    [allPosts, displayCount]
  );

  const handlePostPress = useCallback(
    (post: Post) => {
      setSelectedPost(post);
      detailSheet.open();
    },
    [detailSheet]
  );

  const handleLoadMore = useCallback(() => {
    if (allPosts && displayCount < allPosts.length) {
      setDisplayCount((prev) => Math.min(prev + LOAD_MORE_STEP, allPosts.length));
    }
  }, [allPosts, displayCount]);

  const getTypeColor = (type: Post['type']) => {
    switch (type) {
      case 'update':
        return colors.primary;
      case 'promo':
        return '#FFA500';
      case 'feature':
        return '#10B981';
      case 'news':
      default:
        return colors.textSecondary;
    }
  };

  const getTypeLabel = (type: Post['type']) => {
    switch (type) {
      case 'update':
        return 'Mise à jour';
      case 'promo':
        return 'Promo';
      case 'feature':
        return 'Nouveauté';
      case 'news':
      default:
        return 'Actualité';
    }
  };

  const renderPostCard = ({ item: post }: { item: Post }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          marginBottom: spacing[3],
        },
      ]}
      activeOpacity={0.7}
      onPress={() => handlePostPress(post)}
    >
      {/* Image */}
      {post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          style={[styles.cardImage, { width: '100%', height: 180 }]}
        />
      )}

      {/* Content */}
      <View style={[styles.cardContent, { padding: spacing[3], width: '100%' }]}>
        {/* Type Badge */}
        <View
          style={[
            styles.badge,
            {
              backgroundColor: getTypeColor(post.type) + '20',
            },
          ]}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: getTypeColor(post.type),
              letterSpacing: 0.5,
            }}
          >
            {getTypeLabel(post.type)}
          </Text>
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            marginTop: spacing[2],
            color: colors.text,
          }}
          numberOfLines={2}
        >
          {post.title}
        </Text>

        {/* Excerpt */}
        {post.excerpt && (
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              marginTop: spacing[1],
              lineHeight: 18,
            }}
            numberOfLines={3}
          >
            {post.excerpt}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!allPosts || displayCount >= allPosts.length) {
      return null;
    }

    return (
      <View style={[styles.loadMoreContainer, { paddingVertical: spacing[4] }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingVertical: spacing[4] }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!allPosts || allPosts.length === 0) {
    return null;
  }

  return (
    <>
      <View style={[styles.container, { marginVertical: spacing[6] }]}>
        <Title level="h3" style={{ marginBottom: spacing[3] }}>
          📰 Actualités
        </Title>

        <FlatList
          data={posts}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      </View>

      {/* Detail BottomSheet with HTML Content */}
      {selectedPost && (
        <InfoBottomSheet
          bottomSheet={detailSheet}
          type="info"
          title={selectedPost.title}
          message={selectedPost.excerpt || ''}
          scrollable={true}
          children={
            <ScrollView
              scrollEnabled={true}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              style={{ maxHeight: 300 }}
              contentContainerStyle={{ paddingHorizontal: spacing[3] }}
            >
              <HtmlRenderer
                html={selectedPost.content}
                textColor={colors.text}
                backgroundColor={colors.card}
              />
            </ScrollView>
          }
          actions={[
            {
              label: 'Fermer',
              onPress: () => detailSheet.close(),
              variant: 'outline',
            },
          ]}
          onDismiss={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: {
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    width: '100%',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
