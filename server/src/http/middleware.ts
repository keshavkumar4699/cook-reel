import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import type { Logger } from 'pino';
import { z } from 'zod';
import type { UserRow } from '../db/schema.js';
import { HttpError, toHttpError } from '../lib/errors.js';
import type { SessionSigner } from '../services/auth.js';
import { getUser } from '../services/users.js';
import type { Db } from '../db/client.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      user?: UserRow;
    }
  }
}

export function currentUser(res: Response): UserRow {
  const user = res.locals.user;
  if (!user) throw new HttpError(401, 'unauthorized', 'Please sign in to continue.');
  return user;
}

export function parseBody<T extends z.ZodType>(schema: T, req: Request): z.infer<T> {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    throw new HttpError(400, 'invalid_request', 'Some of the details sent were invalid.', {
      issues: result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    });
  }
  return result.data;
}

/** Verifies the bearer session token and loads the user. AI features always require an account. */
export function requireAuth(db: Db, sessions: SessionSigner): RequestHandler {
  return async (req, res, next) => {
    const header = req.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) throw new HttpError(401, 'unauthorized', 'Sign in to use AI features.');
    const { userId } = await sessions.verify(token);
    const user = await getUser(db, userId);
    if (!user) throw new HttpError(401, 'unauthorized', 'Your account no longer exists. Please sign in again.');
    res.locals.user = user;
    next();
  };
}

export function limiter(options: { windowMs: number; limit: number; perUser?: boolean }): RequestHandler {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (req, res) => (options.perUser && res.locals.user ? `user:${res.locals.user.id}` : ipKeyGenerator(req.ip ?? '0.0.0.0')),
    handler: (_req, _res, next: NextFunction) =>
      next(new HttpError(429, 'rate_limited', "You're going a little fast — give it a moment and try again.")),
  });
}

export function notFound(): RequestHandler {
  return (_req, _res, next) => next(new HttpError(404, 'not_found', 'Not found.'));
}

export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (error, req, res, _next) => {
    let http = toHttpError(error);
    if (!http && error && typeof error === 'object' && 'type' in error) {
      const type = (error as { type?: string }).type;
      if (type === 'entity.parse.failed') http = new HttpError(400, 'invalid_request', 'Request body is not valid JSON.');
      if (type === 'entity.too.large') http = new HttpError(413, 'invalid_request', 'Request is too large.');
    }
    if (!http) {
      logger.error({ err: error, method: req.method, path: req.path }, 'unhandled error');
      http = new HttpError(500, 'internal', 'Something went wrong on our side. Please try again.');
    } else if (http.status >= 500) {
      logger.warn({ err: error, code: http.code, path: req.path }, 'request failed');
    }
    if (res.headersSent) return;
    res.status(http.status).json({ error: { code: http.code, message: http.message, ...(http.details ? { details: http.details } : {}) } });
  };
}
