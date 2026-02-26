/**
 * Carte Kidoo pour le modèle Dream
 * Affiche l'état (veilleuse / réveil), temp/humidité (compact) et l'accordéon d'actions.
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Text, Accordion } from '@/components/ui';
import { useTheme } from '@/theme';
import { Kidoo } from '@/api';
import { useKidooContext, useKidooEnvRealtime } from '@/contexts';
import { useControlDreamBedtime, useStopDreamRoutine, useKidooEnv, KIDOOS_KEY } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { BaseKidooCard } from './BaseKidooCard';

interface DreamKidooCardProps {
  kidoo: Kidoo;
  onPress: () => void;
  refreshTrigger?: number;
}

export function DreamKidooCard({ kidoo, onPress, refreshTrigger }: DreamKidooCardProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { getKidooModelHandler } = useKidooContext();
  const modelHandler = getKidooModelHandler(kidoo.id);
  const controlBedtime = useControlDreamBedtime();
  const stopRoutine = useStopDreamRoutine();

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
    onStartBedtime: () => controlBedtime.mutate({ id: kidoo.id, action: 'start' }),
    onStopBedtime: () => controlBedtime.mutate({ id: kidoo.id, action: 'stop' }),
    onStopRoutine: () => stopRoutine.mutate(kidoo.id),
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
            const actionColor =
              action.id === 'start-bedtime' || action.icon === 'play'
                ? '#10B981'
                : action.icon === 'stop' || action.icon === 'pause'
                  ? '#EF4444'
                  : colors.primary;
            const isPending = controlBedtime.isPending || stopRoutine.isPending;
            const isDisabled = action.disabled || isPending;
            return (
              <View key={action.id} style={styles.customActionRow}>
                <TouchableOpacity
                  onPress={action.onPress}
                  disabled={isDisabled}
                  activeOpacity={0.7}
                  style={[
                    styles.actionIconButton,
                    {
                      backgroundColor: isDisabled ? colors.border : actionColor,
                      opacity: isDisabled ? 0.5 : 1,
                    },
                  ]}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name={action.icon as any} size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={action.onPress}
                  disabled={isDisabled}
                  activeOpacity={0.7}
                  style={styles.actionLabelContainer}
                >
                  <Text style={[styles.actionButtonText, { color: colors.text, opacity: isDisabled ? 0.5 : 1 }]}>
                    {isPending ? 'Chargement...' : action.label}
                  </Text>
                </TouchableOpacity>
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
    controlBedtime.isPending,
    stopRoutine.isPending,
    handleAccordionToggle,
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
  actionIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionLabelContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 48,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
