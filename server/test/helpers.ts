import { createHash } from 'node:crypto';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWK } from 'jose';
import { pino } from 'pino';
import { createApp, type AppDeps } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { openDatabase, type Database } from '../src/db/client.js';
import { EMBEDDING_DIMENSIONS } from '../src/db/schema.js';
import { DEFAULT_PRICING, type Pricing } from '../src/domain/pricing.js';
import type { AppLanguage } from '../src/domain/languages.js';
import { translatableText, type Recipe, type RecipeDraft, type RecipeTranslation } from '../src/domain/recipe.js';
import type { OEmbedResult, ParsedYouTubeUrl } from '../src/domain/youtube.js';
import { createIdentityVerifier, createSecretBox, createSessionSigner } from '../src/services/auth.js';
import type { RevenueCatClient, RevenueCatSubscriber } from '../src/services/billing.js';
import type { BuilderTurn, BuilderTurnInput, ExperimentInput, ExperimentResult, RecipeAI, VideoRecipeInput } from '../src/services/claude.js';
import type { Embedder, VideoAnalyzer, VideoBreakdown } from '../src/services/gemini.js';
import { createImportService } from '../src/services/imports.js';
import { createKnowledgeBase } from '../src/services/knowledge.js';
import { createSpeechService, type SpeechSettings, type SpeechSynthesizer } from '../src/services/speech.js';

export const GOOGLE_CLIENT_ID = 'test-web-client.apps.googleusercontent.com';
export const APPLE_BUNDLE_ID = 'com.cookreel.app';

export function sampleDraft(overrides: Partial<RecipeDraft> = {}): RecipeDraft {
  return {
    language: 'en',
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
  experimentCalls: ExperimentInput[] = [];
  videoCalls: VideoRecipeInput[] = [];
  translateCalls: Array<{ recipe: Recipe; language: AppLanguage }> = [];
  builderQueue: Array<BuilderTurn | Error> = [];
  experimentQueue: Array<ExperimentResult | Error> = [];
  videoQueue: Array<RecipeDraft | Error> = [];
  translateQueue: Array<RecipeTranslation | Error> = [];

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

  async experiment(input: ExperimentInput): Promise<ExperimentResult> {
    this.experimentCalls.push(input);
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

  /** Tags every translated text with the language, e.g. "[es] Eggs", so tests can see what changed. */
  async translateRecipe(input: { recipe: Recipe; language: AppLanguage }): Promise<RecipeTranslation> {
    this.translateCalls.push(input);
    const next = this.translateQueue.shift();
    if (next instanceof Error) throw next;
    if (next) return next;
    const tag = (text: string) => `[${input.language}] ${text}`;
    const source = translatableText(input.recipe);
    return {
      ...source,
      language: input.language,
      title: tag(source.title),
      ingredients: source.ingredients.map((i) => ({ ...i, name: tag(i.name) })),
      steps: source.steps.map((s) => ({ ...s, instruction: tag(s.instruction), narration: s.narration ? tag(s.narration) : null })),
    };
  }
}

export class FakeAnalyzer implements VideoAnalyzer {
  readonly model = 'fake-gemini';
  calls: ParsedYouTubeUrl[] = [];
  queue: Array<VideoBreakdown | Error> = [];
  delayMs = 0;
  async analyze(video: ParsedYouTubeUrl): Promise<VideoBreakdown> {
    this.calls.push(video);
    if (this.delayMs) await new Promise((resolve) => setTimeout(resolve, this.delayMs));
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

/**
 * A WAV file of speech-like tone, shaped like Gemini 3.8 TTS output: 16-bit mono PCM followed by a
 * trailing metadata chunk that must never be played.
 */
export function fakeWav(ms: number, options: { sampleRate?: number; trailing?: boolean } = {}): Buffer {
  const sampleRate = options.sampleRate ?? 24_000;
  const frames = Math.round((ms / 1000) * sampleRate);
  const pcm = Buffer.alloc(frames * 2);
  for (let i = 0; i < frames; i++) pcm.writeInt16LE(Math.round(Math.sin((i / sampleRate) * 2 * Math.PI * 220) * 6000), i * 2);
  const fmt = Buffer.alloc(24);
  fmt.write('fmt ', 0, 'ascii');
  fmt.writeUInt32LE(16, 4);
  fmt.writeUInt16LE(1, 8); // PCM
  fmt.writeUInt16LE(1, 10); // mono
  fmt.writeUInt32LE(sampleRate, 12);
  fmt.writeUInt32LE(sampleRate * 2, 16);
  fmt.writeUInt16LE(2, 20);
  fmt.writeUInt16LE(16, 22);
  const dataHeader = Buffer.alloc(8);
  dataHeader.write('data', 0, 'ascii');
  dataHeader.writeUInt32LE(pcm.length, 4);
  const trailer = options.trailing === false ? Buffer.alloc(0) : Buffer.concat([Buffer.from('c2pa', 'ascii'), Buffer.from([16, 0, 0, 0]), Buffer.alloc(16, 0x7f)]);
  const body = Buffer.concat([Buffer.from('WAVE', 'ascii'), fmt, dataHeader, pcm, trailer]);
  const riff = Buffer.alloc(8);
  riff.write('RIFF', 0, 'ascii');
  riff.writeUInt32LE(body.length, 4);
  return Buffer.concat([riff, body]);
}

/** Stand-in for Gemini TTS: records every call; returns audio sized to the text unless a queued result says otherwise. */
export class FakeSpeech implements SpeechSynthesizer {
  readonly model = 'fake-tts';
  calls: { text: string; language: string; voice: string; style: string | null }[] = [];
  queue: Array<{ data: Buffer; mimeType: string } | Error> = [];
  delayMs = 0;
  async synthesize(input: { text: string; language: string; voice: string; style: string | null }) {
    this.calls.push(input);
    if (this.delayMs) await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    const next = this.queue.shift();
    if (next instanceof Error) throw next;
    if (next) return next;
    return { data: fakeWav(Math.max(900, input.text.length * 70)), mimeType: 'audio/wav' };
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
  speech: FakeSpeech;
  oembed: { result: OEmbedResult };
  googleToken(claims?: Record<string, unknown>, options?: { audience?: string; expiresIn?: string }): Promise<string>;
  appleToken(claims?: Record<string, unknown>): Promise<string>;
  close(): Promise<void>;
}

export async function createTestContext(
  options: { pricing?: Pricing; allowDevLogin?: boolean; speech?: Partial<SpeechSettings> | false } = {},
): Promise<TestContext> {
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
  const speech = new FakeSpeech();
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
    speech:
      options.speech === false
        ? null
        : createSpeechService({
            db: database.db,
            synthesizer: speech,
            settings: {
              voices: { warm: 'Sulafat', friendly: 'Achird' },
              userDailySeconds: 900,
              globalDailySeconds: 50_000,
              cacheVersion: '1',
              style: true,
              ...options.speech,
            },
            logger,
          }),
  };

  return {
    deps,
    app: createApp(deps),
    database,
    ai,
    analyzer,
    revenueCat,
    speech,
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
