import { Platform } from 'react-native';
import type { ApiRecipe, CookProfile } from '@/data/types';
import { getLanguage, t } from '@/i18n';

const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8787' : 'http://localhost:8787';
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_URL).replace(/\/$/, '');

export type ErrorCode =
  | 'invalid_request'
  | 'unauthorized'
  | 'not_found'
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
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'internal';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface Balance {
  total: number;
  plan: number;
  bonus: number;
  planId: string | null;
  planName: string | null;
  planExpiresAt: string | null;
  nextRefillAt: string | null;
  monthlyAllowance: number | null;
}

export interface ApiUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  sharingOptIn: boolean;
  providers: ('google' | 'apple' | 'dev')[];
  createdAt: string;
}

export interface SessionResponse {
  token: string;
  expiresAt: string;
  user: ApiUser;
  balance: Balance;
  isNew: boolean;
  starterCreditsGranted: number;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyCredits: number;
  productIds: string[];
  displayPrice: { monthly: string; yearly: string };
  highlight: boolean;
  perks: string[];
}

export interface Pricing {
  starterCredits: number;
  costs: { recipe: number; experiment: number; youtube: number; youtubeShort: number };
  plans: Plan[];
  topups: { productId: string; credits: number; displayPrice: string }[];
  entitlementId: string;
}

export interface Health {
  ok: boolean;
  features: { ai: boolean; youtube: boolean; devLogin: boolean; google: boolean; apple: boolean; billing: boolean; naturalVoice?: boolean };
  /** Natural narration settings; null when the server has it switched off (older servers omit it). */
  naturalVoice?: { version: string; voices: string[]; defaultVoice: string } | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type BuilderResponse =
  | { kind: 'question'; message: string; suggestions: string[]; creditsCharged: 0 }
  | { kind: 'recipe'; message: string; recipe: ApiRecipe; creditsCharged: number; balance: Balance; references: string[] };

export interface ExperimentResponse {
  message: string;
  changes: string[];
  recipe: ApiRecipe;
  creditsCharged: number;
  balance: Balance;
}

export type ImportStatus = 'queued' | 'watching' | 'writing' | 'done' | 'failed';

export interface ImportJob {
  id?: string;
  status: ImportStatus;
  videoId?: string;
  isShort?: boolean;
  /** The language the recipe is being written in. */
  language?: string;
  creditsCharged: number;
  error?: string | null;
  /** Stable code for a failed job (e.g. not_a_recipe_video, import_interrupted); the app shows its own text. */
  errorCode?: string | null;
  recipe: ApiRecipe | null;
  cached: boolean;
  balance?: Balance;
}

export interface ExperimentRecipeInput {
  title: string;
  description?: string;
  cuisine?: string | null;
  servings: number;
  prepMinutes?: number;
  cookMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  equipment?: string[];
  tags?: string[];
  ingredients: { name: string; quantity: number | null; unit: string; note: string | null }[];
  steps: { title: string; instruction: string }[];
  nutrition?: { perServing: { kcal: number; proteinG: number; carbsG: number; fatG: number; fiberG: number } };
}

type TokenSource = () => string | null;
type UnauthorizedHandler = () => void;

let getToken: TokenSource = () => null;
let onUnauthorized: UnauthorizedHandler = () => undefined;

/** Wired up by the session store so the client never imports app state directly. */
export function configureApi(options: { token: TokenSource; onUnauthorized: UnauthorizedHandler }) {
  getToken = options.token;
  onUnauthorized = options.onUnauthorized;
}

/** Authorization header for the signed-in cook, if any. */
export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

/** An ApiError for an error response; a 401 on a signed-in request also reports the expired session. */
export function apiErrorFrom(status: number, payload: unknown, authed: boolean): ApiError {
  const error = (payload as { error?: { code: ErrorCode; message: string; details?: Record<string, unknown> } } | null)?.error;
  if (status === 401 && authed && getToken()) onUnauthorized();
  return new ApiError(status, error?.code ?? 'internal', error?.message ?? t('common.errors.generic'), error?.details);
}

async function request<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown; auth?: boolean; timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 30_000);
  options.signal?.addEventListener('abort', () => controller.abort());
  const headers: Record<string, string> = { accept: 'application/json' };
  if (options.body !== undefined) headers['content-type'] = 'application/json';
  if (options.auth !== false) Object.assign(headers, authHeader());

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
  } catch {
    if (options.signal?.aborted) throw new ApiError(0, 'cancelled', t('common.errors.cancelled'));
    if (controller.signal.aborted) {
      throw new ApiError(0, 'timeout', t('common.errors.timeout'));
    }
    throw new ApiError(0, 'network', t('common.errors.network'));
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 204) return undefined as T;
  const payload: unknown = await res.json().catch(() => null);
  if (!res.ok) throw apiErrorFrom(res.status, payload, options.auth !== false);
  return payload as T;
}

const AI_TIMEOUT = 180_000;

export const api = {
  health: () => request<Health>('/health', { auth: false, timeoutMs: 8000 }),
  pricing: () => request<Pricing>('/api/pricing', { auth: false }),

  signInWithGoogle: (idToken: string) => request<SessionResponse>('/api/auth/google', { method: 'POST', body: { idToken }, auth: false }),
  signInWithApple: (body: { identityToken: string; authorizationCode: string | null; fullName: string | null }) =>
    request<SessionResponse>('/api/auth/apple', { method: 'POST', body, auth: false }),
  signInDev: (name: string) => request<SessionResponse>('/api/auth/dev', { method: 'POST', body: { name }, auth: false }),
  refresh: () => request<SessionResponse>('/api/auth/refresh', { method: 'POST', body: {} }),

  me: () => request<{ user: ApiUser; balance: Balance }>('/api/me'),
  updateMe: (patch: { name?: string; sharingOptIn?: boolean }) =>
    request<{ user: ApiUser; balance: Balance }>('/api/me', { method: 'PATCH', body: patch }),
  deleteAccount: () => request<void>('/api/me', { method: 'DELETE' }),

  builder: (
    body: { messages: ChatMessage[]; mode: 'describe' | 'fridge'; pantry?: string[]; profile?: CookProfile },
    signal?: AbortSignal,
  ) => request<BuilderResponse>('/api/ai/builder', { method: 'POST', body: { ...body, language: getLanguage() }, timeoutMs: AI_TIMEOUT, signal }),
  experiment: (body: { recipe: ExperimentRecipeInput; instruction: string; profile?: CookProfile }, signal?: AbortSignal) =>
    request<ExperimentResponse>('/api/ai/experiment', { method: 'POST', body: { ...body, language: getLanguage() }, timeoutMs: AI_TIMEOUT, signal }),
  /** Chef writes the recipe in the app language; a video someone already analysed is translated for free. */
  startImport: (body: { url: string; profile?: CookProfile }) =>
    request<ImportJob>('/api/ai/youtube', { method: 'POST', body: { ...body, language: getLanguage() }, timeoutMs: 45_000 }),
  importStatus: (jobId: string) => request<ImportJob>(`/api/ai/youtube/${jobId}`),

  syncBilling: () => request<{ balance: Balance }>('/api/billing/sync', { method: 'POST', body: {} }),
};
