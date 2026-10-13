import { createHash } from 'node:crypto';
import { and, eq, inArray, lt, sql } from 'drizzle-orm';
import type { Logger } from 'pino';
import type { Db } from '../db/client.js';
import { speechClips, speechUsage } from '../db/schema.js';
import { LANGUAGE_INFO, type AppLanguage } from '../domain/languages.js';
import { AIError, HttpError } from '../lib/errors.js';
import { decodeSpeechAudio, encodeMp3, mp3DurationMs, pcmDurationMs, polishSpeech } from './audio.js';

/** A text-to-speech provider. Returns encoded audio and its MIME type exactly as the provider sent it. */
export interface SpeechSynthesizer {
  readonly model: string;
  synthesize(input: { text: string; language: AppLanguage; voice: string; style: string | null }): Promise<{ data: Buffer; mimeType: string }>;
}

export type SpeechPace = 'relaxed' | 'normal' | 'brisk';

export interface SpeechSettings {
  /** App voice id → provider voice name, e.g. { warm: 'Sulafat' }. The first entry is the default. */
  voices: Record<string, string>;
  userDailySeconds: number;
  globalDailySeconds: number;
  /** Bump to invalidate every cached clip (e.g. after changing the style direction). */
  cacheVersion: string;
  /** Send a delivery direction alongside the text (style metadata, never read aloud). */
  style: boolean;
}

export interface SpeechResult {
  audio: Buffer;
  cached: boolean;
  durationMs: number;
}

export interface SpeechService {
  readonly version: string;
  readonly voiceIds: string[];
  readonly defaultVoice: string;
  speak(userId: string, input: { text: string; language: AppLanguage; voice: string; pace: SpeechPace }): Promise<SpeechResult>;
  /** Deletes clips nobody has played for 90 days and usage rows older than 30 days. */
  prune(now?: Date): Promise<{ clips: number }>;
}

const INVISIBLES = /[\u200b-\u200f\u2066-\u2069\ufeff]/g;
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{20E3}]/gu;

/** Same text, same clip: normalize before hashing so trivial differences still hit the cache. */
export function normalizeSpeechText(text: string): string {
  return text.normalize('NFC').replace(INVISIBLES, '').replace(EMOJI, '').replace(/\s+/g, ' ').trim();
}

const PACE: Record<SpeechPace, string> = {
  relaxed: 'at an unhurried, relaxed pace',
  normal: 'at a natural conversational pace',
  brisk: 'at a lively, slightly quicker pace',
};

const ACCENT: Partial<Record<AppLanguage, string>> = {
  pt: 'with a natural Brazilian Portuguese accent',
  ar: 'in clear, natural Modern Standard Arabic',
};

/** Delivery direction: a warm home cook talking a friend through the recipe — never a robotic announcer. */
export function speechStyle(language: AppLanguage, pace: SpeechPace): string {
  const accent = ACCENT[language] ? ` ${ACCENT[language]}` : '';
  return `Warm, friendly and encouraging, like a home cook talking a friend through a recipe in their own kitchen${accent}, ${PACE[pace]}, with natural pauses between sentences. Relaxed and human, never robotic or salesy.`;
}

/** Rough speaking time, used to reserve fair-use budget before synthesis and to sanity-check the audio. */
export function estimateSpeechMs(text: string, language: AppLanguage): number {
  const charsPerSecond = { latin: 14, arabic: 12, cjk: 7.5 }[LANGUAGE_INFO[language].script];
  return Math.max(800, Math.round((text.length / charsPerSecond) * 1000));
}

function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

class SpeechLimitError extends HttpError {
  constructor(reason: 'user_daily' | 'global_daily') {
    super(429, 'speech_limit', 'You’ve used today’s natural voice. It will be back tomorrow.', { reason });
  }
}

