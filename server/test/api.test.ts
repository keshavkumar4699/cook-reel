import request from 'supertest';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { recipeKnowledge } from '../src/db/schema.js';
import { AIError } from '../src/lib/errors.js';
import { createTestContext, sampleBreakdown, sampleDraft, type TestContext } from './helpers.js';

const VIDEO = 'https://youtube.com/shorts/aBcDeFgHiJk';

describe('HTTP API', () => {
  let ctx: TestContext;
  let token: string;
  let userId: string;

  const api = () => request(ctx.app);
  const authed = (method: 'get' | 'post' | 'patch' | 'delete', path: string) =>
    api()[method](path).set('authorization', `Bearer ${token}`);

  beforeAll(async () => {
    ctx = await createTestContext();
    const res = await api().post('/api/auth/google').send({ idToken: await ctx.googleToken({ sub: 'api-user' }) });
    expect(res.status).toBe(200);
    token = res.body.token;
    userId = res.body.user.id;
  });
  afterAll(async () => {
    await ctx.close();
  });

  const balance = async () => (await authed('get', '/api/me')).body.balance.total as number;

  it('reports health and serves pricing publicly', async () => {
    const health = await api().get('/health');
    expect(health.body).toMatchObject({ ok: true, features: { ai: true, youtube: true, devLogin: true } });

    const pricing = await api().get('/api/pricing');
    expect(pricing.status).toBe(200);
    expect(pricing.body.costs).toEqual({ recipe: 1, experiment: 1, youtube: 3, youtubeShort: 2 });
    expect(pricing.body.plans.map((p: { id: string }) => p.id)).toEqual(['basic', 'pro', 'max']);
  });

  it('keeps every AI feature behind sign-in', async () => {
    for (const path of ['/api/ai/builder', '/api/ai/experiment', '/api/ai/youtube']) {
      const res = await api().post(path).send({});
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('unauthorized');
    }
    const forged = await api().post('/api/ai/builder').set('authorization', 'Bearer forged.token.here').send({});
    expect(forged.status).toBe(401);
  });

  it('signs new cooks up with starter credits', async () => {
    const res = await api().post('/api/auth/google').send({ idToken: await ctx.googleToken({ sub: 'brand-new' }) });
    expect(res.body).toMatchObject({ isNew: true, starterCreditsGranted: 20, balance: { total: 20, bonus: 20 } });
    const again = await api().post('/api/auth/google').send({ idToken: await ctx.googleToken({ sub: 'brand-new' }) });
    expect(again.body).toMatchObject({ isNew: false, starterCreditsGranted: 0, balance: { total: 20 } });
  });

  it('lets the builder ask questions for free, then charges for the recipe', async () => {
    const start = await balance();
    const q = await authed('post', '/api/ai/builder').send({
      messages: [{ role: 'user', content: 'Something high-protein for dinner' }],
      profile: { diet: 'eggetarian', goal: 'build_muscle' },
    });
    expect(q.status).toBe(200);
    expect(q.body).toMatchObject({ kind: 'question', creditsCharged: 0, suggestions: ['Just me', '2 people'] });
    expect(await balance()).toBe(start);

    ctx.ai.builderQueue.push({ kind: 'recipe', message: 'Here you go!', suggestions: [], recipe: sampleDraft() });
    const r = await authed('post', '/api/ai/builder').send({
      messages: [
        { role: 'user', content: 'Something high-protein for dinner' },
        { role: 'assistant', content: q.body.message },
        { role: 'user', content: 'Just me' },
      ],
    });
    expect(r.status).toBe(200);
    expect(r.body.kind).toBe('recipe');
    expect(r.body.creditsCharged).toBe(1);
    expect(r.body.recipe).toMatchObject({ title: 'Masala Egg Bhurji', source: 'ai', servings: 2 });
    expect(r.body.recipe.nutrition.perServing.kcal).toBe(225);
    expect(r.body.balance.total).toBe(start - 1);

    const call = ctx.ai.builderCalls.at(-1)!;
    expect(call.forceRecipe).toBe(false);
  });

  it('forces a recipe after three rounds of questions and validates the conversation', async () => {
    const messages = [
      { role: 'user', content: 'pasta' },
      { role: 'assistant', content: 'q1' },
      { role: 'user', content: 'a1' },
      { role: 'assistant', content: 'q2' },
      { role: 'user', content: 'a2' },
      { role: 'assistant', content: 'q3' },
      { role: 'user', content: 'a3' },
    ];
    await authed('post', '/api/ai/builder').send({ messages });
    expect(ctx.ai.builderCalls.at(-1)!.forceRecipe).toBe(true);

    const bad = await authed('post', '/api/ai/builder').send({ messages: [{ role: 'assistant', content: 'hi' }] });
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe('invalid_request');
  });

  it('passes fridge mode and pantry through to the model', async () => {
    await authed('post', '/api/ai/builder').send({
      mode: 'fridge',
      pantry: ['eggs', 'rice', 'spinach'],
      messages: [{ role: 'user', content: 'What can I make?' }],
    });
    expect(ctx.ai.builderCalls.at(-1)).toMatchObject({ mode: 'fridge', pantry: ['eggs', 'rice', 'spinach'] });
  });

  it('refunds an experiment when the model fails', async () => {
    const start = await balance();
    const recipe = { title: 'Egg Bhurji', servings: 2, ingredients: [{ name: 'Eggs', quantity: 4, unit: '' }], steps: [{ instruction: 'Scramble.' }] };

    ctx.ai.experimentQueue.push(new AIError('upstream', 'boom'));
    const failed = await authed('post', '/api/ai/experiment').send({ recipe, instruction: 'make it vegan' });
    expect(failed.status).toBe(502);
    expect(failed.body.error.code).toBe('ai_failed');
    expect(await balance()).toBe(start);

    const ok = await authed('post', '/api/ai/experiment').send({ recipe, instruction: 'make it vegan' });
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ creditsCharged: 1, changes: ['Swapped eggs for tofu'], recipe: { title: 'Tofu Bhurji' } });
    expect(await balance()).toBe(start - 1);
  });

  it('maps model refusals to a friendly 422', async () => {
    ctx.ai.builderQueue.push(new AIError('refused', 'nope'));
    const res = await authed('post', '/api/ai/builder').send({ messages: [{ role: 'user', content: 'something' }] });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('ai_refused');
  });

  it('breaks a YouTube Short into narrated clips, then serves it from cache', async () => {
    const start = await balance();
    const started = await authed('post', '/api/ai/youtube').send({ url: VIDEO });
    expect(started.status).toBe(202);
    expect(started.body).toMatchObject({ status: 'queued', isShort: true, creditsCharged: 2 });
    expect(await balance()).toBe(start - 2);

    await ctx.deps.imports.idle();
    const done = await authed('get', `/api/ai/youtube/${started.body.id}`);
    expect(done.body.status).toBe('done');
    const recipe = done.body.recipe;
    expect(recipe.source).toBe('youtube');
    expect(recipe.youtube).toMatchObject({ videoId: 'aBcDeFgHiJk', isShort: true, channel: 'Chef Test', durationSec: 58 });
    expect(recipe.steps[0].clip).toEqual({ startSec: 2, endSec: 15 });
    expect(recipe.steps[1].clip).toEqual({ startSec: 15, endSec: 58 });
    expect(recipe.steps[0].narration).toContain('onions');
    expect(ctx.ai.videoCalls.at(-1)).toMatchObject({ isShort: true, durationSec: 58 });

    // Contributed to the knowledge base (opted in by default).
    const rows = await ctx.deps.db.select().from(recipeKnowledge).where(eq(recipeKnowledge.userId, userId));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.shared).toBe(true);

    const cached = await authed('post', '/api/ai/youtube').send({ url: 'https://www.youtube.com/watch?v=aBcDeFgHiJk' });
    expect(cached.status).toBe(200);
    expect(cached.body).toMatchObject({ status: 'done', cached: true, creditsCharged: 0 });
    expect(await balance()).toBe(start - 2);
  });

  it('feeds similar analysed recipes back to the builder as references', async () => {
    await authed('post', '/api/ai/builder').send({ messages: [{ role: 'user', content: 'masala egg bhurji with onion' }] });
    const refs = ctx.ai.builderCalls.at(-1)!.references;
    expect(refs[0]?.title).toBe('Masala Egg Bhurji');
  });

  it('refunds imports that turn out not to be recipes', async () => {
    const start = await balance();
    ctx.analyzer.queue.push(sampleBreakdown({ isCookingVideo: false, steps: [] }));
    const started = await authed('post', '/api/ai/youtube').send({ url: 'https://www.youtube.com/watch?v=zzzzzzzzzzz' });
    expect(started.status).toBe(202);
    expect(started.body.creditsCharged).toBe(3);
    await ctx.deps.imports.idle();
    const failed = await authed('get', `/api/ai/youtube/${started.body.id}`);
    expect(failed.body).toMatchObject({ status: 'failed', creditsCharged: 0 });
    expect(failed.body.error).toMatch(/doesn't look like a recipe/);
    expect(await balance()).toBe(start);
  });

  it('rejects bad links and non-embeddable videos before charging', async () => {
    const start = await balance();
    const bad = await authed('post', '/api/ai/youtube').send({ url: 'https://vimeo.com/123' });
    expect(bad.status).toBe(400);

    ctx.oembed.result = { ok: false, reason: 'not_embeddable' };
    const blocked = await authed('post', '/api/ai/youtube').send({ url: 'https://www.youtube.com/watch?v=yyyyyyyyyyy' });
    expect(blocked.status).toBe(422);
    expect(blocked.body.error.code).toBe('video_unavailable');
    ctx.oembed.result = { ok: true, meta: { title: 't', channel: null, thumbnailUrl: 'x' } };
    expect(await balance()).toBe(start);

    const missing = await authed('get', '/api/ai/youtube/not-a-uuid');
    expect(missing.status).toBe(404);
  });

  it('returns 402 when the cook is out of credits', async () => {
    const res = await api().post('/api/auth/dev').send({ name: 'Broke Cook' });
    const brokeToken = res.body.token as string;
    const brokeId = res.body.user.id as string;
    const { users } = await import('../src/db/schema.js');
    await ctx.deps.db.update(users).set({ bonusCredits: 0, planCredits: 0 }).where(eq(users.id, brokeId));

    const builder = await api()
      .post('/api/ai/builder')
      .set('authorization', `Bearer ${brokeToken}`)
      .send({ messages: [{ role: 'user', content: 'dal' }] });
    expect(builder.status).toBe(402);
    expect(builder.body.error).toMatchObject({ code: 'insufficient_credits', details: { required: 1, balance: 0 } });

    const video = await api()
      .post('/api/ai/youtube')
      .set('authorization', `Bearer ${brokeToken}`)
      .send({ url: 'https://www.youtube.com/watch?v=xxxxxxxxxxx' });
    expect(video.status).toBe(402);
  });

  it('withdraws contributions from the shared pool when the cook opts out', async () => {
    const res = await authed('patch', '/api/me').send({ sharingOptIn: false });
    expect(res.body.user.sharingOptIn).toBe(false);
    const rows = await ctx.deps.db.select().from(recipeKnowledge).where(eq(recipeKnowledge.userId, userId));
    expect(rows.every((row) => !row.shared)).toBe(true);
  });

  it('accepts RevenueCat webhooks only with the shared secret', async () => {
    const event = { event: { id: 'evt-api-1', type: 'TEST' } };
    expect((await api().post('/api/billing/revenuecat').send(event)).status).toBe(401);
    const ok = await api().post('/api/billing/revenuecat').set('authorization', 'Bearer rc-webhook-secret').send(event);
    expect(ok.status).toBe(200);
    expect(ok.body.processed).toBe(true);
  });

  it('syncs purchases on demand', async () => {
    const res = await authed('post', '/api/billing/sync').send({});
    expect(res.status).toBe(200);
    expect(res.body.balance.total).toBeTypeOf('number');
  });

  it('refreshes sessions', async () => {
    const res = await authed('post', '/api/auth/refresh').send({});
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
  });

  it('returns JSON errors for malformed bodies and unknown routes', async () => {
    const malformed = await api().post('/api/auth/google').set('content-type', 'application/json').send('{"oops"');
    expect(malformed.status).toBe(400);
    expect(malformed.body.error.code).toBe('invalid_request');
    const missing = await api().get('/nope');
    expect(missing.status).toBe(404);
  });

  it('deletes the account and invalidates the session', async () => {
    const res = await authed('delete', '/api/me');
    expect(res.status).toBe(204);
    const after = await authed('get', '/api/me');
    expect(after.status).toBe(401);
  });
});

describe('dev login', () => {
  it('is unavailable unless explicitly enabled', async () => {
    const ctx = await createTestContext({ allowDevLogin: false });
    const res = await request(ctx.app).post('/api/auth/dev').send({ name: 'x' });
    expect(res.status).toBe(404);
    await ctx.close();
  });
});
