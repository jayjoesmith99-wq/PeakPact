export type PurchasePlan = {
  id: string;
  title: string;
  description: string;
  price: string;
  enabled: boolean;
};

export type PurchasePlanSummary = {
  monthly: PurchasePlan;
  lifetime: PurchasePlan;
};

export type EntitlementStatus = {
  isEntitled: boolean;
  activeProductIds: string[];
  source: 'native' | 'disabled';
  message: string;
};

const REVENUECAT_API_KEY = 'test_EkRWwTbbsUcXStanIWZNYLGIowZ';

let purchasesModule: any = null;
let logLevelModule: { DEBUG?: string } | null = null;

try {
  purchasesModule = require('react-native-purchases');
  const resolvedModule = purchasesModule.default ?? purchasesModule;
  purchasesModule = resolvedModule;
  logLevelModule = purchasesModule.LOG_LEVEL ?? { DEBUG: 'DEBUG' };
} catch {
  purchasesModule = null;
  logLevelModule = { DEBUG: 'DEBUG' };
}

function getPurchasesClient() {
  return purchasesModule as {
    setLogLevel?: (level: string) => void;
    configure?: (config: { apiKey: string }) => Promise<unknown>;
    restorePurchases?: () => Promise<unknown>;
    purchasePackage?: (pkg: unknown) => Promise<unknown>;
    getCustomerInfo?: () => Promise<unknown>;
  } | null;
}

function extractActiveProductIds(value: unknown): string[] {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const candidate = value as { entitlements?: { active?: Record<string, unknown> } };
  const active = candidate.entitlements?.active;
  if (!active || typeof active !== 'object') {
    return [];
  }

  return Object.keys(active);
}

export function getPurchasePlanSummary(): PurchasePlanSummary {
  return {
    monthly: {
      id: 'monthly',
      title: 'PeakPact Pro',
      description: 'Unlock unlimited mission planning, analytics, and premium themes.',
      price: '$4.99/mo',
      enabled: true,
    },
    lifetime: {
      id: 'lifetime',
      title: 'PeakPact Lifetime',
      description: 'One-time access to premium features and all current themes.',
      price: '$29.99',
      enabled: true,
    },
  };
}

export async function initializePurchases(): Promise<EntitlementStatus> {
  const purchases = getPurchasesClient();
  if (!purchases?.setLogLevel || !purchases.configure) {
    return {
      isEntitled: false,
      activeProductIds: [],
      source: 'disabled',
      message: 'Purchases are unavailable in this build.',
    };
  }

  try {
    purchases.setLogLevel(logLevelModule?.DEBUG ?? 'DEBUG');
    await purchases.configure({ apiKey: REVENUECAT_API_KEY });
    return {
      isEntitled: false,
      activeProductIds: [],
      source: 'native',
      message: 'Purchases initialized.',
    };
  } catch (error) {
    console.error('RevenueCat Init Error:', error);
    return {
      isEntitled: false,
      activeProductIds: [],
      source: 'disabled',
      message: 'Purchases could not be initialized.',
    };
  }
}

export async function restorePurchases(): Promise<EntitlementStatus> {
  const purchases = getPurchasesClient();
  if (!purchases?.restorePurchases) {
    return {
      isEntitled: false,
      activeProductIds: [],
      source: 'disabled',
      message: 'Restore is unavailable in this build.',
    };
  }

  try {
    const customerInfo = await purchases.restorePurchases();
    const activeProductIds = extractActiveProductIds(customerInfo);
    return {
      isEntitled: activeProductIds.length > 0,
      activeProductIds,
      source: 'native',
      message: 'Restore completed.',
    };
  } catch (error) {
    console.error('RevenueCat Restore Error:', error);
    return {
      isEntitled: false,
      activeProductIds: [],
      source: 'disabled',
      message: 'Restore failed.',
    };
  }
}

export async function purchasePackage(pkg: unknown): Promise<EntitlementStatus> {
  const purchases = getPurchasesClient();
  if (!purchases?.purchasePackage) {
    return {
      isEntitled: false,
      activeProductIds: [],
      source: 'disabled',
      message: 'Purchases are unavailable in this build.',
    };
  }

  try {
    const purchaseResult = await purchases.purchasePackage(pkg);
    const activeProductIds = extractActiveProductIds(purchaseResult);
    return {
      isEntitled: activeProductIds.length > 0,
      activeProductIds,
      source: 'native',
      message: 'Purchase completed.',
    };
  } catch (error) {
    console.error('RevenueCat Purchase Error:', error);
    return {
      isEntitled: false,
      activeProductIds: [],
      source: 'disabled',
      message: 'Purchase failed.',
    };
  }
}

export async function getEntitlementStatus(): Promise<EntitlementStatus> {
  const purchases = getPurchasesClient();
  if (!purchases?.getCustomerInfo) {
    return {
      isEntitled: false,
      activeProductIds: [],
      source: 'disabled',
      message: 'Entitlements are unavailable in this build.',
    };
  }

  try {
    const customerInfo = await purchases.getCustomerInfo();
    const activeProductIds = extractActiveProductIds(customerInfo);
    return {
      isEntitled: activeProductIds.length > 0,
      activeProductIds,
      source: 'native',
      message: 'Entitlements refreshed.',
    };
  } catch (error) {
    console.error('RevenueCat Entitlement Error:', error);
    return {
      isEntitled: false,
      activeProductIds: [],
      source: 'disabled',
      message: 'Entitlements could not be refreshed.',
    };
  }
}
