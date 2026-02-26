/**
 * Kidoo App - Entry Point
 */

// Polyfill pour PubNub (build web) sur React Native : window.addEventListener n'existe pas
if (typeof global !== 'undefined' && typeof global.window === 'undefined') {
  global.window = global;
}
if (typeof window !== 'undefined' && typeof window.addEventListener !== 'function') {
  window.addEventListener = () => {};
  window.removeEventListener = () => {};
}

import * as Sentry from '@sentry/react-native';
import { registerRootComponent } from 'expo';
import { App } from './src/App.tsx';

// Initialiser Sentry AVANT tout le reste (uniquement en prod pour garder les logs Metro en dev)
// Le DSN sera configuré via EXPO_PUBLIC_SENTRY_DSN ou SENTRY_DSN
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const isDev = __DEV__;

if (sentryDsn && !isDev) {
  Sentry.init({
    dsn: sentryDsn,
    environment: 'production',
    // Options supplémentaires
    tracesSampleRate: 0.1,
    enableAutoSessionTracking: true,
    enableNativeCrashHandling: true,
    // Capturer toutes les erreurs non catchées
    beforeSend(event, hint) {
      // Toujours envoyer l'événement
      return event;
    },
    // Capturer les erreurs de promesses non gérées
    enableCaptureFailedRequests: true,
  });
  
  // Capturer les erreurs globales non catchées
  if (typeof ErrorUtils !== 'undefined') {
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      Sentry.captureException(error, {
        tags: {
          isFatal: String(isFatal),
          unhandled: 'true',
        },
      });
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
}

registerRootComponent(App);
