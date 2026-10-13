import { t, type MessageKey } from '@/i18n';
import { ApiError, type ErrorCode } from './api';

const BY_CODE: Partial<Record<ErrorCode, MessageKey>> = {
  unauthorized: 'common.errors.unauthorized',
  not_found: 'common.errors.notFound',
  insufficient_credits: 'common.errors.insufficientCredits',
  rate_limited: 'common.errors.rateLimited',
  invalid_request: 'common.errors.invalidRequest',
  not_a_recipe_video: 'common.errors.notARecipeVideo',
  video_unavailable: 'common.errors.videoNotFound',
  ai_unavailable: 'common.errors.aiUnavailable',
  ai_refused: 'common.errors.aiRefused',
  ai_failed: 'common.errors.aiFailed',
  billing_unavailable: 'common.errors.billingUnavailable',
  not_configured: 'common.errors.notConfigured',
  speech_limit: 'common.errors.speechLimit',
  network: 'common.errors.network',
  timeout: 'common.errors.timeout',
  cancelled: 'common.errors.cancelled',
  internal: 'common.errors.generic',
};

/** Finer-grained messages for codes the server qualifies with `details.reason`. */
const BY_REASON: Record<string, MessageKey> = {
  invalid_link: 'common.errors.invalidLink',
  not_embeddable: 'common.errors.videoNotEmbeddable',
  video_not_found: 'common.errors.videoNotFound',
  session_expired: 'common.errors.sessionExpired',
  account_gone: 'common.errors.accountGone',
  import_interrupted: 'common.errors.importInterrupted',
  import_failed: 'common.errors.importFailed',
};

/** A message for the cook in the app language. Server text is only used if we don't know the code. */
export function errorMessage(error: unknown, fallback: MessageKey = 'common.errors.generic'): string {
  if (error instanceof ApiError) {
    const reason = typeof error.details?.reason === 'string' ? error.details.reason : null;
    const key = (reason && BY_REASON[reason]) || BY_CODE[error.code];
    return key ? t(key) : t(fallback);
  }
  if (error instanceof LocalizedError) return error.message;
  return t(fallback);
}

/** Message for an import job that failed, from its stored error code. */
export function importErrorMessage(code: string | null | undefined): string {
  if (!code) return t('common.errors.importFailed');
  const key = BY_REASON[code] ?? BY_CODE[code as ErrorCode];
  return t(key ?? 'common.errors.importFailed');
}

/** An error whose message is already translated (e.g. from a native sign-in adapter). */
export class LocalizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocalizedError';
  }
}
