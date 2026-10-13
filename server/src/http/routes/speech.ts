import { Router } from 'express';
import { z } from 'zod';
import type { AppDeps } from '../../app.js';
import { LANGUAGES } from '../../domain/languages.js';
import { HttpError } from '../../lib/errors.js';
import { currentUser, limiter, parseBody } from '../middleware.js';

const SpeechBody = z.object({
  text: z.string().trim().min(1).max(800),
  language: z.enum(LANGUAGES),
  voice: z.string().max(40).optional(),
  pace: z.enum(['relaxed', 'normal', 'brisk']).default('normal'),
});

/** POST /api/speech — natural narration for signed-in cooks, as MP3. Cached clips are free and instant. */
export function speechRoutes(deps: AppDeps) {
  const router = Router();
  // Its own budget: narration requests must not use up the AI routes' rate limit.
  router.use(limiter({ windowMs: 60_000, limit: 60, perUser: true }));

  router.post('/', async (req, res) => {
    const speech = deps.speech;
    if (!speech) throw new HttpError(503, 'ai_unavailable', 'Natural voice isn’t available right now.', { reason: 'speech_disabled' });
    const body = parseBody(SpeechBody, req);
    const voice = body.voice && speech.voiceIds.includes(body.voice) ? body.voice : speech.defaultVoice;
    const result = await speech.speak(currentUser(res).id, { text: body.text, language: body.language, voice, pace: body.pace });
    res
      .status(200)
      .set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(result.audio.length),
        'Cache-Control': 'private, max-age=31536000, immutable',
        'X-Speech-Cached': result.cached ? '1' : '0',
        'X-Speech-Duration-Ms': String(result.durationMs),
        'X-Speech-Version': speech.version,
      })
      .end(result.audio);
  });

  return router;
}
