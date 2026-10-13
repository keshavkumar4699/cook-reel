import type { Logger } from 'pino';
import type { AppDeps } from './app.js';
import type { Config } from './config.js';
import type { Db } from './db/client.js';
import { loadPricing } from './domain/pricing.js';
import { fetchOEmbed } from './domain/youtube.js';
import { createAppleTokenService, createIdentityVerifier, createSecretBox, createSessionSigner } from './services/auth.js';
import { createRevenueCatClient } from './services/billing.js';
import { createClaudeRecipeAI } from './services/claude.js';
import { createGemini } from './services/gemini.js';
import { createImportService } from './services/imports.js';
import { createKnowledgeBase } from './services/knowledge.js';

/** Wires real implementations together. Tests build AppDeps by hand with fakes instead. */
export function createDeps(config: Config, db: Db, logger: Logger): AppDeps {
  const pricing = loadPricing(config.pricingConfigPath);
  const ai = config.claude ? createClaudeRecipeAI(config.claude, logger) : null;
  const gemini = config.gemini ? createGemini(config.gemini, logger) : null;
  const knowledge = createKnowledgeBase(db, gemini?.embedder ?? null, logger);

  return {
    config,
    db,
    logger,
    pricing,
    sessions: createSessionSigner(config.jwtSecret, config.sessionTtlDays),
    identity: createIdentityVerifier({ googleClientIds: config.google.clientIds, appleAudiences: config.apple.bundleIds }),
    appleTokens: createAppleTokenService(config.apple.revocation),
    box: createSecretBox(config.jwtSecret),
    ai,
    videoAI: !!gemini,
    knowledge,
    imports: createImportService({
      db,
      pricing,
      ai,
      analyzer: gemini?.analyzer ?? null,
      knowledge,
      oembed: fetchOEmbed,
      logger,
      concurrency: config.importConcurrency,
    }),
    revenueCat: config.revenueCat.secretKey ? createRevenueCatClient(config.revenueCat.secretKey) : null,
  };
}
