/**
 * FirmwareUpdateSheet
 * Bottom sheet pour afficher la nouvelle version firmware, le changelog,
 * et lancer la mise à jour (si le Kidoo est connecté) ou annuler.
 * Même principe que get-info : un seul appel API qui attend la réponse de l'ESP (done/failed).
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-markdown-display';
import { BottomSheet, Button } from '@/components/ui';
import { Text } from '@/components/ui/Typography/Text';
import { showToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme';
import { UseBottomSheetReturn } from '@/hooks/useBottomSheet';
import type { Kidoo } from '@/api/kidoos';

export type FirmwareUpdateResult =
  | { status: 'done'; version: string }
  | { status: 'failed'; error: string };

interface FirmwareUpdateSheetProps {
  bottomSheet: UseBottomSheetReturn;
  kidoo: Kidoo;
  /** Version du nouveau firmware (ex: "1.0.1") */
  version: string;
  /** Changelog en Markdown ou texte brut */
  changelog: string | null;
  /** Lance la MAJ et attend la réponse de l'ESP (comme get-info). Retourne done/failed ou lance en cas de timeout. */
  onStartUpdate?: () => Promise<FirmwareUpdateResult>;
  /** Appelé quand la MAJ réussit (pour rafraîchir le menu version firmware) */
  onUpdateSuccess?: (version: string) => void;
}

export function FirmwareUpdateSheet({
  bottomSheet,
  kidoo,
  version,
  changelog,
  onStartUpdate,
  onUpdateSuccess,
}: FirmwareUpdateSheetProps) {
  const { t } = useTranslation();
  const { spacing, colors } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  const isConnected = kidoo.isConnected;
  const hasChangelog = changelog != null && changelog.trim() !== '';

  const markdownStyles = useMemo(
    () => ({
      body: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
      paragraph: { marginTop: 0, marginBottom: 8 },
      heading1: { color: colors.text, fontSize: 18, marginBottom: 8 },
      heading2: { color: colors.text, fontSize: 16, marginBottom: 6 },
      heading3: { color: colors.text, fontSize: 14, marginBottom: 4 },
      list_item: { color: colors.textSecondary },
      bullet_list: { marginBottom: 8 },
      ordered_list: { marginBottom: 8 },
      strong: { color: colors.text },
      link: { color: colors.primary },
      code_inline: { color: colors.text, backgroundColor: colors.backgroundTertiary },
    }),
    [colors]
  );

  const closeAndReset = useCallback(async () => {
    await bottomSheet.close();
  }, [bottomSheet]);

  const handleDismiss = useCallback(() => {
    bottomSheet.handleDidDismiss({} as any);
  }, [bottomSheet]);

  const handleCancel = useCallback(async () => {
    if (isUpdating) return;
    await closeAndReset();
  }, [isUpdating, closeAndReset]);

  const handleStartUpdate = useCallback(async () => {
    if (!isConnected || !onStartUpdate) return;
    setIsUpdating(true);
    try {
      const result = await onStartUpdate();
      if (result.status === 'done') {
        onUpdateSuccess?.(result.version);
        showToast.success({
          title: t('kidoos.firmwareUpdate.done.title', { defaultValue: 'Mise à jour terminée' }),
          message: t('kidoos.firmwareUpdate.done.message', {
            version: result.version,
            defaultValue: `Version ${result.version} installée. Le Kidoo va redémarrer.`,
          }),
        });
        await closeAndReset();
      } else {
        const errorMessage =
          result.error === 'reflash'
            ? t('kidoos.firmwareUpdate.error.reflash', {
                defaultValue:
                  'Ce Kidoo doit être reflashé une fois via USB (câble) avec l’env dream pour activer les mises à jour OTA.',
              })
            : result.error;
        showToast.error({
          title: t('kidoos.firmwareUpdate.error.title', { defaultValue: 'Erreur' }),
          message: errorMessage,
        });
        await closeAndReset();
      }
    } catch {
      showToast.error({
        title: t('kidoos.firmwareUpdate.error.title', { defaultValue: 'Erreur' }),
        message: t('kidoos.firmwareUpdate.timeout', {
          defaultValue: 'Délai dépassé. Vérifiez que le Kidoo est bien connecté au WiFi.',
        }),
      });
      await closeAndReset();
    } finally {
      setIsUpdating(false);
    }
  }, [isConnected, onStartUpdate, onUpdateSuccess, closeAndReset, t]);

  return (
    <BottomSheet
      ref={bottomSheet.ref}
      name={bottomSheet.id}
      detents={['auto']}
      onDismiss={handleDismiss}
      headerTitle={t('kidoos.firmwareUpdate.title', { version, defaultValue: `Version ${version}` })}
      headerIcon="cloud-download-outline"
    >
      {hasChangelog ? (
        <ScrollView
          style={[styles.changelogScroll, { maxHeight: 240 }]}
          showsVerticalScrollIndicator
        >
          <Markdown style={markdownStyles}>{changelog!.trim()}</Markdown>
        </ScrollView>
      ) : (
        <Text color="secondary" style={{ marginBottom: spacing[4] }}>
          {t('kidoos.firmwareUpdate.noChangelog', { defaultValue: 'Aucun détail pour cette version.' })}
        </Text>
      )}

      {!isConnected && (
        <Text color="tertiary" style={{ marginBottom: spacing[4] }}>
          {t('kidoos.firmwareUpdate.offlineHint', {
            defaultValue: 'Le Kidoo doit être connecté au WiFi pour lancer la mise à jour.',
          })}
        </Text>
      )}

      <View style={styles.actions}>
        <Button
          title={t('common.cancel')}
          variant="outline"
          onPress={handleCancel}
          disabled={isUpdating}
          style={styles.cancelButton}
        />
        <Button
          title={t('kidoos.firmwareUpdate.startUpdate', { defaultValue: 'Lancer' })}
          variant="primary"
          onPress={handleStartUpdate}
          disabled={!isConnected || isUpdating}
          loading={isUpdating}
          style={styles.primaryButton}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  changelogScroll: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
  },
});
