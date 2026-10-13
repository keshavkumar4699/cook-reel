import { Platform } from 'react-native';

type PurchasesModule = typeof import('react-native-purchases');
type Package = import('react-native-purchases').PurchasesPackage;

export interface StorePackage {
  id: string;
  productId: string;
  period: 'monthly' | 'yearly' | 'other';
  priceString: string;
  price: number;
  currency: string;
  /** Opaque handle passed back to `purchase`. */
  handle: unknown;
}

const apiKey = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

let mod: PurchasesModule | null = null;
let configuredFor: string | null | undefined;

function load(): PurchasesModule {
  if (!mod) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('react-native-purchases') as PurchasesModule;
  }
  return mod;
}

/**
 * Thin wrapper over RevenueCat. The RevenueCat app user ID is always our server's user ID, so
 * webhooks and the server-side sync can attribute purchases.
 */
export const purchases = {
  isSupported: () => !!apiKey,

  async identify(userId: string | null) {
    if (!apiKey) return;
    const { default: Purchases } = load();
    if (configuredFor === undefined) {
      Purchases.configure({ apiKey, appUserID: userId });
      configuredFor = userId;
      return;
    }
    if (userId && configuredFor !== userId) await Purchases.logIn(userId);
    if (!userId && configuredFor) await Purchases.logOut().catch(() => undefined);
    configuredFor = userId;
  },

  async packages(): Promise<StorePackage[]> {
    if (!apiKey) return [];
    const { default: Purchases } = load();
    const { PACKAGE_TYPE } = Purchases;
    const offerings = await Purchases.getOfferings();
    const all: Package[] = Object.values(offerings.all).flatMap((offering) => offering.availablePackages);
    return all.map((pkg) => ({
      id: pkg.identifier,
      productId: pkg.product.identifier,
      period: pkg.packageType === PACKAGE_TYPE.MONTHLY ? 'monthly' : pkg.packageType === PACKAGE_TYPE.ANNUAL ? 'yearly' : 'other',
      priceString: pkg.product.priceString,
      price: pkg.product.price,
      currency: pkg.product.currencyCode,
      handle: pkg,
    }));
  },

  async purchase(pkg: StorePackage): Promise<'purchased' | 'cancelled'> {
    const { default: Purchases } = load();
    const { PURCHASES_ERROR_CODE } = Purchases;
    try {
      await Purchases.purchasePackage(pkg.handle as Package);
      return 'purchased';
    } catch (error) {
      if ((error as { code?: string }).code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return 'cancelled';
      throw error;
    }
  },

  async restore() {
    const { default: Purchases } = load();
    await Purchases.restorePurchases();
  },
};
