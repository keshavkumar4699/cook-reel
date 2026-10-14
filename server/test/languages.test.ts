import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { importJobs } from '../src/db/schema.js';
import { applyTranslation, normalizeRecipe, RecipeDraftSchema, translatableText } from '../src/domain/recipe.js';
import { canonicalUnit } from '../src/domain/units.js';
import { AIError } from '../src/lib/errors.js';
import { buildBuilderMessages, outputLanguageBlock } from '../src/services/claude.js';
import { BUILDER_SYSTEM_PROMPT, EXPERIMENT_SYSTEM_PROMPT, VIDEO_SYSTEM_PROMPT } from '../src/services/prompts.js';
import { createTestContext, sampleBreakdown, sampleDraft, type TestContext } from './helpers.js';

describe('recipes in every language', () => {
  it('stores canonical unit codes whatever language the model wrote them in', () => {
    expect(['cucharadas', 'EL', '大さじ', 'Tbsp.', 'ملعقة كبيرة'].map(canonicalUnit)).toEqual(['tbsp', 'tbsp', 'tbsp', 'tbsp', 'tbsp']);
    expect(canonicalUnit('gousses')).toBe('clove');
    expect(canonicalUnit('')).toBe('');
    expect(canonicalUnit('a thumb-sized piece')).toBe('a thumb-sized piece');
    const draft = sampleDraft();
    const recipe = normalizeRecipe(
      { ...draft, ingredients: draft.ingredients.map((i, n) => ({ ...i, unit: ['', 'Stück', 'cucharada'][n] ?? i.unit })) },
      { source: 'ai' },
    );
    expect(recipe.ingredients.map((i) => i.unit).slice(0, 3)).toEqual(['', 'piece', 'tbsp']);
  });

  it('records the language the model wrote in, falling back to the one asked for', () => {
    expect(normalizeRecipe(sampleDraft({ language: 'es' }), { source: 'ai', language: 'fr' }).language).toBe('es');
    expect(normalizeRecipe(sampleDraft({ language: 'pt-BR' }), { source: 'ai' }).language).toBe('pt');
    expect(normalizeRecipe(sampleDraft({ language: 'klingon' }), { source: 'ai', language: 'ja' }).language).toBe('ja');
    expect(normalizeRecipe(sampleDraft({ language: '' }), { source: 'ai' }).language).toBe('en');
  });

  it('fills gaps the model leaves in the recipe language', () => {
    const draft = sampleDraft({ language: 'ja', title: '  ' });
    const recipe = normalizeRecipe({ ...draft, steps: draft.steps.map((s) => ({ ...s, title: '' })) }, { source: 'ai' });
    expect(recipe.title).toBe('無題のレシピ');
    expect(recipe.steps[0]!.title).toBe('次のステップ');
  });

  it('asks the model to commit to a language before writing anything', () => {
    expect(Object.keys(RecipeDraftSchema.shape)[0]).toBe('language');
  });

  it('applies a translation to the text only, keeping quantities, units, timings and clips', () => {
    const draft = sampleDraft();
    const original = normalizeRecipe(
      { ...draft, steps: draft.steps.map((s, i) => ({ ...s, clipStartSec: i * 10, clipEndSec: i * 10 + 8 })) },
      { source: 'youtube', durationSec: 120 },
    );
    const text = translatableText(original);
    const translated = applyTranslation(
      original,
      {
        ...text,
        language: 'es',
        title: 'Huevos revueltos masala',
        ingredients: text.ingredients.map((i) => ({ ...i, name: `${i.name} (es)` })),
        steps: text.steps.map((s) => ({ ...s, instruction: `${s.instruction} (es)` })),
      },
      'es',
    );
    expect(translated.language).toBe('es');
    expect(translated.title).toBe('Huevos revueltos masala');
    expect(translated.ingredients.map((i) => [i.quantity, i.unit, i.nutrition])).toEqual(original.ingredients.map((i) => [i.quantity, i.unit, i.nutrition]));
    expect(translated.steps.map((s) => [s.clip, s.durationSec])).toEqual(original.steps.map((s) => [s.clip, s.durationSec]));
    expect(translated.nutrition).toEqual(original.nutrition);
    expect(translated.ingredients[0]!.name).toBe(`${original.ingredients[0]!.name} (es)`);
    expect(() => applyTranslation(original, { ...text, language: 'es', steps: text.steps.slice(1) }, 'es')).toThrow();
  });

  it('keeps every system prompt the same for all languages: the language goes in the user turn', () => {
    for (const prompt of [BUILDER_SYSTEM_PROMPT, EXPERIMENT_SYSTEM_PROMPT, VIDEO_SYSTEM_PROMPT]) {
      expect(prompt).not.toMatch(/Japanese|Spanish|Arabic/);
      expect(prompt).toContain('<output_language>');
    }
    const messages = buildBuilderMessages({
      messages: [{ role: 'user', content: 'カレーを作りたい' }],
      mode: 'describe',
      pantry: [],
      references: [],
      forceRecipe: false,
      language: 'ja',
    });
    const first = messages[0]!.content as Array<{ type: 'text'; text: string }>;
    expect(first[0]!.text.startsWith(outputLanguageBlock('ja'))).toBe(true);
    expect(first[0]!.text).toContain('Japanese');
  });
});