export function createSpeechService(deps: { db: Db; synthesizer: SpeechSynthesizer; settings: SpeechSettings; logger: Logger }): SpeechService {
  const { db, synthesizer, settings, logger } = deps;
  const voiceIds = Object.keys(settings.voices);
  if (!voiceIds.length) throw new Error('At least one TTS voice must be configured');
  const version = `${settings.cacheVersion}:${synthesizer.model}`;
  const inflight = new Map<string, Promise<SpeechResult>>();

  /** Adds `ms` to a scope's daily total unless that would pass `limitMs`; false when the cap is reached. */
  async function reserve(tx: Pick<Db, 'insert'>, scope: string, day: string, ms: number, limitMs: number): Promise<boolean> {
    if (ms > limitMs) return false;
    const rows = await tx
      .insert(speechUsage)
      .values({ scope, day, reservedMs: ms })
      .onConflictDoUpdate({
        target: [speechUsage.scope, speechUsage.day],
        set: { reservedMs: sql`${speechUsage.reservedMs} + excluded.reserved_ms` },
        setWhere: sql`${speechUsage.reservedMs} + excluded.reserved_ms <= ${limitMs}`,
      })
      .returning({ reservedMs: speechUsage.reservedMs });
    return rows.length > 0;
  }

  async function adjust(scopes: string[], day: string, deltaMs: number) {
    if (!deltaMs) return;
    await db
      .update(speechUsage)
      .set({ reservedMs: sql`greatest(0, ${speechUsage.reservedMs} + ${deltaMs})` })
      .where(and(inArray(speechUsage.scope, scopes), eq(speechUsage.day, day)));
  }

  async function synthesizeAndStore(userId: string, key: string, text: string, language: AppLanguage, voiceName: string, style: string | null): Promise<SpeechResult> {
    const day = utcDay(new Date());
    const estimate = estimateSpeechMs(text, language);
    const scopes = [userId, 'global'];
    await db.transaction(async (tx) => {
      if (!(await reserve(tx, userId, day, estimate, settings.userDailySeconds * 1000))) throw new SpeechLimitError('user_daily');
      if (!(await reserve(tx, 'global', day, estimate, settings.globalDailySeconds * 1000))) throw new SpeechLimitError('global_daily');
    });

    let audio: Buffer;
    let durationMs: number;
    try {
      const started = Date.now();
      const raw = await synthesizer.synthesize({ text, language, voice: voiceName, style });
      const decoded = (() => {
        try {
          return decodeSpeechAudio(raw.data, raw.mimeType);
        } catch (error) {
          throw new AIError('invalid_output', 'Speech audio could not be decoded', { cause: error });
        }
      })();
      if (decoded.kind === 'mp3') {
        audio = decoded.bytes;
        durationMs = mp3DurationMs(audio);
      } else {
        const polished = polishSpeech(decoded.audio);
        durationMs = pcmDurationMs(polished);
        audio = encodeMp3(polished);
      }
      // A clip far shorter or longer than the text implies is broken (silence, a cut-off, extra speech):
      // never cache it, so one bad generation can't be served to everyone.
      if (durationMs < Math.max(300, estimate * 0.25) || durationMs > estimate * 4 + 2000) {
        throw new AIError('invalid_output', `Implausible speech duration ${durationMs}ms for ~${estimate}ms of text`);
      }
      logger.info({ label: 'speech', model: synthesizer.model, language, voice: voiceName, chars: text.length, durationMs, ms: Date.now() - started, mimeType: raw.mimeType }, 'speech synthesized');
    } catch (error) {
      await adjust(scopes, day, -estimate).catch((err) => logger.error({ err }, 'speech refund failed'));
      throw error;
    }

    await adjust(scopes, day, durationMs - estimate).catch((err) => logger.error({ err }, 'speech usage settle failed'));
    await db
      .insert(speechClips)
      .values({ key, language, voice: voiceName, model: synthesizer.model, audio, chars: text.length, durationMs })
      .onConflictDoNothing();
    return { audio, cached: false, durationMs };
  }

  return {
    version,
    voiceIds,
    defaultVoice: voiceIds[0]!,

    async speak(userId, input) {
      const text = normalizeSpeechText(input.text);
      if (!text) throw new HttpError(400, 'invalid_request', 'There is nothing to say.');
      const voiceName = settings.voices[input.voice] ?? settings.voices[voiceIds[0]!]!;
      const style = settings.style ? speechStyle(input.language, input.pace) : null;
      const key = createHash('sha256')
        .update([settings.cacheVersion, synthesizer.model, voiceName, input.language, style ?? '', text].join('\u0000'))
        .digest('hex');

      const [hit] = await db.select().from(speechClips).where(eq(speechClips.key, key)).limit(1);
      if (hit) {
        if (Date.now() - hit.lastUsedAt.getTime() > 24 * 60 * 60 * 1000) {
          void db.update(speechClips).set({ lastUsedAt: new Date() }).where(eq(speechClips.key, key)).catch(() => undefined);
        }
        return { audio: hit.audio, cached: true, durationMs: hit.durationMs };
      }

      const pending = inflight.get(key);
      if (pending) return pending;
      const job = synthesizeAndStore(userId, key, text, input.language, voiceName, style).finally(() => inflight.delete(key));
      inflight.set(key, job);
      return job;
    },

    async prune(now = new Date()) {
      const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const removed = await db.delete(speechClips).where(lt(speechClips.lastUsedAt, cutoff)).returning({ key: speechClips.key });
      const oldDay = utcDay(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      await db.delete(speechUsage).where(lt(speechUsage.day, oldDay));
      return { clips: removed.length };
    },
  };
}
