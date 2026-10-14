import { and, desc, eq, inArray } from 'drizzle-orm';
import type { Logger } from 'pino';
import type { Db } from '../db/client.js';
import { importJobs, videoAnalyses, videoRecipeTranslations, type ImportJobRow } from '../db/schema.js';
import { FALLBACK_TEXT, languageFromCode, type AppLanguage } from '../domain/languages.js';
import { costOf, type Pricing } from '../domain/pricing.js';
import { applyTranslation, normalizeRecipe, type CookProfile, type Recipe } from '../domain/recipe.js';
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
  language: AppLanguage;
  creditsCharged: number;
  error: string | null;
  /** Stable reason for a failure (not_a_recipe_video, import_interrupted, import_failed…). */
  errorCode: string | null;
  recipe: Recipe | null;
  createdAt: string;
}

export type ImportStartResult =
  | { kind: 'cached'; recipe: Recipe }
  | { kind: 'job'; job: ImportJobView };

export interface ImportService {
  start(input: { userId: string; url: string; profile?: CookProfile; language: AppLanguage }): Promise<ImportStartResult>;
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

  const jobLanguage = (job: ImportJobRow): AppLanguage => languageFromCode(job.language) ?? 'en';

  /** The analysed recipe for a video, in the language it was written in. */
  async function original(videoId: string): Promise<Recipe | null> {
    const [row] = await db
      .select({ recipe: videoAnalyses.recipe, language: videoAnalyses.language })
      .from(videoAnalyses)
      .where(eq(videoAnalyses.videoId, videoId));
    if (!row) return null;
    const recipe = row.recipe as Recipe;
    // Rows saved before recipes carried a language.
    return { ...recipe, language: languageFromCode(recipe.language) ?? languageFromCode(row.language) ?? 'en' };
  }

  async function translated(videoId: string, language: AppLanguage): Promise<Recipe | null> {
    const [row] = await db
      .select({ recipe: videoRecipeTranslations.recipe })
      .from(videoRecipeTranslations)
      .where(and(eq(videoRecipeTranslations.videoId, videoId), eq(videoRecipeTranslations.language, language)));
    return (row?.recipe as Recipe | undefined) ?? null;
  }

  /** The video's recipe in `language` if it exists yet: the analysed original or a stored translation. */
  async function recipeIn(videoId: string, language: AppLanguage): Promise<Recipe | null> {
    const recipe = await original(videoId);
    if (!recipe) return null;
    return recipe.language === language ? recipe : translated(videoId, language);
  }

  // One translation per (video, language) at a time, however many cooks ask for it.
  const translating = new Map<string, Promise<void>>();

  /** Translates the analysed recipe into `language` once; every later cook gets the stored copy. */
  function ensureTranslation(videoId: string, language: AppLanguage): Promise<void> {
    const key = `${videoId}:${language}`;
    let job = translating.get(key);
    if (!job) {
      job = (async () => {
        const source = await original(videoId);
        if (!source || source.language === language || (await translated(videoId, language))) return;
        if (!deps.ai) throw new HttpError(503, 'ai_unavailable', 'AI features are not configured.');
        const translation = await deps.ai.translateRecipe({ recipe: source, language });
        const recipe = applyTranslation(source, translation, language);
        await db.insert(videoRecipeTranslations).values({ videoId, language, recipe, model: deps.ai.model }).onConflictDoNothing();
        logger.info({ videoId, from: source.language, to: language }, 'video recipe translated');
      })().finally(() => translating.delete(key));
      translating.set(key, job);
    }
    return job;
  }

  async function view(job: ImportJobRow): Promise<ImportJobView> {
    const language = jobLanguage(job);
    return {
      id: job.id,
      status: job.status as ImportStatus,
      videoId: job.videoId,
      isShort: job.isShort,
      language,
      creditsCharged: job.status === 'failed' ? 0 : job.creditsCharged,
      error: job.error,
      errorCode: job.errorCode,
      // A translation that failed still leaves the cook with the original recipe.
      recipe: job.status === 'done' ? ((await recipeIn(job.videoId, language)) ?? (await original(job.videoId))) : null,
      createdAt: job.createdAt.toISOString(),
    };
  }

  const setStatus = (id: string, status: ImportStatus, failure: { message: string; code: string } | null = null) =>
    db
      .update(importJobs)
      .set({ status, error: failure?.message ?? null, errorCode: failure?.code ?? null, updatedAt: new Date() })
      .where(eq(importJobs.id, id));