describe('AI routes in the cook\'s language', () => {
  let ctx: TestContext;
  let token: string;
  const authed = (method: 'get' | 'post', path: string, as = token) => request(ctx.app)[method](path).set('authorization', `Bearer ${as}`);
  const signIn = async (sub: string) =>
    (await request(ctx.app).post('/api/auth/google').send({ idToken: await ctx.googleToken({ sub }) })).body.token as string;

  beforeAll(async () => {
    ctx = await createTestContext();
    token = await signIn('lang-user');
  });
  afterAll(async () => {
    await ctx.close();
  });

  it('passes the language to Chef, and treats old apps that send none as English', async () => {
    await authed('post', '/api/ai/builder').send({ messages: [{ role: 'user', content: 'quiero algo rápido' }], language: 'es' });
    expect(ctx.ai.builderCalls.at(-1)!.language).toBe('es');
    await authed('post', '/api/ai/builder').send({ messages: [{ role: 'user', content: 'something quick' }] });
    expect(ctx.ai.builderCalls.at(-1)!.language).toBe('en');
    expect((await authed('post', '/api/ai/builder').send({ messages: [{ role: 'user', content: 'x' }], language: 'hi' })).status).toBe(400);

    ctx.ai.builderQueue.push({ kind: 'recipe', message: 'Voilà !', suggestions: [], recipe: sampleDraft({ language: 'fr' }) });
    const res = await authed('post', '/api/ai/builder').send({ messages: [{ role: 'user', content: 'une omelette' }], language: 'fr' });
    expect(res.body.recipe.language).toBe('fr');

    const experiment = await authed('post', '/api/ai/experiment').send({
      recipe: { title: 'Bhurji', servings: 2, ingredients: [{ name: 'Eggs', quantity: 4 }], steps: [{ instruction: 'Scramble.' }] },
      instruction: 'vegano',
      language: 'it',
    });
    expect(experiment.status).toBe(200);
    expect(ctx.ai.experimentCalls.at(-1)!.language).toBe('it');
  });

  it('translates an analysed video for a new language once, for free, without watching it again', async () => {
    const url = 'https://www.youtube.com/watch?v=lAnGuAgE001';
    const english = await authed('post', '/api/ai/youtube').send({ url, language: 'en' });
    expect(english.status).toBe(202);
    await ctx.deps.imports.idle();
    const analyses = ctx.analyzer.calls.length;
    const videoCalls = ctx.ai.videoCalls.length;

    const spanish = await authed('post', '/api/ai/youtube').send({ url, language: 'es' });
    expect(spanish.status).toBe(202);
    expect(spanish.body).toMatchObject({ creditsCharged: 0, language: 'es' });
    await ctx.deps.imports.idle();
    const done = await authed('get', `/api/ai/youtube/${spanish.body.id}`);
    expect(done.body.status).toBe('done');
    expect(done.body.recipe.language).toBe('es');
    expect(done.body.recipe.title).toMatch(/^\[es\] /);
    expect(done.body.recipe.steps[0].clip).toEqual((await authed('get', `/api/ai/youtube/${english.body.id}`)).body.recipe.steps[0].clip);
    expect(ctx.analyzer.calls.length).toBe(analyses);
    expect(ctx.ai.videoCalls.length).toBe(videoCalls);
    expect(ctx.ai.translateCalls).toHaveLength(1);

    // Every other Spanish-speaking cook gets the stored translation straight away.
    const other = await signIn('lang-other');
    const cached = await authed('post', '/api/ai/youtube', other).send({ url, language: 'es' });
    expect(cached.status).toBe(200);
    expect(cached.body).toMatchObject({ cached: true, creditsCharged: 0 });
    expect(cached.body.recipe.language).toBe('es');
    expect(ctx.ai.translateCalls).toHaveLength(1);
  });

  it('serves the original recipe when a translation fails', async () => {
    const url = 'https://www.youtube.com/watch?v=lAnGuAgE002';
    await authed('post', '/api/ai/youtube').send({ url, language: 'en' });
    await ctx.deps.imports.idle();
    ctx.ai.translateQueue.push(new AIError('upstream', 'boom'));
    const german = await authed('post', '/api/ai/youtube').send({ url, language: 'de' });
    await ctx.deps.imports.idle();
    const done = await authed('get', `/api/ai/youtube/${german.body.id}`);
    expect(done.body.status).toBe('done');
    expect(done.body.recipe.language).toBe('en');
  });

  it('keeps one import job per language for the same video', async () => {
    const url = 'https://www.youtube.com/watch?v=lAnGuAgE003';
    ctx.analyzer.delayMs = 40;
    const french = await authed('post', '/api/ai/youtube').send({ url, language: 'fr' });
    const frenchAgain = await authed('post', '/api/ai/youtube').send({ url, language: 'fr' });
    expect(frenchAgain.body.id).toBe(french.body.id);
    await ctx.deps.imports.idle();
    ctx.analyzer.delayMs = 0;
    const done = await authed('get', `/api/ai/youtube/${french.body.id}`);
    expect(ctx.ai.videoCalls.at(-1)!.language).toBe('fr');
    expect(done.body.language).toBe('fr');
  });

  it('gives failures stable codes the app can word in any language', async () => {
    ctx.analyzer.queue.push(sampleBreakdown({ isCookingVideo: false, steps: [] }));
    const started = await authed('post', '/api/ai/youtube').send({ url: 'https://www.youtube.com/watch?v=lAnGuAgE004', language: 'ja' });
    await ctx.deps.imports.idle();
    const failed = await authed('get', `/api/ai/youtube/${started.body.id}`);
    expect(failed.body).toMatchObject({ status: 'failed', errorCode: 'not_a_recipe_video' });

    const bad = await authed('post', '/api/ai/youtube').send({ url: 'https://vimeo.com/1', language: 'ja' });
    expect(bad.body.error.details).toEqual({ reason: 'invalid_link' });
    ctx.oembed.result = { ok: false, reason: 'not_embeddable' };
    const blocked = await authed('post', '/api/ai/youtube').send({ url: 'https://www.youtube.com/watch?v=lAnGuAgE005' });
    expect(blocked.body.error.details).toEqual({ reason: 'not_embeddable' });
    ctx.oembed.result = { ok: false, reason: 'not_found' };
    const missing = await authed('post', '/api/ai/youtube').send({ url: 'https://www.youtube.com/watch?v=lAnGuAgE006' });
    expect(missing.body.error.details).toEqual({ reason: 'video_not_found' });
    ctx.oembed.result = { ok: true, meta: { title: 't', channel: null, thumbnailUrl: 'x' } };
  });

  it('marks jobs cut short by a restart as interrupted', async () => {
    // A fresh cook: the AI routes' per-minute limit is spent by the tests above.
    const cook = await signIn('lang-restart');
    const [job] = await ctx.database.db
      .insert(importJobs)
      .values({ userId: (await authed('get', '/api/me', cook)).body.user.id, videoId: 'lAnGuAgE007', url: 'u', status: 'watching', language: 'ar' })
      .returning();
    await ctx.deps.imports.recoverInterrupted();
    const view = await authed('get', `/api/ai/youtube/${job!.id}`, cook);
    expect(view.body).toMatchObject({ status: 'failed', errorCode: 'import_interrupted', language: 'ar' });
  });
});
