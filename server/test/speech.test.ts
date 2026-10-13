import request from 'supertest';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { speechClips, speechUsage } from '../src/db/schema.js';
import { AIError } from '../src/lib/errors.js';
import { decodeSpeechAudio, encodeMp3, mp3DurationMs, parseWav, pcmDurationMs, polishSpeech } from '../src/services/audio.js';
import { estimateSpeechMs, normalizeSpeechText, speechStyle } from '../src/services/speech.js';
import { createTestContext, fakeWav, type TestContext } from './helpers.js';

const FSI = String.fromCharCode(0x2068);
const PDI = String.fromCharCode(0x2069);
const STEP = 'Heat the oil in a pan, add the onion and stir until it turns soft and golden, about five minutes.';

describe('speech audio', () => {
  it('reads only the declared data chunk of a WAV, ignoring trailing metadata', () => {
    const audio = parseWav(fakeWav(1000));
    expect(audio).toMatchObject({ sampleRate: 24_000, channels: 1 });
    expect(audio.samples.length).toBe(24_000);
  });

  it('decodes raw L16 PCM with the rate from its MIME type, and passes MP3 through', () => {
    const pcm = Buffer.alloc(16_000 * 2);
    const decoded = decodeSpeechAudio(pcm, 'audio/L16;codec=pcm;rate=16000');
    expect(decoded.kind === 'pcm' && decoded.audio.sampleRate).toBe(16_000);
    const mp3 = decodeSpeechAudio(Buffer.from([0xff, 0xf3, 0x64, 0xc4]), 'audio/mpeg');
    expect(mp3.kind).toBe('mp3');
    expect(() => decodeSpeechAudio(Buffer.from('nope'), 'text/plain')).toThrow();
  });

  it('trims long silences but keeps a natural pause, and fades the edges', () => {
    const rate = 24_000;
    const samples = new Int16Array(rate * 2.5);
    for (let i = rate; i < rate * 1.5; i++) samples[i] = Math.round(Math.sin(i / 10) * 6000);
    const polished = polishSpeech({ samples, sampleRate: rate, channels: 1 });
    const ms = pcmDurationMs(polished);
    // 0.5 s of speech plus a ~160 ms breath either side; the 1 s silences are gone.
    expect(ms).toBeGreaterThan(750);
    expect(ms).toBeLessThan(900);
    expect(polished.samples[0]).toBe(0);
    expect(polished.samples[polished.samples.length - 1]).toBe(0);
  });

  it('encodes compact MP3 whose frames add up to the input length', () => {
    const mp3 = encodeMp3(parseWav(fakeWav(2000)));
    expect(mp3[0]).toBe(0xff);
    expect(mp3[1]! & 0xe0).toBe(0xe0);
    expect(Math.abs(mp3DurationMs(mp3) - 2000)).toBeLessThan(150);
    expect(mp3.length).toBeLessThan(14_000);
  });
});

describe('speech text', () => {
  it('normalizes text before hashing so trivial differences share a clip', () => {
    expect(normalizeSpeechText(`  Stir  🙂 the ${FSI}onions${PDI}\n`)).toBe('Stir the onions');
  });

  it('describes a warm, human delivery that follows pace and accent', () => {
    expect(speechStyle('en', 'relaxed')).toMatch(/warm/i);
    expect(speechStyle('en', 'relaxed')).toMatch(/unhurried/);
    expect(speechStyle('en', 'brisk')).toMatch(/quicker/);
    expect(speechStyle('pt', 'normal')).toMatch(/Brazilian/);
  });

  it('expects Japanese characters to take longer to say than Latin ones', () => {
    expect(estimateSpeechMs('あいうえおかきくけこ'.repeat(5), 'ja')).toBeGreaterThan(estimateSpeechMs('abcdefghij'.repeat(5), 'en'));
  });
});

