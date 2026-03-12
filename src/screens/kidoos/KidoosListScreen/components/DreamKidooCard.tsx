/**
 * Carte Kidoo pour le modèle Dream
 * Affiche l'état (veilleuse / réveil), temp/humidité (compact) et l'accordéon d'actions.
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Text, Accordion } from '@/components/ui';
import { useTheme } from '@/theme';
import { Kidoo } from '@/api';
import { useKidooContext, useKidooEnvRealtime } from '@/contexts';
import { useDreamActivate, useKidooEnv, KIDOOS_KEY } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { BaseKidooCard } from './BaseKidooCard';

interface DreamKidooCardProps {
  kidoo: Kidoo;
  onPress: () => void;
  refreshTrigger?: number;
}

export function DreamKidooCard({ kidoo, onPress, refreshTrigger = 0 }: DreamKidooCardProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { getKidooModelHandler } = useKidooContext();
  const modelHandler = getKidooModelHandler(kidoo.id);
  const dreamActivate = useDreamActivate();

  const queryClient = useQueryClient();
  const realtimeEnv = useKidooEnvRealtime(kidoo.id);
  const { data: pollingEnv } = useKidooEnv(kidoo.id, {
    enabled: !!kidoo.id,
    refetchInterval: false,
  });
  const envData = realtimeEnv ?? pollingEnv;

  useEffect(() => {
    if (refreshTrigger > 0) {
      queryClient.invalidateQueries({ queryKey: [...KIDOOS_KEY, kidoo.id, 'env'] });
    }
  }, [refreshTrigger, kidoo.id, queryClient]);

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const accordionRotateAnim = useRef(new Animated.Value(0)).current;
  const accordionRef = useRef<{ toggle: () => void; isOpen: boolean } | null>(null);

  const handleAccordionToggle = useCallback((isOpen: boolean) => {
    setIsAccordionOpen(isOpen);
    Animated.timing(accordionRotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [accordionRotateAnim]);

  const customActions = modelHandler?.getCustomActions?.(kidoo, t, {
    onDreamActivate: () => dreamActivate.mutate(kidoo.id),
  }) ?? [];
  const hasModelActions = customActions.length > 0;

  const rotateInterpolate = accordionRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const hasTemp = envData?.available && envData.temperatureC != null;
  const hasHumidity = envData?.available && envData.humidityPercent != null;

  const renderSubtitle = useCallback(() => {
    const showDeviceState = kidoo.deviceState && kidoo.deviceState !== 'idle';
    const showEnv = hasTemp || hasHumidity;

    if (!showDeviceState && !showEnv) return null;

    return (
      <View style={{ marginTop: 2 }}>
        {showDeviceState && (
          <Text variant="caption" color="primary">
            {t(`kidoos.detail.deviceState.${kidoo.deviceState}`)}
          </Text>
        )}
        {showEnv && (
          <View style={[styles.envRow, { marginTop: showDeviceState ? 4 : 0 }]}>
            {hasTemp && (
              <View style={styles.envItem}>
                <Ionicons name="thermometer-outline" size={12} color={colors.textTertiary} />
                <Text variant="caption" color="tertiary" style={styles.envValue}>
                  {envData!.temperatureC!.toFixed(1)}°C
                </Text>
              </View>
            )}
            {hasHumidity && (
              <View style={[styles.envItem, hasTemp && { marginLeft: spacing[2] }]}>
                <Ionicons name="water-outline" size={12} color={colors.textTertiary} />
                <Text variant="caption" color="tertiary" style={styles.envValue}>
                  {envData!.humidityPercent!.toFixed(0)}%
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }, [kidoo.deviceState, t, hasTemp, hasHumidity, envData, colors.textTertiary, spacing]);

  const renderHeaderRight = useCallback(() => (
    <TouchableOpacity
      onPress={() => accordionRef.current?.toggle()}
      activeOpacity={0.7}
      style={styles.accordionButton}
    >
      <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </Animated.View>
    </TouchableOpacity>
  ), [rotateInterpolate, colors.textSecondary]);

  const renderActions = useCallback(() => {
    if (!hasModelActions) return null;
    return (
      <View
        style={[
          styles.accordionContainer,
          isAccordionOpen && {
            marginTop: spacing[2],
            paddingTop: spacing[2],
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Accordion
          defaultOpen={false}
          onToggle={handleAccordionToggle}
          onRef={(ref) => { accordionRef.current = ref; }}
        >
          {customActions.map((action) => {
            const isActivate = action.icon === 'play';
            const actionColor = isActivate ? '#10B981' : colors.primary;
            const isPending = dreamActivate.isPending;
            const isDisabled = action.disabled || isPending;

            return (
              <View key={action.id} style={styles.customActionRow}>
                <Pressable
                  onPress={action.onPress}
                  disabled={isDisabled}
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      borderColor: isDisabled ? colors.border : actionColor,
                      opacity: pressed && !isDisabled ? 0.8 : isDisabled ? 0.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.actionButtonContent}>
                    {isPending ? (
                      <ActivityIndicator size="small" color={isDisabled ? colors.border : actionColor} />
                    ) : (
                      <Ionicons
                        name={action.icon as any}
                        size={18}
                        color={isDisabled ? colors.border : actionColor}
                        style={styles.actionIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.actionButtonText,
                        {
                          color: isDisabled ? colors.border : actionColor,
                          opacity: isDisabled ? 0.8 : 1,
                        }
                      ]}
                    >
                      {isPending ? t('common.loading') : action.label}
                    </Text>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </Accordion>
      </View>
    );
  }, [
    hasModelActions,
    customActions,
    isAccordionOpen,
    spacing,
    colors,
    dreamActivate.isPending,
    handleAccordionToggle,
    t,
  ]);

  return (
    <BaseKidooCard
      kidoo={kidoo}
      onPress={onPress}
      refreshTrigger={refreshTrigger}
      renderSubtitle={renderSubtitle}
      renderHeaderRight={hasModelActions ? renderHeaderRight : undefined}
      renderActions={hasModelActions ? renderActions : undefined}
    />
  );
}

const styles = StyleSheet.create({
  envRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  envItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  envValue: {
    fontSize: 11,
  },
  accordionButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  accordionContainer: {},
  customActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  actionIcon: {
    marginRight: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
