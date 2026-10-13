import { readFileSync } from 'node:fs';
import { z } from 'zod';

export type Feature = 'recipe' | 'experiment' | 'youtube' | 'youtubeShort';

const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string(),
  monthlyCredits: z.number().int().positive(),
  /**
   * Every store identifier that unlocks this plan, as RevenueCat reports them: App Store product IDs
   * and Play Store "subscriptionId:basePlanId" pairs (monthly and yearly).
   */
  productIds: z.array(z.string()).min(1),
  /** Fallback prices shown when the store can't be reached; the app prefers localized store prices. */
  displayPrice: z.object({ monthly: z.string(), yearly: z.string() }),
  highlight: z.boolean().default(false),
  perks: z.array(z.string()),
});

const TopupSchema = z.object({
  productId: z.string(),
  credits: z.number().int().positive(),
  displayPrice: z.string(),
});

export const PricingSchema = z.object({
  starterCredits: z.number().int().min(0),
  costs: z.object({
    recipe: z.number().int().min(0),
    experiment: z.number().int().min(0),
    youtube: z.number().int().min(0),
    youtubeShort: z.number().int().min(0),
  }),
  plans: z.array(PlanSchema).min(1),
  topups: z.array(TopupSchema),
  /** RevenueCat entitlement that unlocks subscriber-only perks such as top-ups. */
  entitlementId: z.string(),
});
export type Pricing = z.infer<typeof PricingSchema>;
export type Plan = z.infer<typeof PlanSchema>;

/**
 * Placeholder catalogue. Credit costs and allowances are business decisions — see the README's
 * "Unit economics" section before launch. Store prices must match the products in App Store
 * Connect / Play Console.
 */
export const DEFAULT_PRICING: Pricing = {
  starterCredits: 20,
  costs: { recipe: 1, experiment: 1, youtube: 3, youtubeShort: 2 },
  entitlementId: 'cookreel_plus',
  plans: [
    {
      id: 'basic',
      name: 'Basic',
      tagline: 'For a few new dishes every week',
      monthlyCredits: 60,
      productIds: ['cookreel_basic_monthly', 'cookreel_basic_yearly', 'cookreel_basic:monthly', 'cookreel_basic:yearly'],
      displayPrice: { monthly: '$2.99', yearly: '$24.99' },
      highlight: false,
      perks: ['60 credits every month', 'AI recipes & experiments', 'YouTube step reels'],
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'For people who cook most days',
      monthlyCredits: 200,
      productIds: ['cookreel_pro_monthly', 'cookreel_pro_yearly', 'cookreel_pro:monthly', 'cookreel_pro:yearly'],
      displayPrice: { monthly: '$6.99', yearly: '$54.99' },
      highlight: true,
      perks: ['200 credits every month', 'Everything in Basic', 'Top-up packs when you run out'],
    },
    {
      id: 'max',
      name: 'Max',
      tagline: 'Meal-preppers and recipe creators',
      monthlyCredits: 600,
      productIds: ['cookreel_max_monthly', 'cookreel_max_yearly', 'cookreel_max:monthly', 'cookreel_max:yearly'],
      displayPrice: { monthly: '$14.99', yearly: '$119.99' },
      highlight: false,
      perks: ['600 credits every month', 'Everything in Pro', 'Best price per credit'],
    },
  ],
  topups: [
    { productId: 'cookreel_credits_50', credits: 50, displayPrice: '$2.99' },
    { productId: 'cookreel_credits_150', credits: 150, displayPrice: '$7.99' },
    { productId: 'cookreel_credits_500', credits: 500, displayPrice: '$22.99' },
  ],
};

export function loadPricing(path: string | null): Pricing {
  if (!path) return DEFAULT_PRICING;
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  return PricingSchema.parse(raw);
}

/** Google Play identifiers may arrive as "productId:basePlanId"; match either form. */
const candidates = (productId: string) => [productId, productId.split(':')[0] ?? productId];

export function planForProduct(pricing: Pricing, productId: string): Plan | undefined {
  const ids = candidates(productId);
  return pricing.plans.find((plan) => plan.productIds.some((id) => ids.includes(id)));
}

export function topupForProduct(pricing: Pricing, productId: string) {
  const ids = candidates(productId);
  return pricing.topups.find((topup) => ids.includes(topup.productId));
}

export function planById(pricing: Pricing, planId: string | null | undefined): Plan | undefined {
  return planId ? pricing.plans.find((plan) => plan.id === planId) : undefined;
}

export function costOf(pricing: Pricing, feature: Feature): number {
  return pricing.costs[feature];
}
