import { fetch } from 'expo/fetch';
import { t, type AppLanguage } from '@/i18n';
import { API_URL, ApiError, apiErrorFrom, authHeader } from '@/lib/api';

export type SpeechPace = 'relaxed' | 'normal' | 'brisk';

/** Maps the narration speed setting (0.85 / 1 / 1.15) to how the voice is asked to speak. */
export function paceFromRate(rate: number): SpeechPace {
  return rate < 0.95 ? 'relaxed' : rate > 1.05 ? 'brisk' : 'normal';
}

export interface SpeechRequest {
  text: string;
  language: AppLanguage;
  voice: string;
  pace: SpeechPace;
}

/** POST /api/speech: natural narration as MP3 bytes. Signed-in cooks only. */
export async function requestSpeech(body: SpeechRequest, timeoutMs = 30_000): Promise<Uint8Array<ArrayBuffer>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let res: Awaited<ReturnType<typeof fetch>>;
    try {
      res = await fetch(`${API_URL}/api/speech`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'audio/mpeg', ...authHeader() },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      throw controller.signal.aborted ? new ApiError(0, 'timeout', t('common.errors.timeout')) : new ApiError(0, 'network', t('common.errors.network'));
    }
    if (!res.ok) throw apiErrorFrom(res.status, await res.json().catch(() => null), true);
    const bytes = await res.bytes();
    if (!bytes.length) throw new ApiError(502, 'ai_failed', t('common.errors.aiFailed'));
    return bytes;
  } finally {
    clearTimeout(timer);
  }
}
