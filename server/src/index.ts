import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { openDatabase } from './db/client.js';
import { createDeps } from './deps.js';
import { createLogger } from './logger.js';

const config = loadConfig();
const logger = createLogger(config);

if (config.usingDevJwtSecret) logger.warn('JWT_SECRET not set — using an insecure development secret');
if (!config.claude) logger.warn('ANTHROPIC_API_KEY not set — AI recipe features are disabled');
if (!config.gemini) logger.warn('GEMINI_API_KEY not set — YouTube breakdowns and recipe memory are disabled');
if (config.database.kind === 'pglite') logger.info({ dir: config.database.dir }, 'using embedded Postgres (PGlite) for development');

const database = await openDatabase(config.database);
const deps = createDeps(config, database.db, logger);
await deps.imports.recoverInterrupted();

const server = createApp(deps).listen(config.port, config.host, () => {
  logger.info({ port: config.port, model: config.claude?.model, videoModel: config.gemini?.model }, 'CookReel API ready');
});

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'shutting down');
  server.close();
  // Let in-flight imports finish (bounded), then close the database.
  await Promise.race([deps.imports.idle(), new Promise((resolve) => setTimeout(resolve, 20_000))]);
  await database.close();
  process.exit(0);
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
