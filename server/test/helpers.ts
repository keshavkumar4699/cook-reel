import { createHash } from 'node:crypto';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWK } from 'jose';
import { pino } from 'pino';
import { createApp, type AppDeps } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { openDatabase, type Database } from '../src/db/client.js';
import { EMBEDDING_DIMENSIONS } from '../src/db/schema.js';
import { DEFAULT_PRICING, type Pricing } from '../src/domain/pricing.js';
import type { RecipeDraft } from '../src/domain/recipe.js';
import type { OEmbedResult, ParsedYouTubeUrl } from '../src/domain/youtube.js';
import { createIdentityVerifier, createSecretBox, createSessionSigner } from '../src/services/auth.js';
import type { RevenueCatClient, RevenueCatSubscriber } from '../src/services/billing.js';
import type { BuilderTurn, BuilderTurnInput, ExperimentResult, RecipeAI, VideoRecipeInput } from '../src/services/claude.js';
import type { Embedder, VideoAnalyzer, VideoBreakdown } from '../src/services/gemini.js';
import { createImportService } from '../src/services/imports.js';
import { createKnowledgeBase } from '../src/services/knowledge.js';

export const GOOGLE_CLIENT_ID = 'test-web-client.apps.googleusercontent.com';
export const APPLE_BUNDLE_ID = 'com.cookreel.app';

export function sampleDraft(overrides: Partial<RecipeDraft> = {}): RecipeDraft {
  return {
    title: 'Masala Egg Bhurji',
    description: 'Spicy scrambled eggs ready in 12 minutes, 20 g protein a plate.',
    emoji: '🍳',
    cuisine: 'Indian',
    mealTypes: ['breakfast'],
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 7,
    difficulty: 'easy',
    equipment: ['Non-stick pan', 'Spatula'],
    estCostPerServing: 45,
    currency: 'INR',
    mealPrepFriendly: false,
    storage: null,
    tags: ['High Protein', '15-min', 'high protein'],
    ingredients: [
      {
        name: 'Eggs',
        quantity: 4,
        unit: '',
        note: 'large',
        category: 'protein',
        substitutes: ['Paneer'],
        optional: false,
        nutrition: { kcal: 286, proteinG: 25, carbsG: 1.5, fatG: 19, fiberG: 0 },
      },
      {
        name: 'Onion',
        quantity: 1,
        unit: '',
        note: 'finely chopped',
        category: 'produce',
        substitutes: [],
        optional: false,
        nutrition: { kcal: 44, proteinG: 1.2, carbsG: 10, fatG: 0.1, fiberG: 1.9 },
      },
      {
        name: 'Oil',
        quantity: 1,
        unit: 'tbsp',
        note: null,
        category: 'pantry',
        substitutes: ['Ghee'],
        optional: false,
        nutrition: { kcal: 120, proteinG: 0, carbsG: 0, fatG: 14, fiberG: 0 },
      },
    ],
    steps: [
      {
        title: 'Soften the onion',
        instruction: 'Heat the oil on medium heat and cook the onion until soft.',
        durationSec: 240,
        tip: 'Keep the heat at medium so the onion does not burn.',
        doneCue: 'The onion turns translucent.',
        glossary: [{ term: 'Translucent', meaning: 'See-through at the edges' }],
        clipStartSec: null,
        clipEndSec: null,
        narration: null,
      },
      {
        title: 'Scramble the eggs',
        instruction: 'Pour in the beaten eggs and stir gently until just set.',
        durationSec: 120,
        tip: null,
        doneCue: 'Soft, glossy curds.',
        glossary: [],
        clipStartSec: null,
        clipEndSec: null,
        narration: null,
      },
    ],
    ...overrides,
  };
}