describe('POST /api/speech', () => {
  let ctx: TestContext;
  const tokens: string[] = [];
  const say = (body: Record<string, unknown>, token = tokens[0]) =>
    request(ctx.app).post('/api/speech').set('authorization', `Bearer ${token}`).send(body);

  beforeAll(async () => {
    ctx = await createTestContext();
    for (const sub of ['speech-a', 'speech-b']) {
      const res = await request(ctx.app).post('/api/auth/google').send({ idToken: await ctx.googleToken({ sub }) });
      tokens.push(res.body.token);
    }
  });
  afterAll(async () => {
    await ctx.close();
  });

  it('is only for signed-in cooks and validates the request', async () => {
    expect((await request(ctx.app).post('/api/speech').send({ text: 'Hi', language: 'en' })).status).toBe(401);
    expect((await say({ text: 'Hi' })).status).toBe(400);
    expect((await say({ text: 'Hi', language: 'hi' })).status).toBe(400);
    expect((await say({ text: 'x'.repeat(801), language: 'en' })).status).toBe(400);
  });

  it('returns MP3, sends the style as metadata only, and caches the clip for everyone', async () => {
    const first = await say({ text: STEP, language: 'en', voice: 'warm', pace: 'relaxed' });
    expect(first.status).toBe(200);
    expect(first.headers['content-type']).toBe('audio/mpeg');
    expect(first.headers['x-speech-cached']).toBe('0');
    expect(Number(first.headers['x-speech-duration-ms'])).toBeGreaterThan(1000);
    const body = first.body as Buffer;
    expect(body[0]).toBe(0xff);
    expect(ctx.speech.calls).toHaveLength(1);
    expect(ctx.speech.calls[0]).toMatchObject({ text: STEP, language: 'en', voice: 'Sulafat' });
    expect(ctx.speech.calls[0]!.style).toMatch(/warm/i);
    expect(ctx.speech.calls[0]!.text).not.toMatch(/warm/i);

    const second = await say({ text: `  ${STEP} `, language: 'en', voice: 'warm', pace: 'relaxed' }, tokens[1]);
    expect(second.status).toBe(200);
    expect(second.headers['x-speech-cached']).toBe('1');
    expect(Buffer.compare(second.body as Buffer, body)).toBe(0);
    expect(ctx.speech.calls).toHaveLength(1);
  });

  it('keeps separate clips per voice, language and pace', async () => {
    const before = ctx.speech.calls.length;
    await say({ text: STEP, language: 'en', voice: 'friendly', pace: 'relaxed' });
    await say({ text: STEP, language: 'en', voice: 'warm', pace: 'brisk' });
    await say({ text: 'Calienta el aceite en una sartén y añade la cebolla.', language: 'es', voice: 'warm' });
    expect(ctx.speech.calls.slice(before).map((c) => [c.voice, c.language])).toEqual([
      ['Achird', 'en'],
      ['Sulafat', 'en'],
      ['Sulafat', 'es'],
    ]);
  });

  it('falls back to the default voice for unknown voice ids', async () => {
    const res = await say({ text: 'Taste and add a pinch more salt if you like.', language: 'en', voice: 'robot' });
    expect(res.status).toBe(200);
    expect(ctx.speech.calls.at(-1)!.voice).toBe('Sulafat');
  });

  it('synthesizes concurrent identical requests only once', async () => {
    const before = ctx.speech.calls.length;
    ctx.speech.delayMs = 60;
    const text = 'Let the rice rest for five minutes with the lid on.';
    const results = await Promise.all([say({ text, language: 'en' }), say({ text, language: 'en' }, tokens[1]), say({ text, language: 'en' })]);
    ctx.speech.delayMs = 0;
    expect(results.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(ctx.speech.calls.length - before).toBe(1);
  });

  it('refunds the reserved time when synthesis fails, and never caches a broken clip', async () => {
    const usage = async () => {
      const rows = await ctx.database.db.select().from(speechUsage).where(eq(speechUsage.scope, 'global'));
      return rows.reduce((sum, row) => sum + row.reservedMs, 0);
    };
    const start = await usage();
    ctx.speech.queue.push(new AIError('upstream', 'boom'));
    const failed = await say({ text: 'Fold in the herbs at the very end.', language: 'en' });
    expect(failed.status).toBe(502);
    expect(failed.body.error.code).toBe('ai_failed');
    expect(await usage()).toBe(start);

    // A tiny clip for a long sentence is broken audio: rejected and not cached.
    ctx.speech.queue.push({ data: fakeWav(120), mimeType: 'audio/wav' });
    const text = 'Simmer gently for twenty minutes, stirring now and then so nothing catches on the bottom of the pot.';
    expect((await say({ text, language: 'en' })).status).toBe(502);
    const retry = await say({ text, language: 'en' });
    expect(retry.status).toBe(200);
    expect(retry.headers['x-speech-cached']).toBe('0');
  });

  it('reports natural voice in /health', async () => {
    const health = await request(ctx.app).get('/health');
    expect(health.body.features.naturalVoice).toBe(true);
    expect(health.body.naturalVoice).toMatchObject({ version: '1:fake-tts', voices: ['warm', 'friendly'], defaultVoice: 'warm' });
  });

  it('prunes clips nobody has played for 90 days', async () => {
    const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);
    await ctx.database.db.update(speechClips).set({ lastUsedAt: old });
    const { clips } = await ctx.deps.speech!.prune();
    expect(clips).toBeGreaterThan(0);
    expect(await ctx.database.db.select().from(speechClips)).toHaveLength(0);
  });
});

describe('natural voice limits', () => {
  it('stops a cook at their daily allowance of new narration', async () => {
    const ctx = await createTestContext({ speech: { userDailySeconds: 6 } });
    const res = await request(ctx.app).post('/api/auth/google').send({ idToken: await ctx.googleToken({ sub: 'limited' }) });
    const say = (text: string) => request(ctx.app).post('/api/speech').set('authorization', `Bearer ${res.body.token}`).send({ text, language: 'en' });
    expect((await say('Crack the eggs into a bowl.')).status).toBe(200);
    const limited = await say(STEP);
    expect(limited.status).toBe(429);
    expect(limited.body.error).toMatchObject({ code: 'speech_limit', details: { reason: 'user_daily' } });
    // Cached clips stay free.
    expect((await say('Crack the eggs into a bowl.')).status).toBe(200);
    await ctx.close();
  });

  it('has a global budget that protects the service from runaway cost', async () => {
    const ctx = await createTestContext({ speech: { globalDailySeconds: 2 } });
    const res = await request(ctx.app).post('/api/auth/google').send({ idToken: await ctx.googleToken({ sub: 'budget' }) });
    const limited = await request(ctx.app).post('/api/speech').set('authorization', `Bearer ${res.body.token}`).send({ text: STEP, language: 'en' });
    expect(limited.status).toBe(429);
    expect(limited.body.error.details).toEqual({ reason: 'global_daily' });
    await ctx.close();
  });

  it('is unavailable when natural voice is switched off', async () => {
    const ctx = await createTestContext({ speech: false });
    const res = await request(ctx.app).post('/api/auth/google').send({ idToken: await ctx.googleToken({ sub: 'off' }) });
    const off = await request(ctx.app).post('/api/speech').set('authorization', `Bearer ${res.body.token}`).send({ text: 'Hello', language: 'en' });
    expect(off.status).toBe(503);
    expect(off.body.error.details).toEqual({ reason: 'speech_disabled' });
    expect((await request(ctx.app).get('/health')).body.naturalVoice).toBeNull();
    await ctx.close();
  });
});
