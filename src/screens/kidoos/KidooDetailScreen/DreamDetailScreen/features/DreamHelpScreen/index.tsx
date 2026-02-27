/**
 * Dream Help Screen
 * Affiche la signification des couleurs des LEDs de la veilleuse Dream
 */

import React, { useLayoutEffect, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Defs, LinearGradient, Path, Stop, Svg } from 'react-native-svg';
import { ContentScrollView, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import DreamIconSvg from '@/assets/dream/dream.svg';
import DreamBodyIconSvg from '@/assets/dream/dream-body.svg';
import DreamLedIconSvg from '@/assets/dream/dream-led.svg';

/** Icônes Dream avec props typées (ledColor, baseColor via .svgrrc) */
const DreamIcon = DreamIconSvg as React.FC<
  React.ComponentProps<typeof DreamIconSvg> & {
    ledColor?: string;
    baseColor?: string;
    fill?: string;
  }
>;
const DreamBodyIcon = DreamBodyIconSvg as React.FC<
  React.ComponentProps<typeof DreamBodyIconSvg> & { baseColor?: string; fill?: string }
>;
const DreamLedIcon = DreamLedIconSvg as React.FC<
  React.ComponentProps<typeof DreamLedIconSvg> & { ledColor?: string; baseColor?: string }
>;

interface ColorItem {
  color: string | string[]; // hex ou tableau pour rainbow
  titleKey: string;
  descriptionKey: string;
  /** Si true, affiche un effet pulse rapide sur l'icône */
  pulse?: boolean;
  /** Si true, affiche un effet chase (couleur qui avance de gauche à droite) */
  spiral?: boolean;
}

const COLOR_ITEMS: ColorItem[] = [
  {
    color: '#FFB347',
    titleKey: 'kidoos.dream.help.colors.startup.title',
    descriptionKey: 'kidoos.dream.help.colors.startup.description',
    spiral: true,
  },
  {
    color: '#FF0000',
    titleKey: 'kidoos.dream.help.colors.red.title',
    descriptionKey: 'kidoos.dream.help.colors.red.description',
  },
  {
    color: '#22C55E',
    titleKey: 'kidoos.dream.help.colors.configLoaded.title',
    descriptionKey: 'kidoos.dream.help.colors.configLoaded.description',
    spiral: true,
  },
  {
    color: '#3399FF',
    titleKey: 'kidoos.dream.help.colors.pairing.title',
    descriptionKey: 'kidoos.dream.help.colors.pairing.description',
    pulse: true,
  },
  {
    color: ['#F5A3A3', '#FFCC99', '#FFEB99', '#99E699', '#99C2FF', '#C9A3FF'],
    titleKey: 'kidoos.dream.help.colors.rainbow.title',
    descriptionKey: 'kidoos.dream.help.colors.rainbow.description',
    spiral: true,
  },
  {
    color: '#FF0000',
    titleKey: 'kidoos.dream.help.colors.redPulse.title',
    descriptionKey: 'kidoos.dream.help.colors.redPulse.description',
    pulse: true,
  },
  {
    color: '#22C55E',
    titleKey: 'kidoos.dream.help.colors.childRequest.title',
    descriptionKey: 'kidoos.dream.help.colors.childRequest.description',
    pulse: true,
  },
  {
    color: ['#F5A3A3', '#FFCC99', '#FFEB99', '#99E699', '#99C2FF', '#C9A3FF'],
    titleKey: 'kidoos.dream.help.colors.parentResponse.title',
    descriptionKey: 'kidoos.dream.help.colors.parentResponse.description',
    spiral: true,
  },
];

const DREAM_ICON_SIZE = 88;

/** Assombrit une couleur hex (mélange avec noir) */
function darkenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const newR = Math.round(r * (1 - factor));
  const newG = Math.round(g * (1 - factor));
  const newB = Math.round(b * (1 - factor));
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/** Icône avec pulse sur la bande LED — anime l'opacité (compatible DreamLedIcon) */
function PulsingLedIcon({
  baseColor,
  ledColor,
}: {
  baseColor: string;
  ledColor: string;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 800 })
      ),
      -1,
      false
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value, // 0% => 100% => 0% => 100% ...
  }));

  return (
    <View style={{ width: DREAM_ICON_SIZE, height: DREAM_ICON_SIZE }}>
      <DreamBodyIcon
        width={DREAM_ICON_SIZE}
        height={DREAM_ICON_SIZE}
        baseColor={baseColor}
        fill={baseColor}
      />
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <DreamLedIcon
          width={DREAM_ICON_SIZE}
          height={DREAM_ICON_SIZE}
          ledColor={ledColor}
          baseColor={baseColor}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/** Largeur de la bande colorée (serpent) en % de l'icône */
const CHASE_BAND_WIDTH = 0.6;

/** Décalage gauche du LED dans dream-led.svg (path translate 406, viewBox 2047) */
const LED_VIEWBOX_OFFSET = 406 / 2047;
const VIEW_BOX = '0 0 2047 2048';
const LED_PATH_TRANSFORM = 'translate(406,805)';
const LED_PATH_D =
  'm0 0 5 3 14 12 6 4 18 14 14 10 16 12 28 20 10 7 34 24 39 27 14 9 11 7 23 14 20 12 21 12 17 9 21 9 18 6 16 4 21 3 26 2h69l42-4 62-8 70-10 99-15 57-9 70-11 72-12 92-16 25-5 37-7 36-8 28-7 25-8 18-7 16-8 11-7 4 1 10 7 4 8 7 13 2 12 1 17v86l-3 27-3 10-6 10-4 5-5 5-14 11-31 13-33 11-40 10-27 6-28 6-62 12-32 6-51 9-70 12-55 9-37 6-98 15-62 9-45 6-51 6-39 3h-66l-32-3-25-4-24-6-30-11-27-13-22-12-28-17-23-15-19-13-16-11-2-1v-2l-5-2-10-7-28-20-40-30-14-11-11-9-14-12-10-10-7-5-12-15-9-14-6-15-3-16v-86l1-30 3-13 6-10 9-10z';

/** Icône avec effet chase arc-en-ciel — bande multicolore qui avance */
function RainbowChaseLedIcon({
  baseColor,
  colors,
}: {
  baseColor: string;
  colors: string[];
}) {
  const progress = useSharedValue(0);
  const bandWidth = DREAM_ICON_SIZE * CHASE_BAND_WIDTH;
  const offsetLeft = LED_VIEWBOX_OFFSET * DREAM_ICON_SIZE;
  const startLeft = -offsetLeft * 2;
  const endLeft = DREAM_ICON_SIZE;
  const travelDistance = endLeft - startLeft;

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withDelay(1000, withTiming(1, { duration: 0 }))
      ),
      -1,
      false
    );
  }, [progress]);

  const bandStyle = useAnimatedStyle(() => ({
    left: startLeft + progress.value * travelDistance,
  }));

  const ledOffsetStyle = useAnimatedStyle(() => ({
    left: -(startLeft + progress.value * travelDistance),
  }));

  return (
    <View style={{ width: DREAM_ICON_SIZE, height: DREAM_ICON_SIZE }}>
      <DreamBodyIcon
        width={DREAM_ICON_SIZE}
        height={DREAM_ICON_SIZE}
        baseColor={baseColor}
        fill={baseColor}
      />
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: bandWidth,
              height: DREAM_ICON_SIZE,
              top: 0,
              overflow: 'hidden',
            },
            bandStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: DREAM_ICON_SIZE,
                height: DREAM_ICON_SIZE,
                top: 0,
              },
              ledOffsetStyle,
            ]}
          >
            <Svg
              width={DREAM_ICON_SIZE}
              height={DREAM_ICON_SIZE}
              viewBox={VIEW_BOX}
              style={StyleSheet.absoluteFill}
            >
              <Defs>
                <LinearGradient id="rainbow" x1="0" y1="0" x2="1" y2="0">
                  {colors.map((c, i) => (
                    <Stop key={i} offset={i / (colors.length - 1)} stopColor={c} />
                  ))}
                </LinearGradient>
              </Defs>
              <Path
                d={LED_PATH_D}
                transform={LED_PATH_TRANSFORM}
                fill="url(#rainbow)"
              />
            </Svg>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