export function sampleBreakdown(overrides: Partial<VideoBreakdown> = {}): VideoBreakdown {
  return {
    isCookingVideo: true,
    dishName: 'Egg Bhurji',
    language: 'en',
    durationSec: 58,
    servingsMentioned: 2,
    ingredients: [{ name: 'Eggs', quantityText: '4', estimated: false }],
    steps: [
      { startSec: 2, endSec: 15, action: 'Fry onions', spokenTips: '' },
      { startSec: 15, endSec: 40, action: 'Add eggs and scramble', spokenTips: 'Keep stirring' },
    ],
    notes: '',
    ...overrides,
  };
}

/** Programmable stand-in for Claude. Each call pops the next queued response (or uses the default). */
export class FakeRecipeAI implements RecipeAI {
  readonly model = 'fake-claude';
  builderCalls: BuilderTurnInput[] = [];
  videoCalls: VideoRecipeInput[] = [];
  builderQueue: Array<BuilderTurn | Error> = [];
  experimentQueue: Array<ExperimentResult | Error> = [];
  videoQueue: Array<RecipeDraft | Error> = [];

  async builderTurn(input: BuilderTurnInput): Promise<BuilderTurn> {
    this.builderCalls.push(input);
    const next = this.builderQueue.shift() ?? {
      kind: 'question' as const,
      message: 'How many people are you cooking for?',
      suggestions: ['Just me', '2 people'],
      recipe: null,
    };
    if (next instanceof Error) throw next;
    return next;
  }

  async experiment(): Promise<ExperimentResult> {
    const next = this.experimentQueue.shift() ?? {
      message: 'Here is a vegan twist.',
      changes: ['Swapped eggs for tofu'],
      recipe: sampleDraft({ title: 'Tofu Bhurji' }),
    };
    if (next instanceof Error) throw next;
    return next;
  }

  async recipeFromVideo(input: VideoRecipeInput): Promise<RecipeDraft> {
    this.videoCalls.push(input);
    const next =
      this.videoQueue.shift() ??
      sampleDraft({
        steps: sampleDraft().steps.map((step, i) => ({
          ...step,
          clipStartSec: i === 0 ? 2 : 15,
          clipEndSec: i === 0 ? 15 : 400, // beyond the video's end on purpose: must be clamped
          narration: 'Cook the onions until they turn soft and golden.',
        })),
      });
    if (next instanceof Error) throw next;
    return next;
  }
}

export class FakeAnalyzer implements VideoAnalyzer {
  readonly model = 'fake-gemini';
  calls: ParsedYouTubeUrl[] = [];
  queue: Array<VideoBreakdown | Error> = [];
  async analyze(video: ParsedYouTubeUrl): Promise<VideoBreakdown> {
    this.calls.push(video);
    const next = this.queue.shift() ?? sampleBreakdown();
    if (next instanceof Error) throw next;
    return next;
  }
}

/** Bag-of-words hashing embedder: texts sharing words get similar vectors. */
export const fakeEmbedder: Embedder = {
  async embed(text) {
    const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
    for (const word of text.toLowerCase().match(/[a-z]+/g) ?? []) {
      const bucket = createHash('md5').update(word).digest().readUInt32BE(0) % EMBEDDING_DIMENSIONS;
      vector[bucket]! += 1;
    }
    const norm = Math.hypot(...vector) || 1;
    return vector.map((v) => v / norm);
  },
};

export class FakeRevenueCat implements RevenueCatClient {
  subscribers = new Map<string, RevenueCatSubscriber>();
  calls: string[] = [];
  async getSubscriber(appUserId: string): Promise<RevenueCatSubscriber> {
    this.calls.push(appUserId);
    return this.subscribers.get(appUserId) ?? { subscriptions: {}, non_subscriptions: {} };
  }
}

async function keyPair(alg: 'RS256' | 'ES256', kid: string) {
  const { publicKey, privateKey } = await generateKeyPair(alg);
  const jwk: JWK = { ...(await exportJWK(publicKey)), kid, alg, use: 'sig' };
  return { privateKey, jwk };
}

