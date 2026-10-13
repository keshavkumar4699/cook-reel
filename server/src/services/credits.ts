import { randomUUID } from 'node:crypto';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { creditLedger, users, type UserRow } from '../db/schema.js';
import { planById, type Feature, type Plan, type Pricing } from '../domain/pricing.js';
import { HttpError, InsufficientCreditsError } from '../lib/errors.js';

export type Bucket = 'plan' | 'bonus';

export interface Charge {
  id: string;
  userId: string;
  feature: Feature;
  fromPlan: number;
  fromBonus: number;
}

export interface Balance {
  total: number;
  plan: number;
  bonus: number;
  planId: string | null;
  planName: string | null;
  planExpiresAt: string | null;
  nextRefillAt: string | null;
  monthlyAllowance: number | null;
}

/* ---------------------------------------------------------------------------------------------- */

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Calendar-month arithmetic anchored to the original day (Jan 31 → Feb 28 → Mar 31). */
export function addMonths(anchor: Date, months: number): Date {
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth() + months;
  const targetYear = year + Math.floor(month / 12);
  const targetMonth = ((month % 12) + 12) % 12;
  const day = Math.min(anchor.getUTCDate(), daysInMonth(targetYear, targetMonth));
  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      day,
      anchor.getUTCHours(),
      anchor.getUTCMinutes(),
      anchor.getUTCSeconds(),
      anchor.getUTCMilliseconds(),
    ),
  );
}

/** First monthly refill strictly after `now`, counting whole months from the period anchor. */
export function nextRefillAfter(anchor: Date, now: Date): Date {
  let months = 1;
  let next = addMonths(anchor, months);
  while (next.getTime() <= now.getTime()) next = addMonths(anchor, ++months);
  return next;
}

/* ---------------------------------------------------------------------------------------------- */

async function lockUser(tx: Db, userId: string): Promise<UserRow> {
  const [user] = await tx.select().from(users).where(eq(users.id, userId)).for('update');
  if (!user) throw new HttpError(401, 'unauthorized', 'Your account no longer exists. Please sign in again.');
  return user;
}

/** Appends a ledger row; returns false when the idempotency key was already used. */
async function appendLedger(
  tx: Db,
  entry: { userId: string; bucket: Bucket; delta: number; reason: string; feature?: string | null; idempotencyKey: string },
): Promise<boolean> {
  const inserted = await tx
    .insert(creditLedger)
    .values({ ...entry, feature: entry.feature ?? null })
    .onConflictDoNothing({ target: creditLedger.idempotencyKey })
    .returning({ id: creditLedger.id });
  return inserted.length > 0;
}

/**
 * Lazily applies plan expiry and monthly refills. Must run inside a transaction holding the user's
 * row lock. Yearly plans get their allowance every month this way without a scheduler.
 */
async function settlePlan(tx: Db, pricing: Pricing, user: UserRow, now: Date): Promise<UserRow> {
  if (!user.planId) return user;

  if (user.planExpiresAt && user.planExpiresAt.getTime() <= now.getTime()) {
    if (user.planCredits !== 0) {
      await appendLedger(tx, {
        userId: user.id,
        bucket: 'plan',
        delta: -user.planCredits,
        reason: 'plan_expired',
        idempotencyKey: `expire:${user.id}:${user.planExpiresAt.toISOString()}`,
      });
    }
    const [updated] = await tx
      .update(users)
      .set({ planId: null, planProductId: null, planCredits: 0, planNextRefillAt: null })
      .where(eq(users.id, user.id))
      .returning();
    return updated ?? user;
  }

  if (user.planNextRefillAt && user.planNextRefillAt.getTime() <= now.getTime()) {
    const allowance = planById(pricing, user.planId)?.monthlyCredits ?? 0;
    const anchor = user.planPeriodStartedAt ?? user.planNextRefillAt;
    const recorded = await appendLedger(tx, {
      userId: user.id,
      bucket: 'plan',
      delta: allowance - user.planCredits,
      reason: 'plan_refill',
      idempotencyKey: `refill:${user.id}:${user.planNextRefillAt.toISOString()}`,
    });
    const [updated] = await tx
      .update(users)
      .set({
        planCredits: recorded ? allowance : user.planCredits,
        planNextRefillAt: nextRefillAfter(anchor, now),
      })
      .where(eq(users.id, user.id))
      .returning();
    return updated ?? user;
  }

  return user;
}

