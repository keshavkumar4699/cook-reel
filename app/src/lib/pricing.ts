import { useEffect, useState } from 'react';
import { t, type MessageKey } from '@/i18n';
import { api, type Plan, type Pricing } from './api';

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

const PLAN_COPY: Record<string, { name: MessageKey; tagline: MessageKey; perks: MessageKey[] }> = {
  basic: {
    name: 'pricing.plans.basic.name',
    tagline: 'pricing.plans.basic.tagline',
    perks: ['pricing.plans.basic.perks.ai', 'pricing.plans.basic.perks.youtube', 'pricing.plans.basic.perks.topups'],
  },
  pro: {
    name: 'pricing.plans.pro.name',
    tagline: 'pricing.plans.pro.tagline',
    perks: ['pricing.plans.pro.perks.everything', 'pricing.plans.pro.perks.credits'],
  },
  max: {
    name: 'pricing.plans.max.name',
    tagline: 'pricing.plans.max.tagline',
    perks: ['pricing.plans.max.perks.everything', 'pricing.plans.max.perks.value'],
  },
};

/** A plan's name, tagline and perks in the app language; the server's English copy for plans the app doesn't know yet. */
export function planCopy(plan: Plan): { name: string; tagline: string; perks: string[] } {
  const copy = PLAN_COPY[plan.id];
  if (!copy) return { name: plan.name, tagline: plan.tagline, perks: plan.perks };
  return { name: t(copy.name), tagline: t(copy.tagline), perks: copy.perks.map((key) => t(key)) };
}

/** A plan's display name by id, e.g. for the balance badge; the server's name for unknown plans. */
export function planNameFor(planId: string | null, fallback: string | null): string | null {
  const copy = planId ? PLAN_COPY[planId] : undefined;
  return copy ? t(copy.name) : fallback;
}
