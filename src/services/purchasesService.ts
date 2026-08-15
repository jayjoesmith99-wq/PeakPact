export type PurchasePlan = {
  id: string;
  title: string;
  description: string;
  price: string;
  enabled: boolean;
};

export type PurchasePlanSummary = {
  monthly: PurchasePlan;
  yearly: PurchasePlan;
  lifetime: PurchasePlan;
};

export type EntitlementStatus = {
  isEntitled: boolean;
  activeProductIds: string[];
  source: 'native' | 'disabled';
  message: string;
};

export const REVENUECAT_ENTITLEMENT_ID = 'pro_access';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';

let purchasesModule: any = null;
let logLevelModule: { DEBUG?: string } | null = null;
let purchasesConfigured = false;

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

export function extractActiveProductIds(value: unknown): string[] {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const candidate = value as {
    entitlements?: { active?: Record<string, unknown> };
    activeSubscriptions?: string[];
    activeSubscriptionsList?: string[];
    activeEntitlements?: Record<string, unknown>;
  };

  const active = candidate.entitlements?.active ?? candidate.activeEntitlements;
  if (active && typeof active === 'object') {
    return Object.keys(active);
  }

  const directList = candidate.activeSubscriptions ?? candidate.activeSubscriptionsList ?? [];
  return Array.isArray(directList)
    ? directList.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

export function getPurchasePlanSummary(): PurchasePlanSummary {
  return {
    monthly: {
      id: 'monthly_premium',
      title: 'PeakPact Premium Monthly',
      description: 'Unlock elite guidance, unlimited squads, and premium execution intelligence.',
      price: '€9.99/month',
      enabled: true,
    },
    yearly: {
      id: 'yearly_premium',
      title: 'PeakPact Premium Yearly',
      description: 'One year of elite features with discounted annual pricing.',
      price: '€79.99/year',
      enabled: true,
    },
    lifetime: {
      id: 'lifetime_premium',
      title: 'PeakPact Premium Lifetime',
      description: 'One-time permanent unlock of all premium functionality.',
      price: '€199',
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

  if (!REVENUECAT_API_KEY) {
    return {
      isEntitled: false,
      activeProductIds: [],
      source: 'disabled',
      message: 'RevenueCat key missing. Set EXPO_PUBLIC_REVENUECAT_API_KEY.',
    };
  }

  try {
    if (purchasesConfigured) {
      return getEntitlementStatus();
    }

    purchases.setLogLevel(logLevelModule?.DEBUG ?? 'DEBUG');
    await purchases.configure({ apiKey: REVENUECAT_API_KEY });
    purchasesConfigured = true;
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

export type RevenueCatProductId =
  | 'monthly_premium'
  | 'yearly_premium'
  | 'lifetime_premium'
  | 'pp_pack'
  | 'pp_topup_custom';

export async function getCurrentOfferings(): Promise<unknown> {
  const purchases = getPurchasesClient() as ({ getOfferings?: () => Promise<unknown> } | null);
  if (!purchases?.getOfferings) {
    throw new Error('RevenueCat offerings are unavailable in this build.');
  }
  return purchases.getOfferings();
}

export async function purchaseProductById(productId: RevenueCatProductId): Promise<EntitlementStatus> {
  const purchases = getPurchasesClient() as ({
    getOfferings?: () => Promise<unknown>;
    getProducts?: (productIds: string[], type?: string) => Promise<unknown[]>;
    purchasePackage?: (pkg: unknown) => Promise<unknown>;
    purchaseStoreProduct?: (product: unknown) => Promise<unknown>;
  } | null);

  if (!purchases?.getOfferings || !purchases.purchasePackage || !purchases.purchaseStoreProduct) {
    return {
      isEntitled: false,
      activeProductIds: [],
      source: 'disabled',
      message: 'Purchases are unavailable in this build.',
    };
  }

  try {
    const offeringsResult = await purchases.getOfferings();
    const offerings = offeringsResult as {
      current?: { availablePackages?: Array<{ identifier?: string; product?: { identifier?: string } }> } | null;
      all?: Record<string, { availablePackages?: Array<{ identifier?: string; product?: { identifier?: string } }> }>;
    };
    const availablePackages = [
      ...(offerings.current?.availablePackages ?? []),
      ...Object.values(offerings.all ?? {}).flatMap((offering) => offering.availablePackages ?? []),
    ];
    const packageToPurchase = availablePackages.find(
      (pkg) => pkg.product?.identifier === productId || pkg.identifier === productId,
    );

    let purchaseResult: unknown;
    if (packageToPurchase) {
      purchaseResult = await purchases.purchasePackage(packageToPurchase);
    } else if (purchases.getProducts) {
      const products = await purchases.getProducts([productId], 'INAPP');
      const productToPurchase = products[0];
      if (!productToPurchase) {
        return {
          isEntitled: false,
          activeProductIds: [],
          source: 'disabled',
          message: `RevenueCat product is not available: ${productId}`,
        };
      }
      purchaseResult = await purchases.purchaseStoreProduct(productToPurchase);
    } else {
      return {
        isEntitled: false,
        activeProductIds: [],
        source: 'disabled',
        message: `RevenueCat product is not available: ${productId}`,
      };
    }

    const activeProductIds = extractActiveProductIds(purchaseResult);
    return {
      isEntitled: activeProductIds.includes(REVENUECAT_ENTITLEMENT_ID),
      activeProductIds,
      source: 'native',
      message: 'Purchase completed.',
    };
  } catch (error) {
    console.error(`RevenueCat Purchase Error (${productId}):`, error);
    return {
      isEntitled: false,
      activeProductIds: [],
      source: 'disabled',
      message: 'Purchase failed.',
    };
  }
}

export const purchaseMonthlyPremium = () => purchaseProductById('monthly_premium');
export const purchaseYearlyPremium = () => purchaseProductById('yearly_premium');
export const purchaseLifetimePremium = () => purchaseProductById('lifetime_premium');
export const purchasePPPack = () => purchaseProductById('pp_pack');
export const purchaseCustomPPTopUp = () => purchaseProductById('pp_topup_custom');

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
      isEntitled: activeProductIds.includes(REVENUECAT_ENTITLEMENT_ID),
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
      isEntitled: activeProductIds.includes(REVENUECAT_ENTITLEMENT_ID),
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
      isEntitled: activeProductIds.includes(REVENUECAT_ENTITLEMENT_ID),
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
