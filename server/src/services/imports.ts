import { and, desc, eq, inArray } from 'drizzle-orm';
import type { Logger } from 'pino';
import type { Db } from '../db/client.js';
import { importJobs, videoAnalyses, type ImportJobRow } from '../db/schema.js';
import { costOf, type Pricing } from '../domain/pricing.js';
import { normalizeRecipe, type CookProfile, type Recipe } from '../domain/recipe.js';
import { isShortForm, parseYouTubeUrl, type OEmbedFetcher, type ParsedYouTubeUrl, type VideoMeta } from '../domain/youtube.js';
import { HttpError, toHttpError } from '../lib/errors.js';
import type { RecipeAI } from './claude.js';
import { chargeCredits, refundCharge } from './credits.js';
import type { VideoAnalyzer } from './gemini.js';
import type { KnowledgeBase } from './knowledge.js';
import { getUser } from './users.js';

export type ImportStatus = 'queued' | 'watching' | 'writing' | 'done' | 'failed';
const ACTIVE: ImportStatus[] = ['queued', 'watching', 'writing'];

export interface ImportJobView {
  id: string;
  status: ImportStatus;
  videoId: string;
  isShort: boolean;
  creditsCharged: number;
  error: string | null;
  recipe: Recipe | null;
  createdAt: string;
}

export type ImportStartResult =
  | { kind: 'cached'; recipe: Recipe }
  | { kind: 'job'; job: ImportJobView };

export interface ImportService {
  start(input: { userId: string; url: string; profile?: CookProfile }): Promise<ImportStartResult>;
  get(userId: string, jobId: string): Promise<ImportJobView>;
  /** Fails jobs orphaned by a restart and refunds them. */
  recoverInterrupted(): Promise<number>;
  /** Resolves when no jobs are running (tests, graceful shutdown). */
  idle(): Promise<void>;
}

/** Minimal in-process work queue with a concurrency cap. */
function createQueue(concurrency: number) {
  let running = 0;
  const waiting: Array<() => Promise<void>> = [];
  let idleResolvers: Array<() => void> = [];
  const pump = () => {
    while (running < concurrency && waiting.length) {
      const task = waiting.shift()!;
      running++;
      void task().finally(() => {
        running--;
        pump();
        if (running === 0 && waiting.length === 0) {
          idleResolvers.forEach((resolve) => resolve());
          idleResolvers = [];
        }
      });
    }
  };
  return {
    push(task: () => Promise<void>) {
      waiting.push(task);
      pump();
    },
    idle() {
      if (running === 0 && waiting.length === 0) return Promise.resolve();
      return new Promise<void>((resolve) => idleResolvers.push(resolve));
    },
  };
}

export interface ImportDeps {
  db: Db;
  pricing: Pricing;
  ai: RecipeAI | null;
  analyzer: VideoAnalyzer | null;
  knowledge: KnowledgeBase;
  oembed: OEmbedFetcher;
  logger: Logger;
  concurrency: number;
}

