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
      },
    });
  });
  return router;
}
