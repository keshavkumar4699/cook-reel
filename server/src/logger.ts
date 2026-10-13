import { pino, type Logger } from 'pino';
import type { Config } from './config.js';

export function createLogger(config: Pick<Config, 'logLevel' | 'isProduction'>): Logger {
  return pino({
    level: config.logLevel,
    redact: ['*.authorization', '*.idToken', '*.identityToken', '*.token'],
    ...(config.isProduction ? {} : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } } }),
  });
}
