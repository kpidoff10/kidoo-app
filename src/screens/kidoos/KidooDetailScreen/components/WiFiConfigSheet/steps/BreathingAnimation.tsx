/**
 * Animation de respiration bleue avec icône Dream
 * Pour indiquer que le Kidoo doit être en mode appairage/configuration (bleu pulse)
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/theme';
import DreamIconSvg from '@/assets/dream/dream.svg';

const DreamIcon = DreamIconSvg as React.FC<
  React.ComponentProps<typeof DreamIconSvg> & {
    ledColor?: string;
    baseColor?: string;
  }
>;

export function BreathingAnimation() {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation de respiration continue (bleu pulse)
    const breathingAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    breathingAnimation.start();

    return () => {
      breathingAnimation.stop();
    };
  }, [opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <DreamIcon width={120} height={120} ledColor={colors.primary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
