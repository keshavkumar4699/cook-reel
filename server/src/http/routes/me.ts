import { Router } from 'express';
import { z } from 'zod';
import type { AppDeps } from '../../app.js';
import { getBalance } from '../../services/credits.js';
import { deleteAccount, toUserView, updateUser } from '../../services/users.js';
import { currentUser, parseBody } from '../middleware.js';

const PatchBody = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  sharingOptIn: z.boolean().optional(),
});

export function meRoutes(deps: AppDeps) {
  const router = Router();

  router.get('/', async (_req, res) => {
    const user = currentUser(res);
    res.json({ user: await toUserView(deps.db, user), balance: await getBalance(deps.db, deps.pricing, user.id) });
  });

  router.patch('/', async (req, res) => {
    const patch = parseBody(PatchBody, req);
    const user = await updateUser(deps.db, currentUser(res).id, patch);
    res.json({ user: await toUserView(deps.db, user), balance: await getBalance(deps.db, deps.pricing, user.id) });
  });

  router.delete('/', async (_req, res) => {
    const user = currentUser(res);
    await deleteAccount(deps.db, user.id, {
      apple: deps.appleTokens,
      appleClientIds: deps.config.apple.bundleIds,
      box: deps.box,
      logger: deps.logger,
    });
    deps.logger.info({ userId: user.id }, 'account deleted');
    res.status(204).end();
  });

  return router;
}
