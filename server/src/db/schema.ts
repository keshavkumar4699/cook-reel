import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';

export const EMBEDDING_DIMENSIONS = 768;

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email'),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  /** Active subscription tier ('basic' | 'pro' | 'max'), null when not subscribed. */
  planId: text('plan_id'),
  planProductId: text('plan_product_id'),
  planPeriodStartedAt: timestamp('plan_period_started_at', { withTimezone: true }),
  planExpiresAt: timestamp('plan_expires_at', { withTimezone: true }),
  /** Monthly allowance refills lazily at this instant (supports yearly plans with monthly credits). */
  planNextRefillAt: timestamp('plan_next_refill_at', { withTimezone: true }),
  /** Subscription credits: reset to the plan allowance every cycle. */
  planCredits: integer('plan_credits').notNull().default(0),
  /** Starter + top-up credits: never expire. Spent after plan credits. */
  bonusCredits: integer('bonus_credits').notNull().default(0),
  /** Contribute analysed YouTube recipes to the shared knowledge base that improves AI suggestions. */
  sharingOptIn: boolean('sharing_opt_in').notNull().default(true),
  createdAt: createdAt(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
});

export const identities = pgTable(
  'identities',
  {
    provider: text('provider').notNull(), // 'google' | 'apple' | 'dev'
    subject: text('subject').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    email: text('email'),
    /** AES-GCM encrypted Apple refresh token, used to revoke access when the account is deleted. */
    appleRefreshToken: text('apple_refresh_token'),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.provider, t.subject] }), index('identities_user_idx').on(t.userId)],
);

/**
 * Hashes of identities that already received starter credits. Survives account deletion so
 * delete-and-recreate can't farm free credits, without keeping personal data.
 */
export const starterGrants = pgTable('starter_grants', {
  identityHash: text('identity_hash').primaryKey(),
  createdAt: createdAt(),
});

export const creditLedger = pgTable(
  'credit_ledger',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bucket: text('bucket').notNull(), // 'plan' | 'bonus'
    delta: integer('delta').notNull(),
    reason: text('reason').notNull(), // 'starter' | 'plan_period' | 'plan_refill' | 'plan_expired' | 'topup' | 'usage' | 'refund'
    feature: text('feature'),
    idempotencyKey: text('idempotency_key'),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('credit_ledger_idempotency_idx').on(t.idempotencyKey),
    index('credit_ledger_user_idx').on(t.userId, t.createdAt),
  ],
);

/** Global cache: one analysis per YouTube video, reused by every user who imports it. */
export const videoAnalyses = pgTable('video_analyses', {
  videoId: text('video_id').primaryKey(),
  recipe: jsonb('recipe').notNull(),
  model: text('model'),
  createdAt: createdAt(),
});

export const importJobs = pgTable(
  'import_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    videoId: text('video_id').notNull(),
    url: text('url').notNull(),
    isShort: boolean('is_short').notNull().default(false),
    status: text('status').notNull(), // 'queued' | 'watching' | 'writing' | 'done' | 'failed'
    error: text('error'),
    creditsCharged: integer('credits_charged').notNull().default(0),
    chargeId: text('charge_id'),
    createdAt: createdAt(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('import_jobs_user_idx').on(t.userId, t.createdAt), index('import_jobs_status_idx').on(t.status)],
);

/** Retrieval-augmented "memory" built from analysed recipes; feeds reference examples to the AI. */
export const recipeKnowledge = pgTable(
  'recipe_knowledge',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    videoId: text('video_id'),
    shared: boolean('shared').notNull().default(false),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    embedding: vector('embedding', { dimensions: EMBEDDING_DIMENSIONS }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('recipe_knowledge_user_video_idx').on(t.userId, t.videoId),
    index('recipe_knowledge_embedding_idx').using('hnsw', t.embedding.op('vector_cosine_ops')),
  ],
);

export const webhookEvents = pgTable('webhook_events', {
  id: text('id').primaryKey(),
  source: text('source').notNull(),
  type: text('type').notNull(),
  appUserId: text('app_user_id'),
  createdAt: createdAt(),
});

export type UserRow = typeof users.$inferSelect;
export type ImportJobRow = typeof importJobs.$inferSelect;
