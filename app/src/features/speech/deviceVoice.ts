import { Platform } from 'react-native';
import { getLocales } from 'expo-localization';
import * as Speech from 'expo-speech';
import { speechLocaleFor, type AppLanguage } from '@/i18n/languages';

/*
 * The phone's own voice, used for guests, offline and as a fallback. Picks the most natural voice
 * installed for the language: Apple's Premium and Enhanced voices first, never the novelty voices
 * (Bells, Zarvox…) or the older Eloquence ones, and on Android a voice that works offline.
 */
const ROBOTIC = /com\.apple\.(?:speech\.synthesis\.voice|eloquence)\./i;

let voices: Promise<Speech.Voice[]> | null = null;
const chosen = new Map<string, Speech.Voice | null>();

const tagOf = (voice: Speech.Voice) => voice.language.replace('_', '-').toLowerCase();

function score(voice: Speech.Voice, locale: string): number {
  const id = voice.identifier.toLowerCase();
  let points = 0;
  if (id.includes('.premium.')) points += 40;
  else if (id.includes('.enhanced.') || voice.quality === Speech.VoiceQuality.Enhanced) points += 30;
  if (tagOf(voice) === locale.toLowerCase()) points += 10;
  if (Platform.OS === 'android') {
    if (id.endsWith('-local')) points += 5;
    if (id.endsWith('-network')) points -= 5;
  }
  return points;
}

export async function bestDeviceVoice(language: AppLanguage): Promise<{ language: string; voice?: string }> {
  const locale = speechLocaleFor(language, getLocales()[0]?.regionCode);
  if (!chosen.has(locale)) {
    voices ??= Speech.getAvailableVoicesAsync().catch(() => []);
    const all = await voices;
    if (!all.length) {
      voices = null; // web loads voices lazily; ask again next time
      return { language: locale };
    }
    const candidates = all.filter((voice) => voice.language && tagOf(voice).split('-')[0] === language && !ROBOTIC.test(voice.identifier));
    candidates.sort((a, b) => score(b, locale) - score(a, locale));
    chosen.set(locale, candidates[0] ?? null);
  }
  const voice = chosen.get(locale);
  return voice ? { language: voice.language, voice: voice.identifier } : { language: locale };
}
