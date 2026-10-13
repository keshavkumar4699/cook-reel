import { Router } from 'express';
import { z } from 'zod';
import type { AppDeps } from '../../app.js';
import { costOf } from '../../domain/pricing.js';
import { CookProfileSchema, normalizeRecipe, RecipeInputSchema } from '../../domain/recipe.js';
import { HttpError, InsufficientCreditsError } from '../../lib/errors.js';
import { chargeCredits, getBalance, refundCharge } from '../../services/credits.js';
import { currentUser, limiter, parseBody } from '../middleware.js';

/** Question rounds before Chef must deliver the recipe. */
export const MAX_QUESTION_ROUNDS = 3;

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(2000),
});

const BuilderBody = z
  .object({
    messages: z.array(ChatMessageSchema).min(1).max(16),
    mode: z.enum(['describe', 'fridge']).default('describe'),
    pantry: z.array(z.string().trim().min(1).max(60)).max(40).default([]),
    profile: CookProfileSchema.optional(),
  })
  .refine((body) => body.messages[0]?.role === 'user' && body.messages[body.messages.length - 1]?.role === 'user', {
    message: 'The conversation must start and end with a message from the cook.',
  });

const ExperimentBody = z.object({
  recipe: RecipeInputSchema,
  instruction: z.string().trim().min(3).max(300),
  profile: CookProfileSchema.optional(),
});

const YouTubeBody = z.object({
  url: z.string().trim().min(5).max(500),
  profile: CookProfileSchema.optional(),
});

export function aiRoutes(deps: AppDeps) {
  const router = Router();
  router.use(limiter({ windowMs: 60 * 1000, limit: 20, perUser: true }));

  const requireAI = () => {
    if (!deps.ai) throw new HttpError(503, 'ai_unavailable', 'AI features are not configured on this server.');
    return deps.ai;
  };

  /** One turn of the "Create with AI" chat. Questions are free; the finished recipe costs credits. */
  router.post('/builder', async (req, res) => {
    const ai = requireAI();
    const user = currentUser(res);
    const body = parseBody(BuilderBody, req);
    const cost = costOf(deps.pricing, 'recipe');

    // Don't let a cook chat their way through a conversation they can't finish.
    const balance = await getBalance(deps.db, deps.pricing, user.id);
    if (balance.total < cost) throw new InsufficientCreditsError(cost, balance.total);

    const questionsAsked = body.messages.filter((m) => m.role === 'assistant').length;
    const query = [body.messages[0]!.content, body.mode === 'fridge' ? body.pantry.join(', ') : ''].join(' ').trim();
    const references = await deps.knowledge.search({ userId: user.id, text: query });

    const turn = await ai.builderTurn({
      messages: body.messages,
      mode: body.mode,
      pantry: body.pantry,
      profile: body.profile,
      references,
      forceRecipe: questionsAsked >= MAX_QUESTION_ROUNDS,
    });

    if (turn.kind === 'recipe' && turn.recipe) {
      const recipe = normalizeRecipe(turn.recipe, { source: 'ai' });
      if (!recipe.ingredients.length || !recipe.steps.length) {
        throw new HttpError(502, 'ai_failed', 'Chef lost track of that recipe. No credits were used — please try again.');
      }
      await chargeCredits(deps.db, deps.pricing, { userId: user.id, amount: cost, feature: 'recipe' });
      res.json({
        kind: 'recipe',
        message: turn.message,
        recipe,
        creditsCharged: cost,
        balance: await getBalance(deps.db, deps.pricing, user.id),
        references: references.map((r) => r.title),
      });
      return;
    }

    res.json({
      kind: 'question',
      message: turn.message,
      suggestions: turn.suggestions.map((s) => s.trim()).filter(Boolean).slice(0, 6),
      creditsCharged: 0,
    });
  });

  /** Creates a variation of an existing recipe ("make it vegan", "air fryer version"…). */
  router.post('/experiment', async (req, res) => {
    const ai = requireAI();
    const user = currentUser(res);
    const body = parseBody(ExperimentBody, req);
    const cost = costOf(deps.pricing, 'experiment');

    const charge = await chargeCredits(deps.db, deps.pricing, { userId: user.id, amount: cost, feature: 'experiment' });
    try {
      const result = await ai.experiment({ recipe: body.recipe, instruction: body.instruction, profile: body.profile });
      const recipe = normalizeRecipe(result.recipe, { source: 'ai' });
      if (!recipe.ingredients.length || !recipe.steps.length) {
        throw new HttpError(502, 'ai_failed', 'Chef lost track of that variation. No credits were used — please try again.');
      }
      res.json({
        message: result.message,
        changes: result.changes.map((c) => c.trim()).filter(Boolean).slice(0, 8),
        recipe,
        creditsCharged: cost,
        balance: await getBalance(deps.db, deps.pricing, user.id),
      });
    } catch (error) {
      await refundCharge(deps.db, user.id, charge.id);
      throw error;
    }
  });

  /** Starts (or reuses) a YouTube breakdown. 200 with the recipe when cached, 202 with a job otherwise. */
  router.post('/youtube', async (req, res) => {
    const user = currentUser(res);
    const body = parseBody(YouTubeBody, req);
    const result = await deps.imports.start({ userId: user.id, url: body.url, profile: body.profile });
    if (result.kind === 'cached') {
      res.json({ status: 'done', cached: true, creditsCharged: 0, recipe: result.recipe });
      return;
    }
    res.status(202).json({ ...result.job, cached: false });
  });

  router.get('/youtube/:jobId', async (req, res) => {
    const user = currentUser(res);
    const jobId = z.uuid().safeParse(req.params.jobId);
    if (!jobId.success) throw new HttpError(404, 'not_found', 'Import not found.');
    const job = await deps.imports.get(user.id, jobId.data);
    res.json({ ...job, cached: false, balance: job.status === 'done' || job.status === 'failed' ? await getBalance(deps.db, deps.pricing, user.id) : undefined });
  });

  return router;
}