  async function run(job: ImportJobRow, video: ParsedYouTubeUrl, meta: VideoMeta, profile?: CookProfile) {
    const { ai, analyzer } = deps;
    const language = jobLanguage(job);
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
      const draft = await ai.recipeFromVideo({ url: video.canonicalUrl, meta, breakdown, isShort, durationSec, profile, language });
      const recipe = normalizeRecipe(draft, {
        source: 'youtube',
        language,
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
        .values({ videoId: video.videoId, recipe, language: recipe.language, model: `${analyzer.model}+${ai.model}` })
        .onConflictDoNothing();
      const user = await getUser(db, job.userId);
      await deps.knowledge.remember({ userId: job.userId, videoId: video.videoId, shared: user?.sharingOptIn ?? false, recipe });
      // Chef wrote in another language than asked (rare): translate so the cook gets theirs.
      if (recipe.language !== language) {
        await ensureTranslation(video.videoId, language).catch((err) => logger.warn({ err, jobId: job.id }, 'follow-up translation failed'));
      }
      await setStatus(job.id, 'done');
      logger.info({ jobId: job.id, videoId: video.videoId, language, steps: recipe.steps.length }, 'youtube import done');
    } catch (error) {
      const http = toHttpError(error);
      logger.warn({ err: error, jobId: job.id, videoId: video.videoId }, 'youtube import failed');
      if (job.chargeId) await refundCharge(db, job.userId, job.chargeId).catch((err) => logger.error({ err }, 'refund failed'));
      await setStatus(job.id, 'failed', {
        message: http?.message ?? 'Something went wrong while breaking down this video. Your credits were refunded.',
        code: http?.code ?? 'import_failed',
      });
    }
  }

  /** A video someone already analysed, wanted in another language: a free translation. */
  async function runTranslation(job: ImportJobRow) {
    try {
      await setStatus(job.id, 'writing');
      await ensureTranslation(job.videoId, jobLanguage(job));
    } catch (error) {
      logger.warn({ err: error, jobId: job.id }, 'recipe translation failed; serving the original');
    }
    await setStatus(job.id, 'done');
  }

  return {
    async start({ userId, url, profile, language }) {
      const video = parseYouTubeUrl(url);
      if (!video) {
        throw new HttpError(400, 'invalid_request', "That doesn't look like a YouTube link. Paste a video or Shorts URL.", { reason: 'invalid_link' });
      }

      const cached = await recipeIn(video.videoId, language);
      if (cached) return { kind: 'cached', recipe: cached };

      const [inFlight] = await db
        .select()
        .from(importJobs)
        .where(
          and(
            eq(importJobs.userId, userId),
            eq(importJobs.videoId, video.videoId),
            eq(importJobs.language, language),
            inArray(importJobs.status, ACTIVE),
          ),
        )
        .orderBy(desc(importJobs.createdAt))
        .limit(1);
      if (inFlight) return { kind: 'job', job: await view(inFlight) };

      if (!deps.ai || !deps.analyzer) throw new HttpError(503, 'ai_unavailable', 'AI features are temporarily unavailable.');

      // Already analysed in another language: no need to watch it again, and no charge.
      const analysed = await original(video.videoId);
      if (analysed) {
        const [job] = await db
          .insert(importJobs)
          .values({
            userId,
            videoId: video.videoId,
            url: video.canonicalUrl,
            isShort: analysed.youtube?.isShort ?? video.isShort,
            status: 'queued',
            language,
            creditsCharged: 0,
          })
          .returning();
        if (!job) throw new Error('failed to create import job');
        queue.push(() => runTranslation(job));
        return { kind: 'job', job: await view(job) };
      }

      const lookup = await deps.oembed(video);
      if (!lookup.ok && lookup.reason === 'not_found') {
        throw new HttpError(404, 'video_unavailable', "We couldn't find that video. Check that it's public and the link is complete.", {
          reason: 'video_not_found',
        });
      }
      if (!lookup.ok && lookup.reason === 'not_embeddable') {
        throw new HttpError(
          422,
          'video_unavailable',
          "This creator doesn't allow their video to play inside other apps, so we can't make step clips from it.",
          { reason: 'not_embeddable' },
        );
      }
      const meta: VideoMeta = lookup.ok
        ? lookup.meta
        : { title: FALLBACK_TEXT[language].youtube, channel: null, thumbnailUrl: video.thumbnailUrl };

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
          language,
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
        .set({
          status: 'failed',
          error: 'The import was interrupted. Your credits were refunded — please try again.',
          errorCode: 'import_interrupted',
          updatedAt: new Date(),
        })
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
