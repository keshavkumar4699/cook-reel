import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import type { Config } from './config.js';
import type { Db } from './db/client.js';
import type { Pricing } from './domain/pricing.js';
import { errorHandler, notFound, requireAuth } from './http/middleware.js';
import { aiRoutes } from './http/routes/ai.js';
import { authRoutes } from './http/routes/auth.js';
import { billingRoutes, revenueCatWebhookRoute } from './http/routes/billing.js';
import { healthRoutes } from './http/routes/health.js';
import { meRoutes } from './http/routes/me.js';
import { pricingRoutes } from './http/routes/pricing.js';
import { speechRoutes } from './http/routes/speech.js';
import type { AppleTokenService, IdentityVerifier, SecretBox, SessionSigner } from './services/auth.js';
import type { RevenueCatClient } from './services/billing.js';
import type { RecipeAI } from './services/claude.js';
import type { ImportService } from './services/imports.js';
import type { KnowledgeBase } from './services/knowledge.js';
import type { SpeechService } from './services/speech.js';

export interface AppDeps {
  config: Config;
  db: Db;
  logger: Logger;
  pricing: Pricing;
  sessions: SessionSigner;
  identity: IdentityVerifier;
  appleTokens: AppleTokenService | null;
  box: SecretBox;
  ai: RecipeAI | null;
  videoAI: boolean;
  knowledge: KnowledgeBase;
  imports: ImportService;
  revenueCat: RevenueCatClient | null;
  /** Natural narration; null when TTS is disabled or Gemini isn't configured. */
  speech: SpeechService | null;
}

export function createApp(deps: AppDeps) {
  const app = express();
  app.disable('x-powered-by');
  // Behind a single reverse proxy / load balancer in production (Render, Fly, Railway, Cloud Run…).
  app.set('trust proxy', deps.config.isProduction ? 1 : false);

  app.use(helmet());
  app.use(
    cors({
      ...(deps.config.corsOrigins.length ? { origin: deps.config.corsOrigins } : {}),
      exposedHeaders: ['X-Speech-Cached', 'X-Speech-Duration-Ms', 'X-Speech-Version'],
    }),
  );
  if (!deps.config.isTest) {
    app.use(
      pinoHttp({
        logger: deps.logger,
        autoLogging: { ignore: (req) => req.url === '/health' },
        redact: ['req.headers.authorization'],
      }),
    );
  }
  app.use(express.json({ limit: '300kb' }));

  app.use(healthRoutes(deps));
  app.use('/api/pricing', pricingRoutes(deps));
  app.use('/api/auth', authRoutes(deps));
  app.use('/api/billing/revenuecat', revenueCatWebhookRoute(deps));

  const authed = express.Router();
  authed.use(requireAuth(deps.db, deps.sessions));
  authed.use('/me', meRoutes(deps));
  authed.use('/ai', aiRoutes(deps));
  authed.use('/billing', billingRoutes(deps));
  authed.use('/speech', speechRoutes(deps));
  app.use('/api', authed);

  app.use(notFound());
  app.use(errorHandler(deps.logger));
  return app;
}
