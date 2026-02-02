/**
 * ModelIcon Component
 * Affiche l'icône d'un modèle Kidoo (SVG ou Ionicons)
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { KidooModelId } from '@kidoo/shared';
import DreamIcon from '@/assets/dream.svg';
import { useTheme } from '@/theme';

export interface ModelIconProps {
  /**
   * Id du modèle Kidoo ('basic' | 'dream') — aligné sur l'enum partagé
   */
  model: KidooModelId;
  
  /**
   * Taille de l'icône
   */
  size?: number;
  
  /**
   * Couleur de l'icône (pour Ionicons et SVG)
   */
  color?: string;
  
  /**
   * Style personnalisé pour le conteneur
   */
  style?: ViewStyle;
}

/**
 * Composant pour afficher l'icône d'un modèle Kidoo
 * Utilise un SVG pour Dream, Ionicons pour les autres modèles
 */
export function ModelIcon({ model, size = 32, color, style }: ModelIconProps) {
  const { colors, isDark } = useTheme();

  // Pour le modèle Dream, utiliser le SVG avec couleur selon le thème
  if (model === 'dream') {
    const dreamIconColor = color || (isDark ? '#FFFFFF' : '#000000');
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <DreamIcon
          width={size}
          height={size}
          fill={dreamIconColor}
          color={dreamIconColor}
        />
      </View>
    );
  }

  // Pour basic (et tout autre id futur), utiliser Ionicons
  const iconColor = color || colors.primary;
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Ionicons name="cube-outline" size={size} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
