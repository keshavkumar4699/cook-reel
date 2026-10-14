import { t } from '@/i18n';
import { LocalizedError } from '@/lib/errors';

export interface StorePackage {
  id: string;
  productId: string;
  period: 'monthly' | 'yearly' | 'other';
  priceString: string;
  price: number;
  currency: string;
  handle: unknown;
}

/** Purchases happen through the App Store / Play Store; the web preview shows catalogue prices only. */
export const purchases = {
  isSupported: () => false,
  async identify(_userId: string | null) {},
  async packages(): Promise<StorePackage[]> {
    return [];
  },
  async purchase(_pkg: StorePackage): Promise<'purchased' | 'cancelled'> {
    throw new LocalizedError(t('auth.errors.purchasesAppsOnly'));
  },
  async restore() {},
};