export interface TestContext {
  deps: AppDeps;
  app: ReturnType<typeof createApp>;
  database: Database;
  ai: FakeRecipeAI;
  analyzer: FakeAnalyzer;
  revenueCat: FakeRevenueCat;
  oembed: { result: OEmbedResult };
  googleToken(claims?: Record<string, unknown>, options?: { audience?: string; expiresIn?: string }): Promise<string>;
  appleToken(claims?: Record<string, unknown>): Promise<string>;
  close(): Promise<void>;
}

export async function createTestContext(options: { pricing?: Pricing; allowDevLogin?: boolean } = {}): Promise<TestContext> {
  const config = loadConfig({
    NODE_ENV: 'test',
    GOOGLE_CLIENT_IDS: GOOGLE_CLIENT_ID,
    APPLE_BUNDLE_IDS: APPLE_BUNDLE_ID,
    REVENUECAT_WEBHOOK_AUTH: 'rc-webhook-secret',
    ALLOW_DEV_LOGIN: options.allowDevLogin === false ? 'false' : 'true',
  });
  const logger = pino({ level: 'silent' });
  const database = await openDatabase({ kind: 'pglite', dir: null });
  const pricing = options.pricing ?? DEFAULT_PRICING;

  const google = await keyPair('RS256', 'google-key');
  const apple = await keyPair('RS256', 'apple-key');

  const ai = new FakeRecipeAI();
  const analyzer = new FakeAnalyzer();
  const revenueCat = new FakeRevenueCat();
  const oembed: { result: OEmbedResult } = {
    result: { ok: true, meta: { title: 'Egg Bhurji in 60s #shorts', channel: 'Chef Test', thumbnailUrl: 'https://i.ytimg.com/vi/x/hqdefault.jpg' } },
  };
  // Bag-of-words vectors score lower than real semantic embeddings, hence the lower threshold.
  const knowledge = createKnowledgeBase(database.db, fakeEmbedder, logger, { minSimilarity: 0.15 });

  const deps: AppDeps = {
    config,
    db: database.db,
    logger,
    pricing,
    sessions: createSessionSigner(config.jwtSecret, 30),
    identity: createIdentityVerifier({
      googleClientIds: [GOOGLE_CLIENT_ID],
      appleAudiences: [APPLE_BUNDLE_ID],
      googleKeys: createLocalJWKSet({ keys: [google.jwk] }),
      appleKeys: createLocalJWKSet({ keys: [apple.jwk] }),
    }),
    appleTokens: null,
    box: createSecretBox(config.jwtSecret),
    ai,
    videoAI: true,
    knowledge,
    imports: createImportService({
      db: database.db,
      pricing,
      ai,
      analyzer,
      knowledge,
      oembed: async () => oembed.result,
      logger,
      concurrency: 2,
    }),
    revenueCat,
  };

  return {
    deps,
    app: createApp(deps),
    database,
    ai,
    analyzer,
    revenueCat,
    oembed,
    async googleToken(claims = {}, opts = {}) {
      return new SignJWT({ email: 'cook@example.com', email_verified: true, name: 'Test Cook', ...claims })
        .setProtectedHeader({ alg: 'RS256', kid: 'google-key' })
        .setIssuer('https://accounts.google.com')
        .setAudience(opts.audience ?? GOOGLE_CLIENT_ID)
        .setSubject((claims.sub as string | undefined) ?? 'google-user-1')
        .setIssuedAt()
        .setExpirationTime(opts.expiresIn ?? '1h')
        .sign(google.privateKey);
    },
    async appleToken(claims = {}) {
      return new SignJWT({ email: 'relay@privaterelay.appleid.com', ...claims })
        .setProtectedHeader({ alg: 'RS256', kid: 'apple-key' })
        .setIssuer('https://appleid.apple.com')
        .setAudience(APPLE_BUNDLE_ID)
        .setSubject((claims.sub as string | undefined) ?? 'apple-user-1')
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(apple.privateKey);
    },
    async close() {
      await deps.imports.idle();
      await database.close();
    },
  };
}
