/**
 * Hook pour savoir si une mise à jour firmware est disponible pour un Kidoo.
 * Compare la version installée (kidoo.firmwareVersion) avec la dernière version en base.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { firmwareApi, isNewerFirmwareVersion } from '@/api';
import type { Kidoo } from '@/api';
import { firmwareQueryKey } from '@/config/timings';

export interface UseFirmwareUpdateAvailableReturn {
  hasFirmwareUpdate: boolean;
  isLoading: boolean;
  /** Dernière version disponible (pour afficher "1.0.0 → 1.0.1" avec 1.0.1 en vert) */
  latestVersion: string | null;
  /** Changelog de la dernière version (pour le bottom sheet MAJ) */
  latestChangelog: string | null;
}

export function useFirmwareUpdateAvailable(kidoo: Kidoo | undefined): UseFirmwareUpdateAvailableReturn {
  const { data: latestFirmware, isLoading } = useQuery({
    queryKey: firmwareQueryKey(kidoo?.model ?? ''),
    queryFn: () => firmwareApi.getLatestVersion(kidoo!.model),
    enabled: !!kidoo?.model,
    staleTime: 0, // Toujours considérer les données périmées pour refetch (ex: après création 1.0.2 côté admin)
  });

  const hasFirmwareUpdate = useMemo(
    () =>
      !!latestFirmware?.version &&
      isNewerFirmwareVersion(kidoo?.firmwareVersion ?? null, latestFirmware.version),
    [kidoo?.firmwareVersion, latestFirmware?.version]
  );

  return {
    hasFirmwareUpdate,
    isLoading,
    latestVersion: latestFirmware?.version ?? null,
    latestChangelog: latestFirmware?.changelog ?? null,
  };
}