function toBalance(pricing: Pricing, user: UserRow): Balance {
  const plan = planById(pricing, user.planId);
  return {
    total: user.planCredits + user.bonusCredits,
    plan: user.planCredits,
    bonus: user.bonusCredits,
    planId: user.planId,
    planName: plan?.name ?? null,
    planExpiresAt: user.planId ? (user.planExpiresAt?.toISOString() ?? null) : null,
    nextRefillAt: user.planId ? (user.planNextRefillAt?.toISOString() ?? null) : null,
    monthlyAllowance: plan?.monthlyCredits ?? null,
  };
}

/* ---------------------------------------------------------------------------------------------- */

export async function getBalance(db: Db, pricing: Pricing, userId: string, now = new Date()): Promise<Balance> {
  return db.transaction(async (tx) => toBalance(pricing, await settlePlan(tx, pricing, await lockUser(tx, userId), now)));
}

/** Grants credits exactly once per idempotency key. Returns false if this grant already happened. */
export async function grantCredits(
  db: Db,
  grant: { userId: string; bucket: Bucket; amount: number; reason: string; idempotencyKey: string },
): Promise<boolean> {
  if (grant.amount <= 0) return false;
  return db.transaction(async (tx) => {
    await lockUser(tx, grant.userId);
    const recorded = await appendLedger(tx, {
      userId: grant.userId,
      bucket: grant.bucket,
      delta: grant.amount,
      reason: grant.reason,
      idempotencyKey: grant.idempotencyKey,
    });
    if (!recorded) return false;
    const column = grant.bucket === 'plan' ? users.planCredits : users.bonusCredits;
    await tx
      .update(users)
      .set(grant.bucket === 'plan' ? { planCredits: sql`${column} + ${grant.amount}` } : { bonusCredits: sql`${column} + ${grant.amount}` })
      .where(eq(users.id, grant.userId));
    return true;
  });
}

/**
 * Atomically takes `amount` credits (plan credits first, then bonus). Throws 402 when the balance is
 * too low. Concurrent requests are serialised on the user row, so the balance can never go negative.
 */
export async function chargeCredits(
  db: Db,
  pricing: Pricing,
  request: { userId: string; amount: number; feature: Feature },
  now = new Date(),
): Promise<Charge> {
  const id = randomUUID();
  if (request.amount <= 0) return { id, userId: request.userId, feature: request.feature, fromPlan: 0, fromBonus: 0 };

  return db.transaction(async (tx) => {
    const user = await settlePlan(tx, pricing, await lockUser(tx, request.userId), now);
    const available = user.planCredits + user.bonusCredits;
    if (available < request.amount) throw new InsufficientCreditsError(request.amount, available);

    const fromPlan = Math.min(user.planCredits, request.amount);
    const fromBonus = request.amount - fromPlan;
    for (const [bucket, amount] of [
      ['plan', fromPlan],
      ['bonus', fromBonus],
    ] as const) {
      if (amount === 0) continue;
      await appendLedger(tx, {
        userId: user.id,
        bucket,
        delta: -amount,
        reason: 'usage',
        feature: request.feature,
        idempotencyKey: `usage:${id}:${bucket}`,
      });
    }
    await tx
      .update(users)
      .set({ planCredits: user.planCredits - fromPlan, bonusCredits: user.bonusCredits - fromBonus })
      .where(eq(users.id, user.id));
    return { id, userId: user.id, feature: request.feature, fromPlan, fromBonus };
  });
}

