/**
 * NotificationsBellButton
 * Bouton cloche pour ouvrir l'écran des notifications
 * Anime la cloche quand y a des notifications non lues
 */

import React, { useEffect, useRef } from 'react';
import { Pressable, View, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/theme';
import { Text } from '@/components/ui/Typography';
import { RootStackParamList } from '@/navigation/types';

interface NotificationsBellButtonProps {
  size?: number;
}

export function NotificationsBellButton({ size = 24 }: NotificationsBellButtonProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, refetch } = useNotifications(50, 0);

  const unreadCount = data?.unreadCount ?? 0;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refetch au démarrage
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Refetch quand une notification Expo est reçue
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      refetch();
    });

    return () => {
      subscription.remove();
    };
  }, [refetch]);

  // Animation de sonnerie quand il y a des notifications
  useEffect(() => {
    // Nettoyer le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (unreadCount > 0) {
      // Boucle animation: shake gauche-droite
      const animate = () => {
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Répéter l'animation tous les 2 secondes (seulement si unreadCount > 0)
          if (unreadCount > 0) {
            timeoutRef.current = setTimeout(animate, 2000);
          }
        });
      };

      animate();
    } else {
      // Réinitialiser si pas de notifications
      rotateAnim.setValue(0);
    }

    // Cleanup: nettoyer le timeout au démontage ou quand unreadCount change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [unreadCount, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <Pressable onPress={() => navigation.navigate('Notifications')} style={styles.button}>
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <Ionicons name="notifications" size={size} color={colors.primary} />
      </Animated.View>
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.error }]}>
          <Text style={[styles.badgeText, { color: '#fff' }]}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
