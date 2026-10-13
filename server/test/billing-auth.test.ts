import { pino } from 'pino';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DEFAULT_PRICING } from '../src/domain/pricing.js';
import { createSecretBox, createSessionSigner } from '../src/services/auth.js';
import { activeSubscription, handleRevenueCatWebhook, syncBilling, webhookAuthorized } from '../src/services/billing.js';
import { getBalance } from '../src/services/credits.js';
import { signInWithIdentity } from '../src/services/users.js';
import { createTestContext, GOOGLE_CLIENT_ID, type TestContext } from './helpers.js';

const pricing = DEFAULT_PRICING;
const logger = pino({ level: 'silent' });

describe('activeSubscription', () => {
  const now = new Date('2026-06-15T00:00:00Z');
  it('picks the most generous active plan and honours grace periods', () => {
    const state = activeSubscription(
      pricing,
      {
        subscriptions: {
          cookreel_basic_monthly: { purchase_date: '2026-06-01T00:00:00Z', expires_date: '2026-07-01T00:00:00Z' },
          'cookreel_max:yearly': {
            purchase_date: '2026-01-01T00:00:00Z',
            expires_date: '2026-06-10T00:00:00Z',
            grace_period_expires_date: '2026-06-20T00:00:00Z',
          },
          cookreel_pro_monthly: { purchase_date: '2026-06-01T00:00:00Z', expires_date: '2026-07-01T00:00:00Z', refunded_at: '2026-06-02T00:00:00Z' },
          unknown_product: { purchase_date: '2026-06-01T00:00:00Z', expires_date: '2026-07-01T00:00:00Z' },
        },
        non_subscriptions: {},
      },
      now,
    );
    expect(state?.plan.id).toBe('max');
    expect(state?.expiresAt?.toISOString()).toBe('2026-06-20T00:00:00.000Z');
  });

  it('returns null when everything has lapsed', () => {
    expect(
      activeSubscription(
        pricing,
        { subscriptions: { cookreel_pro_monthly: { purchase_date: '2026-04-01T00:00:00Z', expires_date: '2026-05-01T00:00:00Z' } }, non_subscriptions: {} },
        now,
      ),
    ).toBeNull();
  });
});

describe('billing sync and webhooks', () => {
  let ctx: TestContext;
  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(async () => {
    await ctx.close();
  });

  const newUser = async (subject: string) =>
    (
      await signInWithIdentity(
        ctx.deps.db,
        pricing,
        { provider: 'apple', subject, email: null, name: null, avatarUrl: null },
        { box: createSecretBox('x') },
      )
    ).user;

  it('grants subscription and top-up credits idempotently', async () => {
    const user = await newUser('billing-1');
    const purchase = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const renews = new Date(Date.now() + 29 * 24 * 3600 * 1000).toISOString();
    ctx.revenueCat.subscribers.set(user.id, {
      subscriptions: { cookreel_pro_monthly: { purchase_date: purchase, expires_date: renews } },
      non_subscriptions: { cookreel_credits_50: [{ id: 'rc-1', store_transaction_id: 'txn-1', purchase_date: purchase }] },
    });

    const first = await syncBilling(ctx.deps.db, pricing, ctx.revenueCat, user.id);
    expect(first).toMatchObject({ planId: 'pro', plan: 200, bonus: pricing.starterCredits + 50 });
    const second = await syncBilling(ctx.deps.db, pricing, ctx.revenueCat, user.id);
    expect(second.total).toBe(first.total);
  });

  it('verifies webhook credentials in constant time', () => {
    expect(webhookAuthorized('secret', 'Bearer secret')).toBe(true);
    expect(webhookAuthorized('secret', 'secret')).toBe(true);
    expect(webhookAuthorized('secret', 'Bearer nope')).toBe(false);
    expect(webhookAuthorized(null, 'secret')).toBe(false);
    expect(webhookAuthorized('secret', undefined)).toBe(false);
  });

  it('re-syncs affected users once per webhook event', async () => {
    const user = await newUser('billing-2');
    const body = { event: { id: 'evt-1', type: 'RENEWAL', app_user_id: user.id, aliases: ['$RCAnonymousID:abc'] } };
    ctx.revenueCat.calls = [];
    expect(await handleRevenueCatWebhook(ctx.deps.db, pricing, ctx.revenueCat, body, logger)).toEqual({ processed: true, users: 1 });
    expect(await handleRevenueCatWebhook(ctx.deps.db, pricing, ctx.revenueCat, body, logger)).toEqual({ processed: false, users: 0 });
    expect(ctx.revenueCat.calls).toEqual([user.id]);
    expect((await getBalance(ctx.deps.db, pricing, user.id)).planId).toBeNull();
  });
});

describe('sessions and identity tokens', () => {
  let ctx: TestContext;
  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(async () => {
    await ctx.close();
  });

  it('signs and verifies session tokens', async () => {
    const signer = createSessionSigner('a-very-long-test-secret-for-sessions-123', 30);
    const { token } = await signer.sign('user-1');
    expect((await signer.verify(token)).userId).toBe('user-1');
    const other = createSessionSigner('another-secret-entirely-1234567890abcd', 30);
    await expect(other.verify(token)).rejects.toMatchObject({ status: 401 });
  });

  it('accepts valid Google tokens and rejects wrong audience or expired ones', async () => {
    const identity = await ctx.deps.identity.google(await ctx.googleToken({ sub: 'g-123' }));
    expect(identity).toMatchObject({ provider: 'google', subject: 'g-123', email: 'cook@example.com', name: 'Test Cook' });

    await expect(ctx.deps.identity.google(await ctx.googleToken({}, { audience: 'someone-else' }))).rejects.toMatchObject({ status: 401 });
    await expect(ctx.deps.identity.google(await ctx.googleToken({}, { expiresIn: '-1m' }))).rejects.toMatchObject({ status: 401 });
    await expect(ctx.deps.identity.google('not.a.jwt.at.all.really')).rejects.toMatchObject({ status: 401 });
    expect(GOOGLE_CLIENT_ID).toContain('googleusercontent');
  });

  it('drops unverified Google emails', async () => {
    const identity = await ctx.deps.identity.google(await ctx.googleToken({ email_verified: false }));
    expect(identity.email).toBeNull();
  });

  it('accepts Apple tokens and keeps the one-time full name', async () => {
    const identity = await ctx.deps.identity.apple(await ctx.appleToken({ sub: 'a-1' }), 'Asha Rao');
    expect(identity).toMatchObject({ provider: 'apple', subject: 'a-1', name: 'Asha Rao' });
  });

  it('seals secrets with authenticated encryption', () => {
    const box = createSecretBox('k');
    const sealed = box.seal('refresh-token');
    expect(sealed).not.toContain('refresh-token');
    expect(box.open(sealed)).toBe('refresh-token');
    expect(createSecretBox('other').open(sealed)).toBeNull();
    expect(box.open(`${sealed}x`)).toBeNull();
  });
});
