export type ErrorCode =
  | 'invalid_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'insufficient_credits'
  | 'rate_limited'
  | 'not_a_recipe_video'
  | 'video_unavailable'
  | 'ai_unavailable'
  | 'ai_refused'
  | 'ai_failed'
  | 'billing_unavailable'
  | 'not_configured'
  | 'speech_limit'
  | 'internal';

/** An error that is safe to show to API clients. Anything else is reported as a generic 500. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class InsufficientCreditsError extends HttpError {
  constructor(required: number, balance: number) {
    super(402, 'insufficient_credits', "You're out of credits for this. Top up or upgrade your plan to keep cooking with AI.", {
      required,
      balance,
    });
  }
}

/** Raised by AI adapters; mapped to user-friendly HTTP errors at the edge. */
export class AIError extends Error {
  constructor(
    readonly kind: 'refused' | 'truncated' | 'invalid_output' | 'unavailable' | 'upstream',
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'AIError';
  }
}

export function toHttpError(error: unknown): HttpError | null {
  if (error instanceof HttpError) return error;
  if (error instanceof AIError) {
    switch (error.kind) {
      case 'refused':
        return new HttpError(422, 'ai_refused', "Chef can't help with that request. Try describing a different dish.");
      case 'unavailable':
        return new HttpError(503, 'ai_unavailable', 'AI features are temporarily unavailable. Please try again soon.');
      default:
        return new HttpError(502, 'ai_failed', 'The AI chef hit a snag. No credits were used — please try again.');
    }
  }
  return null;
}
