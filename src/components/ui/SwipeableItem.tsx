/**
 * SwipeableItem
 * Generic swipeable item component for swipe-to-delete interactions
 */

import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface SwipeableItemProps {
  children: ReactNode;
  onDelete: () => void;
  backgroundColor?: string;
  borderBottomColor?: string;
  borderBottomWidth?: number;
  isLast?: boolean;
  isFirst?: boolean;
  showHint?: boolean;
  deleteBackgroundColor?: string;
  deleteIcon?: ReactNode;
  deleteThresholdPercent?: number;
  deleteVelocityThreshold?: number;
}

export function SwipeableItem({
  children,
  onDelete,
  backgroundColor,
  borderBottomColor,
  borderBottomWidth = 1,
  isLast = false,
  isFirst = false,
  showHint = true,
  deleteBackgroundColor = '#FF3B30',
  deleteIcon,
  deleteThresholdPercent = 0.5,
  deleteVelocityThreshold = -800,
}: SwipeableItemProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [isDeleting, setIsDeleting] = useState(false);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const thresholdWidth = screenWidth * deleteThresholdPercent;
  const hintShown = useRef(false);

  // Hint animation - only first time
  useEffect(() => {
    if (isFirst && !hintShown.current && showHint) {
      hintShown.current = true;
      const timer = setTimeout(() => {
        const thirtyPercent = -screenWidth * 0.3;
        translateX.value = withTiming(thirtyPercent, {
          duration: 400,
          easing: Easing.inOut(Easing.ease),
        }, () => {
          setTimeout(() => {
            translateX.value = withTiming(0, {
              duration: 300,
              easing: Easing.inOut(Easing.ease),
            });
          }, 200);
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFirst, screenWidth, showHint]);

  // Call onDelete when item is deleted
  useEffect(() => {
    if (isDeleting) {
      const timer = setTimeout(() => {
        onDelete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isDeleting]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      } else if (translateX.value < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;

      // If swiped more than threshold or fast swipe, delete
      if (Math.abs(translationX) > thresholdWidth || velocityX < deleteVelocityThreshold) {
        runOnJS(setIsDeleting)(true);
        // Animate out
        translateX.value = withTiming(-500, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        });
        opacity.value = withTiming(0, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        });
      } else {
        // Snap back
        translateX.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        });
      }
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const deleteBackgroundStyle = useAnimatedStyle(() => ({
    width: Math.abs(translateX.value),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: backgroundColor,
            borderBottomColor: borderBottomColor,
            borderBottomWidth: isLast ? 0 : borderBottomWidth,
          },
        ]}
      >
        {/* Delete background */}
        <Animated.View
          style={[
            styles.deleteBackground,
            deleteBackgroundStyle,
            { backgroundColor: deleteBackgroundColor },
          ]}
        >
          {deleteIcon}
        </Animated.View>

        {/* Main content that slides */}
        <Animated.View
          style={[
            styles.content,
            contentStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  content: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 1,
  },
});
