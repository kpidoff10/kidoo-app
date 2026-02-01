/**
 * Secure Storage Utilities
 * Gestion sécurisée des tokens et données sensibles
 * Avec fallback localStorage pour le web
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Options pour que les tokens persistent après fermeture de l'app (iOS keychain / Android keystore)
const TOKEN_STORE_OPTIONS = Platform.OS === 'web' ? undefined : {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const KEYS = {
  ACCESS_TOKEN: 'kidoo_access_token',
  REFRESH_TOKEN: 'kidoo_refresh_token',
  USER_DATA: 'kidoo_user_data',
  BIOMETRIC_ENABLED: 'kidoo_biometric_enabled',
  DEVELOPER_MODE: 'kidoo_developer_mode',
} as const;

// Vérifier si on est sur le web
const isWeb = Platform.OS === 'web';

/**
 * Stocker une valeur de manière sécurisée.
 * SecureStore n'accepte que des chaînes ; les autres types sont rejetés.
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  if (typeof value !== 'string') {
    const msg = `SecureStore requires string values; got ${typeof value} for key ${key}. Use String() or JSON.stringify() for other types.`;
    console.error(msg);
    throw new Error(msg);
  }
  try {
    if (isWeb) {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value, TOKEN_STORE_OPTIONS);
    }
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    throw error;
  }
}

/**
 * Récupérer une valeur sécurisée
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (isWeb) {
      return localStorage.getItem(key);
    }
    let value = await SecureStore.getItemAsync(key, TOKEN_STORE_OPTIONS);
    // Fallback: lire sans options (tokens enregistrés avant l'ajout des options)
    if (value == null && TOKEN_STORE_OPTIONS) {
      value = await SecureStore.getItemAsync(key);
    }
    return value;
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
}

/**
 * Supprimer une valeur sécurisée
 */
export async function deleteSecureItem(key: string): Promise<void> {
  try {
    if (isWeb) {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key, TOKEN_STORE_OPTIONS);
    }
  } catch (error) {
    console.error(`Error deleting ${key}:`, error);
  }
}

// Token management
export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return getSecureItem(KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string): Promise<void> {
    return setSecureItem(KEYS.ACCESS_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return getSecureItem(KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    return setSecureItem(KEYS.REFRESH_TOKEN, token);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    const a = typeof accessToken === 'string' ? accessToken : (accessToken != null ? String(accessToken) : '');
    const r = typeof refreshToken === 'string' ? refreshToken : (refreshToken != null ? String(refreshToken) : '');
    if (!a || !r) {
      console.warn('setTokens: skipping store because one or both tokens are missing', { hasAccess: !!a, hasRefresh: !!r });
      return;
    }
    await Promise.all([
      setSecureItem(KEYS.ACCESS_TOKEN, a),
      setSecureItem(KEYS.REFRESH_TOKEN, r),
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      deleteSecureItem(KEYS.ACCESS_TOKEN),
      deleteSecureItem(KEYS.REFRESH_TOKEN),
    ]);
  },

  async hasTokens(): Promise<boolean> {
    const accessToken = await getSecureItem(KEYS.ACCESS_TOKEN);
    return !!accessToken;
  },
};

// Biometric settings
export const biometricStorage = {
  async isEnabled(): Promise<boolean> {
    const value = await getSecureItem(KEYS.BIOMETRIC_ENABLED);
    return value === 'true';
  },

  async setEnabled(enabled: boolean): Promise<void> {
    await setSecureItem(KEYS.BIOMETRIC_ENABLED, enabled ? 'true' : 'false');
  },
};

// Developer mode settings
export const developerStorage = {
  async isEnabled(): Promise<boolean> {
    const value = await getSecureItem(KEYS.DEVELOPER_MODE);
    return value === 'true';
  },

  async setEnabled(enabled: boolean): Promise<void> {
    await setSecureItem(KEYS.DEVELOPER_MODE, enabled ? 'true' : 'false');
  },
};
