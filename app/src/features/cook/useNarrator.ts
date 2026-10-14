import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from 'expo-audio';
import * as Speech from 'expo-speech';
import { t, type AppLanguage } from '@/i18n';
import { bestDeviceVoice } from '@/features/speech/deviceVoice';
import {
  cancelPrefetch,
  discardClip,
  loadClip,
  naturalVoiceBlocked,
  naturalVoiceInfo,
  noteSpeechFailure,
  prefetchClips,
  type SpeechRequest,
} from '@/features/speech/naturalVoice';
import { paceFromRate } from '@/features/speech/speechApi';
import { speechChunks, toSpeakable } from '@/features/speech/text';
import { ApiError } from '@/lib/api';
import { useSession } from '@/state/session';
import { useSettings } from '@/state/settings';
import { toast } from '@/state/toast';

/** idle → preparing (natural voice is being generated) → speaking → idle. */
export type NarratorState = 'idle' | 'preparing' | 'speaking';

export interface SpeakOptions {
  /** Language of the text; defaults to the narrator's language. */
  language?: AppLanguage;
  /** Natural voice id to use instead of the cook's setting (voice samples). */
  voice?: string;
  /** Give up on the natural voice after this long and use the phone's voice (e.g. timer alerts). */
  maxWaitMs?: number;
  onDone?: () => void;
}

/** How long a step waits for its natural clip before the phone's voice reads it instead. */
const FIRST_CLIP_WAIT_MS = 8000;
const NEXT_CLIP_WAIT_MS = 12_000;
/** Lets the speech recogniser stop before audio starts, so it never hears the narration. */
const MIC_HANDOFF_MS = 150;

class WaitTimeout extends Error {}

function within<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new WaitTimeout()), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let limitToastDay = '';

/**
 * Reads text aloud. Signed-in cooks hear the natural voice from the server (cached on the phone);
 * guests, offline cooks and failures get the most natural voice installed on the phone. `state`
 * is 'preparing' while a clip is generated, so the screen can show it's on its way.
 */
