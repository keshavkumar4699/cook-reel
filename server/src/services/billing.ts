import { timingSafeEqual } from 'node:crypto';
import { eq, inArray } from 'drizzle-orm';
import type { Logger } from 'pino';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { users, webhookEvents } from '../db/schema.js';
import { planForProduct, topupForProduct, type Pricing } from '../domain/pricing.js';
import { HttpError } from '../lib/errors.js';
import { applySubscriptionState, getBalance, grantCredits, type Balance, type SubscriptionState } from './credits.js';

/* ------------------------------------------------------------------------------------------------
 * RevenueCat REST API (v1 subscriber endpoint) — the source of truth for what a user has paid for.
 * ---------------------------------------------------------------------------------------------- */

const isoDate = z.string().nullish();

const SubscriberSchema = z.object({
  subscriber: z.object({
    subscriptions: z
      .record(
        z.string(),
        z.object({
          purchase_date: isoDate,
          expires_date: isoDate,
          grace_period_expires_date: isoDate,
          refunded_at: isoDate,
        }),
      )
      .default({}),
    non_subscriptions: z
      .record(
        z.string(),
        z.array(
          z.object({
            id: z.string(),
            store_transaction_id: z.string().nullish(),
            purchase_date: isoDate,
          }),
        ),
      )
      .default({}),
  }),
});
export type RevenueCatSubscriber = z.infer<typeof SubscriberSchema>['subscriber'];

export interface RevenueCatClient {
  getSubscriber(appUserId: string): Promise<RevenueCatSubscriber>;
}

export function createRevenueCatClient(secretKey: string): RevenueCatClient {
  return {
    async getSubscriber(appUserId) {
      const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
        headers: { authorization: `Bearer ${secretKey}`, accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new HttpError(502, 'billing_unavailable', 'We could not reach the store to check your purchases.');
      return SubscriberSchema.parse(await res.json()).subscriber;
    },
  };
}

const toDate = (value: string | null | undefined) => (value ? new Date(value) : null);

/** Picks the most generous active subscription the user holds (handles upgrades and grace periods). */
export function activeSubscription(pricing: Pricing, subscriber: RevenueCatSubscriber, now: Date): SubscriptionState | null {
  let best: SubscriptionState | null = null;
  for (const [productId, sub] of Object.entries(subscriber.subscriptions)) {
    if (sub.refunded_at) continue;
    const plan = planForProduct(pricing, productId);
    if (!plan) continue;
    const expires = toDate(sub.expires_date);
    const grace = toDate(sub.grace_period_expires_date);
    const effectiveEnd = grace && (!expires || grace > expires) ? grace : expires;
    if (effectiveEnd && effectiveEnd.getTime() <= now.getTime()) continue;
    const periodStart = toDate(sub.purchase_date) ?? now;
    if (!best || plan.monthlyCredits > best.plan.monthlyCredits) {
      best = { plan, productId, periodStart, expiresAt: effectiveEnd };
    }
  }
  return best;
}

/** Brings the user's plan and top-up credits in line with RevenueCat. Idempotent. */
export async function syncBilling(
  db: Db,
  pricing: Pricing,
  revenueCat: RevenueCatClient,
  userId: string,
  now = new Date(),
): Promise<Balance> {
  const subscriber = await revenueCat.getSubscriber(userId);
  let balance = await applySubscriptionState(db, pricing, userId, activeSubscription(pricing, subscriber, now), now);

  let toppedUp = false;
  for (const [productId, purchases] of Object.entries(subscriber.non_subscriptions)) {
    const topup = topupForProduct(pricing, productId);
    if (!topup) continue;
    for (const purchase of purchases) {
      const granted = await grantCredits(db, {
        userId,
        bucket: 'bonus',
        amount: topup.credits,
        reason: 'topup',
        idempotencyKey: `topup:${purchase.store_transaction_id ?? purchase.id}`,
      });
      toppedUp ||= granted;
    }
  }
  if (toppedUp) balance = await getBalance(db, pricing, userId, now);
  return balance;
}

/* ------------------------------------------------------------------------------------------------
 * Webhook.
 * ---------------------------------------------------------------------------------------------- */

const WebhookSchema = z.object({
  event: z.object({
    id: z.string(),
    type: z.string(),
    app_user_id: z.string().nullish(),
    original_app_user_id: z.string().nullish(),
    aliases: z.array(z.string()).nullish(),
    transferred_from: z.array(z.string()).nullish(),
    transferred_to: z.array(z.string()).nullish(),
  }),
});

export function webhookAuthorized(expected: string | null, header: string | undefined): boolean {
  if (!expected || !header) return false;
  const provided = Buffer.from(header.replace(/^Bearer\s+/i, ''));
  const wanted = Buffer.from(expected.replace(/^Bearer\s+/i, ''));
  return provided.length === wanted.length && timingSafeEqual(provided, wanted);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Handles a RevenueCat webhook. Rather than trusting event payloads (which can arrive out of order),
 * each affected user is re-synced from the REST API.
 */
export async function handleRevenueCatWebhook(
  db: Db,
  pricing: Pricing,
  revenueCat: RevenueCatClient,
  body: unknown,
  logger: Logger,
): Promise<{ processed: boolean; users: number }> {
  const parsed = WebhookSchema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, 'invalid_request', 'Unrecognised webhook payload.');
  const { event } = parsed.data;

  const [seen] = await db.select({ id: webhookEvents.id }).from(webhookEvents).where(eq(webhookEvents.id, event.id));
  if (seen) return { processed: false, users: 0 };

  // Anonymous RevenueCat IDs ($RCAnonymousID:…) are not ours; app user IDs are our user UUIDs.
  const candidates = [
    event.app_user_id,
    event.original_app_user_id,
    ...(event.aliases ?? []),
    ...(event.transferred_from ?? []),
    ...(event.transferred_to ?? []),
  ].filter((id): id is string => !!id && UUID.test(id));
  const unique = [...new Set(candidates)];

  const known = unique.length && event.type !== 'TEST' ? await db.select({ id: users.id }).from(users).where(inArray(users.id, unique)) : [];
  // Sync first, record afterwards: if the store API is down the webhook fails and RevenueCat retries it.
  // Syncing is idempotent, so a duplicate delivery racing this one is harmless.
  for (const { id } of known) {
    await syncBilling(db, pricing, revenueCat, id);
  }
  await db
    .insert(webhookEvents)
    .values({ id: event.id, source: 'revenuecat', type: event.type, appUserId: event.app_user_id ?? null })
    .onConflictDoNothing();
  logger.info({ eventId: event.id, type: event.type, users: known.length }, 'revenuecat webhook processed');
  return { processed: true, users: known.length };
}
