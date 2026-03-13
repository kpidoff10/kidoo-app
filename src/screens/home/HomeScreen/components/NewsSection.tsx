/**
 * NewsSection Component
 * Section des actualités en carousel horizontal sur le HomeScreen
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/theme';
import { Text, Title, Badge, InfoBottomSheet } from '@/components/ui';
import { usePosts } from '@/hooks/usePosts';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { Post } from '@/api';

interface NewsSectionProps {
  limit?: number;
}

export function NewsSection({ limit = 5 }: NewsSectionProps) {
  const { colors, spacing } = useTheme();
  const { data: posts, isLoading } = usePosts(limit);
  const detailSheet = useBottomSheet();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handlePostPress = useCallback(
    (post: Post) => {
      setSelectedPost(post);
      detailSheet.open();
    },
    [detailSheet]
  );

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
        return 'UPDATE';
      case 'promo':
        return 'PROMO';
      case 'feature':
        return 'FEATURE';
      case 'news':
      default:
        return 'NEWS';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingVertical: spacing[4] }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <>
      <View style={[styles.container, { marginVertical: spacing[6] }]}>
        <Title level="h3" style={{ marginBottom: spacing[3] }}>
          📰 Actualités
        </Title>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.carousel}
          contentContainerStyle={{ paddingRight: spacing[6] }}
        >
          {posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  marginRight: spacing[3],
                  width: 280,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => handlePostPress(post)}
            >
              {/* Image */}
              {post.imageUrl && (
                <Image
                  source={{ uri: post.imageUrl }}
                  style={styles.cardImage}
                />
              )}

              {/* Content */}
              <View style={[styles.cardContent, { padding: spacing[3] }]}>
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
                      fontSize: 10,
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
                    fontSize: 14,
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
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginTop: spacing[1],
                    }}
                    numberOfLines={2}
                  >
                    {post.excerpt}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Detail BottomSheet */}
      {selectedPost && (
        <InfoBottomSheet
          bottomSheet={detailSheet}
          type="info"
          title={selectedPost.title}
          message={selectedPost.excerpt || undefined}
          actions={[
            {
              label: 'Fermer',
              onPress: () => detailSheet.close(),
              variant: 'outline',
            },
          ]}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  carousel: {
    marginHorizontal: -16, // Négatif du padding parent
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
