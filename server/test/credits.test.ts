import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { creditLedger, users } from '../src/db/schema.js';
import { DEFAULT_PRICING } from '../src/domain/pricing.js';
import { InsufficientCreditsError } from '../src/lib/errors.js';
import { createSecretBox } from '../src/services/auth.js';
import {
  addMonths,
  applySubscriptionState,
  chargeCredits,
  getBalance,
  grantCredits,
  nextRefillAfter,
  refundCharge,
} from '../src/services/credits.js';
import { deleteAccount, signInWithIdentity } from '../src/services/users.js';
import { pino } from 'pino';
import { openDatabase, type Database } from '../src/db/client.js';

const pricing = DEFAULT_PRICING;
const pro = pricing.plans.find((p) => p.id === 'pro')!;
const basic = pricing.plans.find((p) => p.id === 'basic')!;
const box = createSecretBox('test-secret');

describe('credits', () => {
  let database: Database;
  beforeAll(async () => {
    database = await openDatabase({ kind: 'pglite', dir: null });
  });
  afterAll(async () => {
    await database.close();
  });

  const newUser = async (subject: string) =>
    (
      await signInWithIdentity(
        database.db,
        pricing,
        { provider: 'google', subject, email: `${subject}@example.com`, name: subject, avatarUrl: null },
        { box },
      )
    ).user;

  it('grants starter credits once per identity, even across account deletion', async () => {
    const first = await signInWithIdentity(
      database.db,
      pricing,
      { provider: 'google', subject: 'starter-1', email: null, name: 'A', avatarUrl: null },
      { box },
    );
    expect(first.isNew).toBe(true);
    expect(first.starterCreditsGranted).toBe(pricing.starterCredits);
    expect((await getBalance(database.db, pricing, first.user.id)).bonus).toBe(pricing.starterCredits);

    const again = await signInWithIdentity(
      database.db,
      pricing,
      { provider: 'google', subject: 'starter-1', email: null, name: 'A', avatarUrl: null },
      { box },
    );
    expect(again.isNew).toBe(false);
    expect(again.user.id).toBe(first.user.id);
    expect(again.starterCreditsGranted).toBe(0);

    await deleteAccount(database.db, first.user.id, { apple: null, appleClientIds: [], box, logger: pino({ level: 'silent' }) });
    const recreated = await signInWithIdentity(
      database.db,
      pricing,
      { provider: 'google', subject: 'starter-1', email: null, name: 'A', avatarUrl: null },
      { box },
    );
    expect(recreated.isNew).toBe(true);
    expect(recreated.starterCreditsGranted).toBe(0);
    expect((await getBalance(database.db, pricing, recreated.user.id)).total).toBe(0);
  });

  it('charges plan credits before bonus credits and refunds to the same buckets exactly once', async () => {
    const user = await newUser('charge-1');
    await database.db.update(users).set({ planCredits: 2 }).where(eq(users.id, user.id));

    const charge = await chargeCredits(database.db, pricing, { userId: user.id, amount: 3, feature: 'youtube' });
    expect(charge).toMatchObject({ fromPlan: 2, fromBonus: 1 });
    expect(await getBalance(database.db, pricing, user.id)).toMatchObject({ plan: 0, bonus: pricing.starterCredits - 1 });

    expect(await refundCharge(database.db, user.id, charge.id)).toBe(3);
    expect(await refundCharge(database.db, user.id, charge.id)).toBe(0);
    expect(await getBalance(database.db, pricing, user.id)).toMatchObject({ plan: 2, bonus: pricing.starterCredits });
  });

  it('rejects charges larger than the balance', async () => {
    const user = await newUser('charge-2');
    await expect(
      chargeCredits(database.db, pricing, { userId: user.id, amount: pricing.starterCredits + 1, feature: 'recipe' }),
    ).rejects.toBeInstanceOf(InsufficientCreditsError);
    expect((await getBalance(database.db, pricing, user.id)).total).toBe(pricing.starterCredits);
  });

  it('never overspends under concurrent charges', async () => {
    const user = await newUser('charge-3');
    await database.db.update(users).set({ bonusCredits: 5, planCredits: 0 }).where(eq(users.id, user.id));
    const attempts = await Promise.allSettled(
      Array.from({ length: 8 }, () => chargeCredits(database.db, pricing, { userId: user.id, amount: 2, feature: 'recipe' })),
    );
    expect(attempts.filter((a) => a.status === 'fulfilled')).toHaveLength(2);
    expect((await getBalance(database.db, pricing, user.id)).total).toBe(1);
  });

  it('grants are idempotent', async () => {
    const user = await newUser('grant-1');
    const grant = { userId: user.id, bucket: 'bonus' as const, amount: 50, reason: 'topup', idempotencyKey: 'topup:txn-1' };
    expect(await grantCredits(database.db, grant)).toBe(true);
    expect(await grantCredits(database.db, grant)).toBe(false);
    expect((await getBalance(database.db, pricing, user.id)).bonus).toBe(pricing.starterCredits + 50);
  });

  it('resets plan credits each billing period and refills yearly plans monthly', async () => {
    const user = await newUser('plan-1');
    const start = new Date('2026-01-31T10:00:00Z');
    const yearEnd = new Date('2027-01-31T10:00:00Z');
    const state = { plan: pro, productId: 'cookreel_pro_yearly', periodStart: start, expiresAt: yearEnd };

    let balance = await applySubscriptionState(database.db, pricing, user.id, state, new Date('2026-01-31T10:05:00Z'));
    expect(balance).toMatchObject({ plan: pro.monthlyCredits, planId: 'pro', nextRefillAt: '2026-02-28T10:00:00.000Z' });

    // Re-syncing the same period must not top the allowance up again.
    await chargeCredits(database.db, pricing, { userId: user.id, amount: 10, feature: 'recipe' }, new Date('2026-01-31T12:00:00Z'));
    balance = await applySubscriptionState(database.db, pricing, user.id, state, new Date('2026-02-01T00:00:00Z'));
    expect(balance.plan).toBe(pro.monthlyCredits - 10);

    // A month later the allowance resets (lazy refill), anchored to the 31st.
    balance = await getBalance(database.db, pricing, user.id, new Date('2026-03-01T00:00:00Z'));
    expect(balance.plan).toBe(pro.monthlyCredits);
    expect(balance.nextRefillAt).toBe('2026-03-31T10:00:00.000Z');

    // Downgrade at renewal → new period with the smaller allowance.
    balance = await applySubscriptionState(
      database.db,
      pricing,
      user.id,
      { plan: basic, productId: 'cookreel_basic_monthly', periodStart: yearEnd, expiresAt: addMonths(yearEnd, 1) },
      new Date('2027-01-31T11:00:00Z'),
    );
    expect(balance).toMatchObject({ planId: 'basic', plan: basic.monthlyCredits });

    // Lapsed subscription: plan credits go, bonus credits stay.
    balance = await applySubscriptionState(database.db, pricing, user.id, null, new Date('2027-03-05T00:00:00Z'));
    expect(balance).toMatchObject({ planId: null, plan: 0, bonus: pricing.starterCredits });

    const ledger = await database.db.select().from(creditLedger).where(eq(creditLedger.userId, user.id));
    const sum = ledger.reduce((acc, row) => acc + row.delta, 0);
    expect(sum).toBe(balance.total);
  });

  it('expires a plan lazily when its end date passes', async () => {
    const user = await newUser('plan-2');
    const start = new Date('2026-05-01T00:00:00Z');
    await applySubscriptionState(
      database.db,
      pricing,
      user.id,
      { plan: basic, productId: 'cookreel_basic_monthly', periodStart: start, expiresAt: addMonths(start, 1) },
      start,
    );
    const balance = await getBalance(database.db, pricing, user.id, new Date('2026-06-02T00:00:00Z'));
    expect(balance).toMatchObject({ planId: null, plan: 0 });
  });

  it('computes month arithmetic without drift', () => {
    const anchor = new Date('2026-01-31T00:00:00Z');
    expect(addMonths(anchor, 1).toISOString()).toBe('2026-02-28T00:00:00.000Z');
    expect(addMonths(anchor, 2).toISOString()).toBe('2026-03-31T00:00:00.000Z');
    expect(addMonths(anchor, 13).toISOString()).toBe('2027-02-28T00:00:00.000Z');
    expect(nextRefillAfter(anchor, new Date('2026-04-15T00:00:00Z')).toISOString()).toBe('2026-04-30T00:00:00.000Z');
  });
});
