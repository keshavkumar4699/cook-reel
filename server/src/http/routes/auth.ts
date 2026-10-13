import { Router } from 'express';
import { z } from 'zod';
import type { AppDeps } from '../../app.js';
import type { UserRow } from '../../db/schema.js';
import { HttpError } from '../../lib/errors.js';
import type { VerifiedIdentity } from '../../services/auth.js';
import { getBalance } from '../../services/credits.js';
import { signInWithIdentity, toUserView } from '../../services/users.js';
import { currentUser, limiter, parseBody, requireAuth } from '../middleware.js';

const GoogleBody = z.object({ idToken: z.string().min(20).max(8000) });
const AppleBody = z.object({
  identityToken: z.string().min(20).max(8000),
  authorizationCode: z.string().max(1000).nullish(),
  fullName: z.string().trim().max(120).nullish(),
});
const DevBody = z.object({ name: z.string().trim().min(1).max(60).default('Dev Cook') });

export function authRoutes(deps: AppDeps) {
  const router = Router();
  router.use(limiter({ windowMs: 10 * 60 * 1000, limit: 30 }));

  async function session(user: UserRow, extra: { isNew: boolean; starterCreditsGranted: number }) {
    const { token, expiresAt } = await deps.sessions.sign(user.id);
    return {
      token,
      expiresAt,
      user: await toUserView(deps.db, user),
      balance: await getBalance(deps.db, deps.pricing, user.id),
      ...extra,
    };
  }

  async function signIn(identity: VerifiedIdentity, appleRefreshToken?: string | null) {
    const result = await signInWithIdentity(deps.db, deps.pricing, identity, { appleRefreshToken, box: deps.box });
    deps.logger.info({ userId: result.user.id, provider: identity.provider, isNew: result.isNew }, 'sign in');
    return session(result.user, { isNew: result.isNew, starterCreditsGranted: result.starterCreditsGranted });
  }

  router.post('/google', async (req, res) => {
    const { idToken } = parseBody(GoogleBody, req);
    res.json(await signIn(await deps.identity.google(idToken)));
  });

  router.post('/apple', async (req, res) => {
    const body = parseBody(AppleBody, req);
    const identity = await deps.identity.apple(body.identityToken, body.fullName);
    let refreshToken: string | null = null;
    const clientId = deps.config.apple.bundleIds[0];
    if (body.authorizationCode && deps.appleTokens && clientId) {
      refreshToken = await deps.appleTokens.exchangeCode(body.authorizationCode, clientId).catch((err: unknown) => {
        deps.logger.warn({ err }, 'apple authorization code exchange failed');
        return null;
      });
    }
    res.json(await signIn(identity, refreshToken));
  });

  router.post('/dev', async (req, res) => {
    if (!deps.config.allowDevLogin) throw new HttpError(404, 'not_found', 'Not found.');
    const { name } = parseBody(DevBody, req);
    const subject = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    res.json(await signIn({ provider: 'dev', subject, email: null, name, avatarUrl: null }));
  });

  router.post('/refresh', requireAuth(deps.db, deps.sessions), async (_req, res) => {
    res.json(await session(currentUser(res), { isNew: false, starterCreditsGranted: 0 }));
  });

  return router;
}
