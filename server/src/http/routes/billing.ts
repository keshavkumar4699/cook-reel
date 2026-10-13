import { Router } from 'express';
import type { AppDeps } from '../../app.js';
import { HttpError } from '../../lib/errors.js';
import { handleRevenueCatWebhook, syncBilling, webhookAuthorized } from '../../services/billing.js';
import { getBalance } from '../../services/credits.js';
import { currentUser, limiter } from '../middleware.js';

export function billingRoutes(deps: AppDeps) {
  const router = Router();

  /** Called by the app right after a purchase or restore, so credits appear without waiting for webhooks. */
  router.post('/sync', limiter({ windowMs: 60 * 1000, limit: 10, perUser: true }), async (_req, res) => {
    const user = currentUser(res);
    const balance = deps.revenueCat
      ? await syncBilling(deps.db, deps.pricing, deps.revenueCat, user.id)
      : await getBalance(deps.db, deps.pricing, user.id);
    res.json({ balance });
  });

  return router;
}

export function revenueCatWebhookRoute(deps: AppDeps) {
  const router = Router();
  router.post('/', async (req, res) => {
    if (!deps.revenueCat || !deps.config.revenueCat.webhookAuth) {
      throw new HttpError(503, 'billing_unavailable', 'Billing is not configured.');
    }
    if (!webhookAuthorized(deps.config.revenueCat.webhookAuth, req.get('authorization'))) {
      throw new HttpError(401, 'unauthorized', 'Invalid webhook credentials.');
    }
    const result = await handleRevenueCatWebhook(deps.db, deps.pricing, deps.revenueCat, req.body, deps.logger);
    res.json(result);
  });
  return router;
}
