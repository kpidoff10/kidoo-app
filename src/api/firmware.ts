/**
 * API Firmware
 * Dernière version disponible par modèle
 */

import { apiClient } from './client';
import type { KidooModelId } from '@kidoo/shared';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LatestFirmwareResponse {
  version: string | null;
  changelog: string | null;
}

export const firmwareApi = {
  /**
   * Récupérer la dernière version du firmware pour un modèle (version + changelog)
   */
  async getLatestVersion(model: KidooModelId): Promise<LatestFirmwareResponse> {
    const response = await apiClient.get<ApiResponse<LatestFirmwareResponse>>(
      `/api/firmware/latest?model=${encodeURIComponent(model)}`
    );
    return response.data.data;
  },
};

/**
 * Compare deux versions (format semver simple: 1.0.0, 1.0.1, etc.).
 * Retourne true si latest > current (mise à jour disponible).
 */
export function isNewerFirmwareVersion(current: string | undefined | null, latest: string | undefined | null): boolean {
  if (!latest || !current) return false;
  const parse = (v: string) => v.split('.').map((n) => parseInt(n, 10) || 0);
  const a = parse(current);
  const b = parse(latest);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (y > x) return true;
    if (y < x) return false;
  }
  return false;
}
