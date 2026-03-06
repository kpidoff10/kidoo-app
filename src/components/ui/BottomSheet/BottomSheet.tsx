/**
 * BottomSheet Component
 * Wrapper pour TrueSheet avec API simplifiée et styles par défaut
 * TrueSheet gère automatiquement les safe area insets
 */

import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import {
  useSafeAreaInsets,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { TrueSheet, TrueSheetProps } from '@lodev09/react-native-true-sheet';
import { Ionicons } from '@expo/vector-icons';
import { spacing, useTheme } from '@/theme';
import { Avatar } from '../Avatar/Avatar';
import { Text } from '../Typography/Text';
import { Title } from '../Typography/Title';

export interface BottomSheetProps extends Omit<TrueSheetProps, 'style' | 'onDidDismiss'> {
  /**
   * Style personnalisé pour le BottomSheet
   */
  style?: ViewStyle;
  
  /**
   * Détents (hauteurs) du sheet
   * Par défaut: ['auto']
   */
  detents?: TrueSheetProps['detents'];
  
  /**
   * Callback appelé lors de la fermeture
   * Mappé vers onDidDismiss de TrueSheet
   */
  onDismiss?: () => void;

  /**
   * Nom à afficher dans le header (avec Avatar)
   */
  headerName?: string;

  /**
   * Email à afficher dans le header (sous le nom)
   */
  headerEmail?: string;

  /**
   * Titre personnalisé à afficher dans le header (au lieu du nom)
   * Si fourni, remplace headerName pour l'affichage du titre
   */
  headerTitle?: string;

  /**
   * Icône à afficher dans le header (au lieu de l'Avatar)
   */
  headerIcon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Composant BottomSheet wrapper autour de TrueSheet
 * TrueSheet gère automatiquement les safe area insets
 * 
 * @example
 * ```tsx
 * const sheetRef = useRef<TrueSheet>(null);
 * 
 * <BottomSheet
 *   ref={sheetRef}
 *   detents={['auto']}
 *   onDismiss={() => console.log('Fermé')}
 * >
 *   <Text>Contenu</Text>
 * </BottomSheet>
 * ```
 */
export const BottomSheet = forwardRef<TrueSheet, BottomSheetProps>(
  ({ style, detents = ['auto'], onDismiss, children, headerName, headerEmail, headerTitle, headerIcon, scrollable, ...props }, ref) => {
    const { colors, borderRadius, spacing: themeSpacing } = useTheme();
    const insets = useSafeAreaInsets();

    // Quand scrollable : footer vide avec hauteur = zone sûre (TrueSheet recommande le footer pour ça)
    const safeBottom =
      insets.bottom || initialWindowMetrics?.insets?.bottom || 0;
    const footerHeight =
      Platform.OS === 'android' ? Math.max(safeBottom, 48) : safeBottom;
    const scrollableFooter = useMemo(
      () =>
        scrollable ? (
          <View style={{ height: footerHeight + themeSpacing[6] }} />
        ) : undefined,
      [scrollable, footerHeight, themeSpacing[6]]
    );

    const contentPaddingBottom = scrollable ? 0 : themeSpacing[6];
    const contentFlexStyle = scrollable ? { flex: 1, minHeight: 0 } : null;

    const defaultStyle: ViewStyle = {
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius['2xl'],
      borderTopRightRadius: borderRadius['2xl'],
      ...style,
    };

    const hasHeader = !!headerName || !!headerTitle;
    const displayTitle = headerTitle || headerName;
    const hasIcon = !!headerIcon;
    const hasAvatar = !!headerName && !headerIcon;

    return (
      <TrueSheet
        ref={ref}
        detents={detents}
        style={defaultStyle}
        backgroundColor={colors.surface}
        onDidDismiss={onDismiss ? () => onDismiss() : undefined}
        scrollable={scrollable}
        footer={scrollableFooter}
        {...props}
      >
        <View style={[styles.content, contentFlexStyle, { paddingBottom: contentPaddingBottom }]}>
          {hasHeader && (
            <View style={styles.header}>
              {hasIcon && (
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={headerIcon} size={32} color={colors.primary} />
                </View>
              )}
              {hasAvatar && (
                <Avatar name={headerName} size="xl" />
              )}
              {displayTitle && (
                <Title level="h3" style={{ marginTop: themeSpacing[4] }}>
                  {displayTitle}
                </Title>
              )}
              {headerEmail && (
                <Text color="secondary">{headerEmail}</Text>
              )}
            </View>
          )}
          {children}
        </View>
      </TrueSheet>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';


const styles = StyleSheet.create({
  content: {
    padding: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
