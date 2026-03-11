/**
 * DefaultColorConfig Screen
 * Écran pour configurer la couleur/effet par défaut au tap (Dream)
 * Avec debounce, mutation optimiste et sauvegarde automatique (comme Bedtime)
 */

import React, { useLayoutEffect, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { ContentScrollView, Text, InfoBox, ScreenLoader } from '@/components/ui';
import { useTheme } from '@/theme';
import { useDreamDefaultColor } from '@/hooks';
import { BrightnessSection, useConfigScreenBase } from '../../../../shared';
import { ColorOrEffectSection, CardSection } from './components';
import { rgbToHex } from '@/utils/color';

type RouteParams = {
  kidooId: string;
};

export function DefaultColorConfigScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { kidooId } = (route.params as RouteParams) || {};

  const {
    colorR,
    colorG,
    colorB,
    brightness: configBrightness,
    effect: configEffect,
    isLoading,
    updateDefaultColor,
  } = useDreamDefaultColor(kidooId);

  const { isReady, debouncedSave, isInitializingRef, configLoadedRef } =
    useConfigScreenBase({ kidooId, isLoading });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('kidoos.dream.defaultColor.title', { defaultValue: 'Couleur par défaut' }),
    });
  }, [navigation, t]);

  const { control, reset, watch, getValues } = useForm({
    defaultValues: {
      color: '#FF0000',
      effect: null as string | null,
      brightness: 50,
    },
  });

  useEffect(() => {
    if (!isLoading && !configLoadedRef.current) {
      isInitializingRef.current = true;
      const colorHex = rgbToHex(colorR, colorG, colorB);
      reset({
        color: colorHex,
        effect: configEffect || null,
        brightness: configBrightness,
      });
      requestAnimationFrame(() => {
        configLoadedRef.current = true;
        isInitializingRef.current = false;
      });
    }
  }, [colorR, colorG, colorB, configBrightness, configEffect, isLoading, reset]);

  const saveConfig = useCallback(() => {
    if (!isReady()) return;

    debouncedSave(() => {
      const { color: formColor, effect, brightness } = getValues();
      const color = formColor || '#FF0000';

      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      updateDefaultColor({
        colorR: r,
        colorG: g,
        colorB: b,
        brightness: brightness ?? 50,
        effect: effect && effect !== 'none' ? effect : null,
      });
    });
  }, [isReady, getValues, updateDefaultColor, debouncedSave]);

  const color = watch('color');
  const effect = watch('effect');
  const brightness = watch('brightness');

  useEffect(() => {
    if (!isInitializingRef.current && configLoadedRef.current) {
      saveConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, effect, brightness]);

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ContentScrollView>
        <View style={styles.content}>
          <Text variant="body" color="secondary">
            {t('kidoos.dream.defaultColor.description', {
              defaultValue:
                'Configurez la couleur et la luminosité affichées par défaut quand vous appuyez sur la veilleuse sans routine programmée.',
            })}
          </Text>

          <InfoBox
            message={t('kidoos.dream.defaultColor.info', {
              defaultValue:
                "Cette couleur s'affichera en appuyant sur le bouton tactile si aucune routine n'est prévue.",
            })}
          />

          {!isLoading && (
            <CardSection
              title={t('kidoos.dream.defaultColor.appearance', { defaultValue: 'Apparence' })}
            >
              <ColorOrEffectSection control={control} />
              <View style={{ marginTop: 12 }}>
                <BrightnessSection control={control} i18nPrefix="kidoos.dream.defaultColor" />
              </View>
            </CardSection>
          )}
        </View>
      </ContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