export function createImportService(deps: ImportDeps): ImportService {
  const { db, logger } = deps;
  const queue = createQueue(deps.concurrency);

  async function cachedRecipe(videoId: string): Promise<Recipe | null> {
    const [row] = await db.select({ recipe: videoAnalyses.recipe }).from(videoAnalyses).where(eq(videoAnalyses.videoId, videoId));
    return (row?.recipe as Recipe | undefined) ?? null;
  }

  async function view(job: ImportJobRow): Promise<ImportJobView> {
    return {
      id: job.id,
      status: job.status as ImportStatus,
      videoId: job.videoId,
      isShort: job.isShort,
      creditsCharged: job.status === 'failed' ? 0 : job.creditsCharged,
      error: job.error,
      recipe: job.status === 'done' ? await cachedRecipe(job.videoId) : null,
      createdAt: job.createdAt.toISOString(),
    };
  }

  const setStatus = (id: string, status: ImportStatus, error: string | null = null) =>
    db.update(importJobs).set({ status, error, updatedAt: new Date() }).where(eq(importJobs.id, id));

  async function run(job: ImportJobRow, video: ParsedYouTubeUrl, meta: VideoMeta, profile?: CookProfile) {
    const { ai, analyzer } = deps;
    try {
      if (!ai || !analyzer) throw new HttpError(503, 'ai_unavailable', 'AI features are not configured.');
      await setStatus(job.id, 'watching');
      const breakdown = await analyzer.analyze(video);
      if (!breakdown.isCookingVideo || breakdown.steps.length === 0) {
        throw new HttpError(422, 'not_a_recipe_video', "This video doesn't look like a recipe, so we couldn't break it into steps.");
      }

      const durationSec = breakdown.durationSec > 0 ? Math.round(breakdown.durationSec) : null;
      const isShort = isShortForm(video, durationSec);
      await setStatus(job.id, 'writing');
      const draft = await ai.recipeFromVideo({ url: video.canonicalUrl, meta, breakdown, isShort, durationSec, profile });
      const recipe = normalizeRecipe(draft, {
        source: 'youtube',
        durationSec,
        youtube: {
          videoId: video.videoId,
          url: video.canonicalUrl,
          isShort,
          title: meta.title,
          channel: meta.channel,
          thumbnailUrl: meta.thumbnailUrl,
          durationSec,
        },
      });
      if (!recipe.steps.length || !recipe.ingredients.length) throw new Error('video recipe came back empty');

      await db
        .insert(videoAnalyses)
        .values({ videoId: video.videoId, recipe, model: `${analyzer.model}+${ai.model}` })
        .onConflictDoNothing();
      const user = await getUser(db, job.userId);
      await deps.knowledge.remember({ userId: job.userId, videoId: video.videoId, shared: user?.sharingOptIn ?? false, recipe });
      await setStatus(job.id, 'done');
      logger.info({ jobId: job.id, videoId: video.videoId, steps: recipe.steps.length }, 'youtube import done');
    } catch (error) {
      const message =
        toHttpError(error)?.message ?? 'Something went wrong while breaking down this video. Your credits were refunded.';
      logger.warn({ err: error, jobId: job.id, videoId: video.videoId }, 'youtube import failed');
      if (job.chargeId) await refundCharge(db, job.userId, job.chargeId).catch((err) => logger.error({ err }, 'refund failed'));
      await setStatus(job.id, 'failed', message);
    }
  }

  return {
    async start({ userId, url, profile }) {
      const video = parseYouTubeUrl(url);
      if (!video) throw new HttpError(400, 'invalid_request', "That doesn't look like a YouTube link. Paste a video or Shorts URL.");

      const cached = await cachedRecipe(video.videoId);
      if (cached) return { kind: 'cached', recipe: cached };

      const [inFlight] = await db
        .select()
        .from(importJobs)
        .where(and(eq(importJobs.userId, userId), eq(importJobs.videoId, video.videoId), inArray(importJobs.status, ACTIVE)))
        .orderBy(desc(importJobs.createdAt))
        .limit(1);
      if (inFlight) return { kind: 'job', job: await view(inFlight) };

      if (!deps.ai || !deps.analyzer) throw new HttpError(503, 'ai_unavailable', 'AI features are temporarily unavailable.');

      const lookup = await deps.oembed(video);
      if (!lookup.ok && lookup.reason === 'not_found') {
        throw new HttpError(404, 'video_unavailable', "We couldn't find that video. Check that it's public and the link is complete.");
      }
      if (!lookup.ok && lookup.reason === 'not_embeddable') {
        throw new HttpError(
          422,
          'video_unavailable',
          "This creator doesn't allow their video to play inside other apps, so we can't make step clips from it.",
        );
      }
      const meta: VideoMeta = lookup.ok ? lookup.meta : { title: 'YouTube recipe', channel: null, thumbnailUrl: video.thumbnailUrl };

      const cost = costOf(deps.pricing, video.isShort ? 'youtubeShort' : 'youtube');
      const charge = await chargeCredits(db, deps.pricing, { userId, amount: cost, feature: video.isShort ? 'youtubeShort' : 'youtube' });
      const [job] = await db
        .insert(importJobs)
        .values({
          userId,
          videoId: video.videoId,
          url: video.canonicalUrl,
          isShort: video.isShort,
          status: 'queued',
          creditsCharged: cost,
          chargeId: charge.id,
        })
        .returning();
      if (!job) throw new Error('failed to create import job');
      queue.push(() => run(job, video, meta, profile));
      return { kind: 'job', job: await view(job) };
    },

    async get(userId, jobId) {
      const [job] = await db.select().from(importJobs).where(and(eq(importJobs.id, jobId), eq(importJobs.userId, userId)));
      if (!job) throw new HttpError(404, 'not_found', 'Import not found.');
      return view(job);
    },

    async recoverInterrupted() {
      const orphaned = await db
        .update(importJobs)
        .set({ status: 'failed', error: 'The import was interrupted. Your credits were refunded — please try again.', updatedAt: new Date() })
        .where(inArray(importJobs.status, ACTIVE))
        .returning();
      for (const job of orphaned) {
        if (job.chargeId) await refundCharge(db, job.userId, job.chargeId);
      }
      if (orphaned.length) logger.warn({ count: orphaned.length }, 'recovered interrupted imports');
      return orphaned.length;
    },

    idle: () => queue.idle(),
  };
}