/** Icône avec effet chase — bande de couleur qui avance (serpent qui se mord la queue) */
function ChaseLedIcon({
  baseColor,
  ledColor,
}: {
  baseColor: string;
  ledColor: string;
}) {
  const progress = useSharedValue(0);
  const bandWidth = DREAM_ICON_SIZE * CHASE_BAND_WIDTH;
  const offsetLeft = LED_VIEWBOX_OFFSET * DREAM_ICON_SIZE;
  const startLeft = -offsetLeft * 2;
  const endLeft = DREAM_ICON_SIZE;
  const travelDistance = endLeft - startLeft;

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }), // gauche => droite
        withDelay(1000, withTiming(1, { duration: 0 })) // pause 1 s à droite
      ),
      -1,
      false // reset à gauche puis re-boucle
    );
  }, [progress]);

  const bandStyle = useAnimatedStyle(() => ({
    left: startLeft + progress.value * travelDistance,
  }));

  const ledOffsetStyle = useAnimatedStyle(() => ({
    left: -(startLeft + progress.value * travelDistance),
  }));

  return (
    <View style={{ width: DREAM_ICON_SIZE, height: DREAM_ICON_SIZE }}>
      <DreamBodyIcon
        width={DREAM_ICON_SIZE}
        height={DREAM_ICON_SIZE}
        baseColor={baseColor}
        fill={baseColor}
      />
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: bandWidth,
              height: DREAM_ICON_SIZE,
              top: 0,
              overflow: 'hidden',
            },
            bandStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: DREAM_ICON_SIZE,
                height: DREAM_ICON_SIZE,
                top: 0,
              },
              ledOffsetStyle,
            ]}
          >
            <DreamLedIcon
              width={DREAM_ICON_SIZE}
              height={DREAM_ICON_SIZE}
              ledColor={ledColor}
              baseColor={baseColor}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

