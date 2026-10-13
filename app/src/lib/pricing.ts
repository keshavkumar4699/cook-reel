import { useEffect, useState } from 'react';
import { api, type Pricing } from './api';

/** Mirrors server/src/domain/pricing.ts so the UI works offline; the server's copy wins when reachable. */
export const FALLBACK_PRICING: Pricing = {
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
      perks: ['AI recipes, fridge mode & twists', 'YouTube & Shorts step reels', 'Top-up packs when you run out'],
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'For people who cook most days',
      monthlyCredits: 200,
      productIds: ['cookreel_pro_monthly', 'cookreel_pro_yearly', 'cookreel_pro:monthly', 'cookreel_pro:yearly'],
      displayPrice: { monthly: '$6.99', yearly: '$54.99' },
      highlight: true,
      perks: ['Everything in Basic', 'Over 3× the credits of Basic'],
    },
    {
      id: 'max',
      name: 'Max',
      tagline: 'Meal-preppers and recipe creators',
      monthlyCredits: 600,
      productIds: ['cookreel_max_monthly', 'cookreel_max_yearly', 'cookreel_max:monthly', 'cookreel_max:yearly'],
      displayPrice: { monthly: '$14.99', yearly: '$119.99' },
      highlight: false,
      perks: ['Everything in Pro', 'Best price per credit'],
    },
  ],
  topups: [
    { productId: 'cookreel_credits_50', credits: 50, displayPrice: '$2.99' },
    { productId: 'cookreel_credits_150', credits: 150, displayPrice: '$7.99' },
    { productId: 'cookreel_credits_500', credits: 500, displayPrice: '$22.99' },
  ],
};

let cached: Pricing | null = null;
let inflight: Promise<Pricing> | null = null;

export function loadPricing(): Promise<Pricing> {
  if (cached) return Promise.resolve(cached);
  inflight ??= api
    .pricing()
    .then((p) => (cached = p))
    .catch(() => FALLBACK_PRICING)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function usePricing(): Pricing {
  const [pricing, setPricing] = useState<Pricing>(cached ?? FALLBACK_PRICING);
  useEffect(() => {
    let alive = true;
    void loadPricing().then((p) => alive && setPricing(p));
    return () => {
      alive = false;
    };
  }, []);
  return pricing;
}
