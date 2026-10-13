import { Router } from 'express';
import type { AppDeps } from '../../app.js';

/** Public catalogue the app renders on its pricing page (store prices override displayPrice). */
export function pricingRoutes(deps: AppDeps) {
  const router = Router();
  router.get('/', (_req, res) => {
    const { starterCredits, costs, plans, topups, entitlementId } = deps.pricing;
    res.set('cache-control', 'public, max-age=300');
    res.json({ starterCredits, costs, plans, topups, entitlementId });
  });
  return router;
}
