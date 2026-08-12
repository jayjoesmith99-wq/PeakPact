import { Platform } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';

type TelemetryEvent =
  | 'language_selected'
  | 'tutorial_completed'
  | 'mission_created'
  | 'mission_completed'
  | 'squad_created'
  | 'squad_joined'
  | 'premium_viewed'
  | 'premium_started'
  | 'premium_restored'
  | 'retention_metrics'
  | 'startup_crash'
  | 'purchase_failure'
  | 'sync_failure'
  | 'squad_failure';

let webAnalytics: Analytics | null = null;
let nativeAnalytics: any = null;
let nativeCrashlytics: any = null;
let initialized = false;

function getFirebaseConfig() {
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
}

function hasFirebaseConfig() {
  const config = getFirebaseConfig();
  return !!(config.apiKey && config.projectId && config.appId);
}

async function initializeWebAnalytics() {
  if (Platform.OS !== 'web') return;
  if (!hasFirebaseConfig()) return;
  if (webAnalytics) return;

  const app = getApps().length > 0 ? getApps()[0] : initializeApp(getFirebaseConfig());
  if (await isSupported()) {
    webAnalytics = getAnalytics(app);
  }
}

function initializeNativeModules() {
  if (Platform.OS === 'web') return;
  try {
    nativeAnalytics = require('@react-native-firebase/analytics').default;
  } catch {
    nativeAnalytics = null;
  }

  try {
    nativeCrashlytics = require('@react-native-firebase/crashlytics').default;
  } catch {
    nativeCrashlytics = null;
  }
}

export async function initializeTelemetry() {
  if (initialized) return;
  initialized = true;

  initializeNativeModules();
  await initializeWebAnalytics();

  const maybeErrorUtils = (globalThis as any).ErrorUtils;
  if (maybeErrorUtils?.getGlobalHandler && maybeErrorUtils?.setGlobalHandler) {
    const defaultHandler = maybeErrorUtils.getGlobalHandler();
    maybeErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      void recordCrash('startup_crash', {
        message: error?.message,
        stack: error?.stack,
        fatal: !!isFatal,
      });
      if (typeof defaultHandler === 'function') {
        defaultHandler(error, isFatal);
      }
    });
  }
}

export async function trackEvent(event: TelemetryEvent, params?: Record<string, unknown>) {
  try {
    if (Platform.OS === 'web' && webAnalytics) {
      logEvent(webAnalytics, event, params);
      return;
    }

    if (nativeAnalytics) {
      await nativeAnalytics().logEvent(event, params || {});
    }
  } catch {
    // Keep analytics non-blocking.
  }
}

export async function trackRetentionMetrics(payload: {
  dayCount: number;
  streak: number;
  level: number;
}) {
  await trackEvent('retention_metrics', payload);
}

export async function recordCrash(kind: 'startup_crash' | 'purchase_failure' | 'sync_failure' | 'squad_failure', details?: Record<string, unknown>) {
  try {
    await trackEvent(kind, details);
    if (nativeCrashlytics) {
      nativeCrashlytics().log(`${kind}:${JSON.stringify(details || {})}`);
    }
  } catch {
    // Keep crash tracking non-blocking.
  }
}
