/**
 * Bottom sheets du détail Dream (nom, WiFi, luminosité, firmware, alerte nocturne).
 * Lit tout depuis useKidooDetailContext() + nighttimeAlertSheet passé en prop.
 */

import React from 'react';
import { EditKidooNameSheet } from '../../components/EditKidooNameSheet';
import { WiFiConfigSheet } from '../../components/WiFiConfigSheet';
import { BrightnessConfigSheet } from '../../components/BrightnessConfigSheet';
import { NighttimeAlertSheet } from '../features/NighttimeAlert';
import { FirmwareUpdateSheet } from '../../components/FirmwareUpdateSheet';
import { useKidooDetailContext } from '../../context';
import type { UseBottomSheetReturn } from '@/hooks';

interface DreamDetailSheetsProps {
  nighttimeAlertSheet: UseBottomSheetReturn;
}

export function DreamDetailSheets({ nighttimeAlertSheet }: DreamDetailSheetsProps) {
  const {
    kidoo,
    kidooId,
    editNameSheet,
    wifiConfigSheet,
    brightnessConfigSheet,
    firmwareUpdateSheet,
    checkOnline,
    latestFirmwareVersion,
    latestFirmwareChangelog,
    handleStartFirmwareUpdate,
    handleFirmwareUpdateSuccess,
  } = useKidooDetailContext();

  return (
    <>
      <EditKidooNameSheet bottomSheet={editNameSheet} kidoo={kidoo} />
      <WiFiConfigSheet
        bottomSheet={wifiConfigSheet}
        kidoo={kidoo}
        onComplete={() => checkOnline.mutate(kidooId)}
      />
      <BrightnessConfigSheet bottomSheet={brightnessConfigSheet} kidoo={kidoo} />
      <NighttimeAlertSheet bottomSheet={nighttimeAlertSheet} kidoo={kidoo} />
      {latestFirmwareVersion && (
        <FirmwareUpdateSheet
          bottomSheet={firmwareUpdateSheet}
          kidoo={kidoo}
          version={latestFirmwareVersion}
          changelog={latestFirmwareChangelog ?? null}
          onStartUpdate={handleStartFirmwareUpdate}
          onUpdateSuccess={handleFirmwareUpdateSuccess}
        />
      )}
    </>
  );
}