function DreamColorSwatch({
  color,
  baseColor,
  pulse,
  spiral,
}: {
  color: string | string[];
  baseColor: string;
  pulse?: boolean;
  spiral?: boolean;
}) {
  if (pulse && !Array.isArray(color)) {
    return <PulsingLedIcon baseColor={baseColor} ledColor={color} />;
  }
  if (spiral) {
    if (Array.isArray(color)) {
      return <RainbowChaseLedIcon baseColor={baseColor} colors={color} />;
    }
    return <ChaseLedIcon baseColor={baseColor} ledColor={color} />;
  }

  const renderIcon = (c: string, size: number) => (
    <DreamIcon
      width={size}
      height={size}
      ledColor={c}
      baseColor={baseColor}
      fill={baseColor}
    />
  );

  if (Array.isArray(color)) {
    return (
      <View style={styles.rainbowRow}>
        {color.map((c, i) => (
          <View key={i}>{renderIcon(c, 20)}</View>
        ))}
      </View>
    );
  }

  return renderIcon(color, DREAM_ICON_SIZE);
}

export function DreamHelpScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors, spacing, isDark } = useTheme();
  const dreamBaseColor = isDark ? '#FFFFFF' : '#000000';

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('kidoos.dream.help.title', { defaultValue: 'Aide' }),
    });
  }, [navigation, t]);

  return (
    <ContentScrollView>
      <View style={[styles.intro, { marginBottom: spacing[5] }]}>
        <Text variant="body" color="secondary" style={{ textAlign: 'center', lineHeight: 22 }}>
          {t('kidoos.dream.help.intro', {
            defaultValue:
              'La veilleuse Dream utilise des couleurs pour communiquer. Voici ce que signifie chaque indication :',
          })}
        </Text>
      </View>

      <View style={styles.list}>
        {COLOR_ITEMS.map((item, index) => (
          <View
            key={index}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                marginBottom: index < COLOR_ITEMS.length - 1 ? spacing[3] : 0,
              },
            ]}
          >
            <View style={styles.cardContent}>
              <DreamColorSwatch
                color={item.color}
                baseColor={dreamBaseColor}
                pulse={item.pulse}
                spiral={item.spiral}
              />
              <View style={[styles.cardText, { marginLeft: spacing[3] }]}>
                <Text variant="label" bold style={{ marginBottom: spacing[1] }}>
                  {t(item.titleKey)}
                </Text>
                <Text variant="caption" color="secondary" style={{ lineHeight: 20 }}>
                  {t(item.descriptionKey)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ContentScrollView>
  );
}

const styles = StyleSheet.create({
  intro: {
    paddingHorizontal: 4,
  },
  list: {
    width: '100%',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardText: {
    flex: 1,
  },
  rainbowRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
});
