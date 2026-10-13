import { z } from 'zod';

const csv = z
  .string()
  .optional()
  .transform((value) =>
    (value ?? '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
  );

const bool = (fallback: boolean) =>
  z
    .enum(['true', 'false', '1', '0', ''])
    .optional()
    .transform((value) => (value === undefined || value === '' ? fallback : value === 'true' || value === '1'));

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8787),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),

  /** Postgres connection string. When absent, an embedded Postgres (PGlite) is used (dev/test only). */
  DATABASE_URL: z.string().optional(),
  PGLITE_DIR: z.string().default('.data/pglite'),

  JWT_SECRET: z.string().optional(),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),

  ANTHROPIC_API_KEY: z.string().optional(),
  CLAUDE_MODEL: z.string().default('claude-opus-5-5'),
  CLAUDE_EFFORT: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).default('medium'),
  /** Server-side refusal fallbacks (Claude API only). Disable when routing through Bedrock/Vertex/proxies. */
  CLAUDE_FALLBACKS: bool(true),

  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash'),
  GEMINI_EMBEDDING_MODEL: z.string().default('gemini-embedding-001'),

  /** OAuth client IDs whose Google ID tokens we accept (web, iOS and Android client IDs). */
  GOOGLE_CLIENT_IDS: csv,
  /** Bundle IDs / Services IDs whose Apple identity tokens we accept. */
  APPLE_BUNDLE_IDS: csv,
  /** Optional: enables Sign in with Apple token revocation on account deletion (App Store requirement). */
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),

  REVENUECAT_WEBHOOK_AUTH: z.string().optional(),
  REVENUECAT_SECRET_KEY: z.string().optional(),

  ALLOW_DEV_LOGIN: z.enum(['true', 'false']).optional(),
  CORS_ORIGINS: csv,
  PRICING_CONFIG_PATH: z.string().optional(),
  IMPORT_CONCURRENCY: z.coerce.number().int().min(1).max(20).default(3),
});

export type Config = ReturnType<typeof loadConfig>;

const DEV_JWT_SECRET = 'cookreel-dev-secret-change-me-0123456789abcdef';

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  const e = parsed.data;
  const isProduction = e.NODE_ENV === 'production';

  if (isProduction) {
    const missing: string[] = [];
    if (!e.DATABASE_URL) missing.push('DATABASE_URL');
    if (!e.JWT_SECRET || e.JWT_SECRET.length < 32) missing.push('JWT_SECRET (min 32 chars)');
    if (missing.length) throw new Error(`Missing required production settings: ${missing.join(', ')}`);
    if (e.ALLOW_DEV_LOGIN === 'true') throw new Error('ALLOW_DEV_LOGIN must never be enabled in production');
  }

  const appleRevocation =
    e.APPLE_TEAM_ID && e.APPLE_KEY_ID && e.APPLE_PRIVATE_KEY
      ? {
          teamId: e.APPLE_TEAM_ID,
          keyId: e.APPLE_KEY_ID,
          // Allow the .p8 key to be provided on one line with literal "\n" sequences.
          privateKey: e.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }
      : null;

  return {
    env: e.NODE_ENV,
    isProduction,
    isTest: e.NODE_ENV === 'test',
    port: e.PORT,
    host: e.HOST,
    logLevel: e.LOG_LEVEL ?? (e.NODE_ENV === 'test' ? 'silent' : isProduction ? 'info' : 'debug'),
    database: e.DATABASE_URL ? ({ kind: 'postgres', url: e.DATABASE_URL } as const) : ({ kind: 'pglite', dir: e.PGLITE_DIR } as const),
    jwtSecret: e.JWT_SECRET ?? DEV_JWT_SECRET,
    sessionTtlDays: e.SESSION_TTL_DAYS,
    claude: e.ANTHROPIC_API_KEY
      ? { apiKey: e.ANTHROPIC_API_KEY, model: e.CLAUDE_MODEL, effort: e.CLAUDE_EFFORT, fallbacks: e.CLAUDE_FALLBACKS }
      : null,
    gemini: e.GEMINI_API_KEY
      ? { apiKey: e.GEMINI_API_KEY, model: e.GEMINI_MODEL, embeddingModel: e.GEMINI_EMBEDDING_MODEL }
      : null,
    google: { clientIds: e.GOOGLE_CLIENT_IDS },
    apple: { bundleIds: e.APPLE_BUNDLE_IDS, revocation: appleRevocation },
    revenueCat: {
      webhookAuth: e.REVENUECAT_WEBHOOK_AUTH ?? null,
      secretKey: e.REVENUECAT_SECRET_KEY ?? null,
    },
    allowDevLogin: e.ALLOW_DEV_LOGIN ? e.ALLOW_DEV_LOGIN === 'true' : e.NODE_ENV === 'development',
    corsOrigins: e.CORS_ORIGINS,
    pricingConfigPath: e.PRICING_CONFIG_PATH ?? null,
    importConcurrency: e.IMPORT_CONCURRENCY,
    usingDevJwtSecret: !e.JWT_SECRET,
  };
}
