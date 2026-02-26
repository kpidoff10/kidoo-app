/**
 * Constantes de timing centralisées
 */

/** Intervalle de polling des données environnement (ms) */
export const ENV_POLL_INTERVAL_MS = 15_000;

/** Délai de debounce avant sauvegarde automatique (ms) */
export const SAVE_DEBOUNCE_MS = 500;

/** Clé React Query pour la dernière version firmware d'un modèle */
export const firmwareQueryKey = (model: string) =>
  ['firmware', 'latest', model] as const;

/** Délai avant check-online après démarrage routine (l'appareil doit passer en bedtime) */
export const CHECK_ONLINE_AFTER_START_MS = 2000;