export function useNarrator({ rate, language, listening = false }: { rate: number; language: AppLanguage; listening?: boolean }) {
  const [state, setState] = useState<NarratorState>('idle');
  const signedIn = useSession((s) => s.status === 'signedIn');
  const naturalOn = useSettings((s) => s.naturalVoice);
  const voiceId = useSettings((s) => s.voice);
  const prefs = useRef({ rate, language, natural: signedIn && naturalOn, voice: voiceId });
  useLayoutEffect(() => {
    prefs.current = { rate, language, natural: signedIn && naturalOn, voice: voiceId };
  });

  const token = useRef(0);
  const player = useRef<AudioPlayer | null>(null);
  const finish = useRef<((outcome: 'done' | 'error') => void) | null>(null);
  const playStartedAt = useRef(0);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // One player for the screen. Keeping the audio session active between clips stops iOS from
    // cutting the microphone and the video every time a clip ends.
    const audio = createAudioPlayer(null, { keepAudioSessionActive: true, updateInterval: 250 });
    player.current = audio;
    const subscription = audio.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      const pending = finish.current;
      if (!pending) return;
      if (status.error) return pending('error');
      // Ignore a finish reported for the previous clip right after switching.
      if (status.didJustFinish && Date.now() - playStartedAt.current > 250) return pending('done');
      if (status.playing && status.duration > 0) {
        // Safety net: never stay "speaking" if the finish event goes missing.
        if (watchdog.current) clearTimeout(watchdog.current);
        watchdog.current = setTimeout(() => finish.current?.('done'), (status.duration - status.currentTime) * 1000 + 2500);
      }
    });
    return () => {
      subscription.remove();
      finish.current?.('done');
      if (watchdog.current) clearTimeout(watchdog.current);
      audio.remove();
      player.current = null;
    };
  }, []);

  useEffect(() => {
    // Play through the silent switch, alongside the video, and through the speaker even while the
    // microphone listens for voice commands.
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      allowsRecording: listening,
      shouldPlayInBackground: true,
      shouldRouteThroughEarpiece: false,
    }).catch(() => undefined);
  }, [listening]);

  const halt = useCallback(() => {
    const pending = finish.current;
    finish.current = null;
    pending?.('done');
    if (watchdog.current) clearTimeout(watchdog.current);
    try {
      player.current?.pause();
    } catch {
      // player already released
    }
    void Speech.stop();
  }, []);

  const playUri = useCallback(
    (uri: string) =>
      new Promise<'done' | 'error'>((resolve) => {
        const audio = player.current;
        if (!audio) return resolve('error');
        finish.current = (outcome) => {
          finish.current = null;
          if (watchdog.current) clearTimeout(watchdog.current);
          resolve(outcome);
        };
        try {
          playStartedAt.current = Date.now();
          audio.replace({ uri });
          audio.play();
        } catch {
          finish.current = null;
          resolve('error');
        }
      }),
    [],
  );

  const speakOnDevice = useCallback(async (text: string, lang: AppLanguage, mine: number, onDone?: () => void) => {
    const { language: locale, voice } = await bestDeviceVoice(lang);
    if (mine !== token.current) return;
    setState('speaking');
    const done = () => {
      if (mine !== token.current) return;
      setState('idle');
      onDone?.();
    };
    Speech.speak(text, { language: locale, voice, rate: prefs.current.rate, pitch: 1, onDone: done, onStopped: done, onError: done });
  }, []);

  const report = useCallback((error: unknown) => {
    noteSpeechFailure(error);
    if (error instanceof ApiError && error.code === 'speech_limit') {
      const today = new Date().toISOString().slice(0, 10);
      if (limitToastDay !== today) {
        limitToastDay = today;
        toast(t('common.errors.speechLimit'), { durationMs: 5000 });
      }
    }
  }, []);

  const requestsFor = useCallback(
    async (text: string, lang: AppLanguage, voice?: string): Promise<SpeechRequest[] | null> => {
      const info = await naturalVoiceInfo();
      if (!info) return null;
      const wanted = voice ?? prefs.current.voice;
      const chosen = info.voices.includes(wanted) ? wanted : info.defaultVoice;
      const pace = paceFromRate(prefs.current.rate);
      return speechChunks(text).map((chunk) => ({ text: chunk, language: lang, voice: chosen, pace }));
    },
    [],
  );

  const stop = useCallback(() => {
    token.current++;
    halt();
    setState('idle');
  }, [halt]);

  const speak = useCallback(
    (raw: string, options: SpeakOptions = {}) => {
      const mine = ++token.current;
      halt();
      const text = toSpeakable(raw);
      if (!text) {
        setState('idle');
        return;
      }
      const lang = options.language ?? prefs.current.language;
      if (!prefs.current.natural || naturalVoiceBlocked()) {
        void speakOnDevice(text, lang, mine, options.onDone);
        return;
      }
      setState('preparing');
      const startedAt = Date.now();
      void (async () => {
        const requests = await requestsFor(text, lang, options.voice);
        if (mine !== token.current) return;
        if (!requests) return speakOnDevice(text, lang, mine, options.onDone);
        // Ask for every piece at once: later pieces generate while the first one plays.
        const loads = requests.map((request) => loadClip(request));
        for (const load of loads) load.catch(() => undefined);
        for (let i = 0; i < loads.length; i++) {
          const rest = () => requests.slice(i).map((request) => request.text).join(' ');
          let uri: string;
          try {
            uri = await within(loads[i]!, options.maxWaitMs ?? (i === 0 ? FIRST_CLIP_WAIT_MS : NEXT_CLIP_WAIT_MS));
          } catch (error) {
            if (mine !== token.current) return;
            report(error);
            return speakOnDevice(rest(), lang, mine, options.onDone);
          }
          if (mine !== token.current) return;
          if (i === 0) {
            const wait = MIC_HANDOFF_MS - (Date.now() - startedAt);
            if (wait > 0) await sleep(wait);
            if (mine !== token.current) return;
          }
          setState('speaking');
          const outcome = await playUri(uri);
          if (mine !== token.current) return;
          if (outcome === 'error') {
            discardClip(uri);
            return speakOnDevice(rest(), lang, mine, options.onDone);
          }
        }
        setState('idle');
        options.onDone?.();
      })();
    },
    [halt, playUri, report, requestsFor, speakOnDevice],
  );

  /** Generates clips ahead of time (the next steps) so they play without a wait. */
  const prefetch = useCallback(
    (texts: string[], lang?: AppLanguage) => {
      if (!prefs.current.natural || naturalVoiceBlocked()) return;
      const target = lang ?? prefs.current.language;
      void Promise.all(
        texts.map((raw) => {
          const text = toSpeakable(raw);
          return text ? requestsFor(text, target) : Promise.resolve(null);
        }),
      ).then((lists) => prefetchClips(lists.flatMap((list) => list ?? [])));
    },
    [requestsFor],
  );

  useEffect(
    () => () => {
      token.current++;
      halt();
      cancelPrefetch();
    },
    [halt],
  );

  return useMemo(
    () => ({ state, busy: state !== 'idle', preparing: state === 'preparing', speaking: state === 'speaking', speak, prefetch, stop }),
    [state, speak, prefetch, stop],
  );
}