/** Returns a charge's credits to the buckets they came from. Safe to call more than once. */
export async function refundCharge(db: Db, userId: string, chargeId: string): Promise<number> {
  return db.transaction(async (tx) => {
    await lockUser(tx, userId);
    const rows = await tx
      .select({ bucket: creditLedger.bucket, delta: creditLedger.delta, feature: creditLedger.feature })
      .from(creditLedger)
      .where(
        and(
          eq(creditLedger.userId, userId),
          inArray(creditLedger.idempotencyKey, [`usage:${chargeId}:plan`, `usage:${chargeId}:bonus`]),
        ),
      );
    let refunded = 0;
    for (const row of rows) {
      const amount = -row.delta;
      if (amount <= 0) continue;
      const bucket = row.bucket as Bucket;
      const recorded = await appendLedger(tx, {
        userId,
        bucket,
        delta: amount,
        reason: 'refund',
        feature: row.feature,
        idempotencyKey: `refund:${chargeId}:${bucket}`,
      });
      if (!recorded) continue;
      await tx
        .update(users)
        .set(bucket === 'plan' ? { planCredits: sql`${users.planCredits} + ${amount}` } : { bonusCredits: sql`${users.bonusCredits} + ${amount}` })
        .where(eq(users.id, userId));
      refunded += amount;
    }
    return refunded;
  });
}

export interface SubscriptionState {
  plan: Plan;
  productId: string;
  periodStart: Date;
  expiresAt: Date | null;
}

/**
 * Reconciles the user's plan with the store's view of their subscription. A new billing period (or a
 * plan change) resets plan credits to the plan's monthly allowance exactly once.
 */
export async function applySubscriptionState(
  db: Db,
  pricing: Pricing,
  userId: string,
  state: SubscriptionState | null,
  now = new Date(),
): Promise<Balance> {
  return db.transaction(async (tx) => {
    const user = await lockUser(tx, userId);

    if (!state) {
      if (!user.planId) return toBalance(pricing, user);
      const expiredAt = user.planExpiresAt && user.planExpiresAt.getTime() <= now.getTime() ? user.planExpiresAt : now;
      if (user.planCredits !== 0) {
        await appendLedger(tx, {
          userId,
          bucket: 'plan',
          delta: -user.planCredits,
          reason: 'plan_expired',
          idempotencyKey: `expire:${userId}:${expiredAt.toISOString()}`,
        });
      }
      const [updated] = await tx
        .update(users)
        .set({ planId: null, planProductId: null, planCredits: 0, planNextRefillAt: null, planExpiresAt: expiredAt })
        .where(eq(users.id, userId))
        .returning();
      return toBalance(pricing, updated ?? user);
    }

    const samePeriod =
      user.planId === state.plan.id &&
      user.planProductId === state.productId &&
      user.planPeriodStartedAt?.getTime() === state.periodStart.getTime();

    let planCredits = user.planCredits;
    let planNextRefillAt = user.planNextRefillAt;
    if (!samePeriod) {
      const recorded = await appendLedger(tx, {
        userId,
        bucket: 'plan',
        delta: state.plan.monthlyCredits - user.planCredits,
        reason: 'plan_period',
        idempotencyKey: `period:${userId}:${state.productId}:${state.periodStart.toISOString()}`,
      });
      if (recorded) {
        planCredits = state.plan.monthlyCredits;
        planNextRefillAt = nextRefillAfter(state.periodStart, now);
      }
    }

    const [updated] = await tx
      .update(users)
      .set({
        planId: state.plan.id,
        planProductId: state.productId,
        planPeriodStartedAt: state.periodStart,
        planExpiresAt: state.expiresAt,
        planCredits,
        planNextRefillAt,
      })
      .where(eq(users.id, userId))
      .returning();
    // A long-lived yearly plan may already be due for its next monthly refill.
    return toBalance(pricing, await settlePlan(tx, pricing, updated ?? user, now));
  });
}
