import { Router } from 'express';
import type { AppDeps } from '../../app.js';

export function healthRoutes(deps: AppDeps) {
  const router = Router();
  router.get('/health', (_req, res) => {
    res.json({
      ok: true,
      features: {
        ai: !!deps.ai,
        youtube: !!deps.ai && deps.videoAI,
        devLogin: deps.config.allowDevLogin,
        google: deps.config.google.clientIds.length > 0,
        apple: deps.config.apple.bundleIds.length > 0,
        billing: !!deps.revenueCat,
        naturalVoice: !!deps.speech,
      },
      // Clients include this in their local clip cache key, so a model or style change refreshes audio.
      naturalVoice: deps.speech ? { version: deps.speech.version, voices: deps.speech.voiceIds, defaultVoice: deps.speech.defaultVoice } : null,
    });
  });
  return router;
}
