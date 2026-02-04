/**
 * Carte Kidoo de base
 * Affiche icône, nom, modèle, last seen. Les modèles spécifiques peuvent fournir
 * un sous-titre et un bloc d'actions (accordéon) via les props.
 */

import React, { useEffect } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Text, ModelIcon } from '@/components/ui';
import { useTheme } from '@/theme';
import { Kidoo } from '@/api';
import { getKidooModelDisplayName } from '@/config';
import { useKidooContext } from '@/contexts';
import moment from 'moment';

export interface BaseKidooCardProps {
  kidoo: Kidoo;
  onPress: () => void;
  /** Incrémenté par la liste au pull-to-refresh pour relancer get-info */
  refreshTrigger?: number;
  /** Contenu optionnel sous la ligne "Modèle" (ex: état device Dream) */
  renderSubtitle?: () => React.ReactNode;
  /** Élément optionnel à droite dans le header (ex: chevron accordéon) */
  renderHeaderRight?: () => React.ReactNode;
  /** Contenu optionnel sous le header (ex: accordéon d’actions) */
  renderActions?: () => React.ReactNode;
}

export function BaseKidooCard({
  kidoo,
  onPress,
  refreshTrigger = 0,
  renderSubtitle,
  renderHeaderRight,
  renderActions,
}: BaseKidooCardProps) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { checkOnline } = useKidooContext();

  useEffect(() => {
    if (kidoo.macAddress) {
      checkOnline.mutate(kidoo.id);
    }
  }, [kidoo.id, kidoo.macAddress, refreshTrigger]);

  const getLastSeenText = () => {
    if (!kidoo.lastConnected) return null;
    return t('kidoos.lastSeen', { time: moment(kidoo.lastConnected).fromNow() });
  };

  const hasActions = Boolean(renderActions);

  return (
    <Card variant="elevated" padding="sm" style={styles.card}>
      <View style={styles.headerContainer}>
        <Pressable
          onPress={onPress}
          android_ripple={{ color: 'transparent' }}
          style={({ pressed }) => [styles.header, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.iconContainer}>
            <ModelIcon model={kidoo.model} size={80} />
          </View>
          <View style={[styles.info, { marginLeft: spacing[4] }]}>
            <Text bold>{kidoo.name}</Text>
            <Text variant="caption" color="secondary">
              {t('kidoos.model')}: {getKidooModelDisplayName(kidoo.model)}
            </Text>
            {renderSubtitle?.()}
          </View>
        </Pressable>
        {hasActions && renderHeaderRight?.()}
      </View>

      {!kidoo.isConnected && kidoo.lastConnected && (
        <Text variant="caption" color="tertiary" style={{ marginTop: spacing[2] }}>
          {getLastSeenText()}
        </Text>
      )}

      {hasActions && renderActions?.()}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 0 },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
});
