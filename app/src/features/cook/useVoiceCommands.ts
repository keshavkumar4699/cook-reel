import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { getLocales } from 'expo-localization';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionOptions,
} from 'expo-speech-recognition';
import { getLanguage, LANGUAGE_INFO } from '@/i18n';
import { speechLocaleFor } from '@/i18n/languages';
import { commandFromTranscript, contextualStrings, isLongUtterance, type VoiceCommand } from '@/lib/voice';

export type VoiceState = 'off' | 'starting' | 'listening' | 'paused' | 'denied' | 'unavailable';

/** How long the "heard you" bubble stays up after a command. */
const HEARD_MS = 1600;

/**
 * The recogniser listens in the app language, in the cook's regional variant when their region
 * speaks it (es-MX, fr-CA, en-IN…); `fallback` is the language's default variant (es-ES, fr-FR…).
 */
function recognitionLocale(fallback: boolean): string {
  const language = getLanguage();
  return fallback ? LANGUAGE_INFO[language].defaultSpeechLocale : speechLocaleFor(language, getLocales()[0]?.regionCode);
}

function recognitionAvailable(): boolean {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}

function clearTimer(timer: { current: ReturnType<typeof setTimeout> | null }) {
  if (timer.current) clearTimeout(timer.current);
  timer.current = null;
}

function abortRecognizer() {
  try {
    ExpoSpeechRecognitionModule.abort();
  } catch {
    // not running
  }
}

const options = (fallback: boolean): ExpoSpeechRecognitionOptions => ({
  lang: recognitionLocale(fallback),
  interimResults: true,
  continuous: true,
  maxAlternatives: 1,
  contextualStrings: contextualStrings(),
  addsPunctuation: false,
  // Keep the video's sound playing while we listen.
  iosCategory: { category: 'playAndRecord', categoryOptions: ['defaultToSpeaker', 'allowBluetooth', 'mixWithOthers'], mode: 'default' },
});

/**
 * Hands-free control for cooking mode. Listens continuously, matches short commands
 * (see lib/voice.ts), restarts itself after each command so transcripts stay short, and pauses
 * while the app is speaking so narration can't trigger commands.
 */
export function useVoiceCommands({ enabled, paused, onCommand }: { enabled: boolean; paused: boolean; onCommand: (command: VoiceCommand) => void }) {
  const [available] = useState(recognitionAvailable);
  // What the recogniser last reported; the state we expose is derived from it below.
  const [reported, setReported] = useState<VoiceState>('off');
  const [heard, setHeard] = useState<{ text: string; at: number } | null>(null);
  const wanted = useRef(false);
  const pausedRef = useRef(paused);
  const handler = useRef(onCommand);
  const last = useRef<{ command: VoiceCommand; at: number } | null>(null);
  const restartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set when the regional variant isn't installed and the language's default one is used instead.
  const fallbackLocale = useRef(false);

  useLayoutEffect(() => {
    handler.current = onCommand;
  });

  const startRecognizer = useCallback(() => {
    if (!wanted.current || pausedRef.current) return;
    try {
      ExpoSpeechRecognitionModule.start(options(fallbackLocale.current));
    } catch {
      setReported('unavailable');
    }
  }, []);

  const scheduleRestart = useCallback(
    (delay = 250) => {
      clearTimer(restartTimer);
      restartTimer.current = setTimeout(startRecognizer, delay);
    },
    [startRecognizer],
  );

  useSpeechRecognitionEvent('start', () => setReported('listening'));
  useSpeechRecognitionEvent('end', () => {
    // Recognisers stop on silence timeouts (and older Android ignores `continuous`): keep going.
    if (wanted.current && !pausedRef.current) scheduleRestart(Platform.OS === 'android' ? 400 : 250);
    else setReported((s) => (s === 'listening' || s === 'starting' ? (wanted.current ? 'paused' : 'off') : s));
  });
  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'not-allowed') {
      wanted.current = false;
      setReported('denied');
    } else if (event.error === 'language-not-supported' && !fallbackLocale.current && recognitionLocale(true) !== recognitionLocale(false)) {
      // e.g. es-AR missing on this phone: the `end` handler restarts with es-ES.
      fallbackLocale.current = true;
    } else if (event.error === 'service-not-allowed' || event.error === 'language-not-supported') {
      wanted.current = false;
      setReported('unavailable');
    }
    // no-speech / aborted / network: the `end` handler restarts.
  });
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript ?? '';
    if (!transcript) return;
    const command = commandFromTranscript(transcript);
    if (!command) {
      // Long stretches of non-command speech (often the video itself): reset to keep windows short.
      if (isLongUtterance(transcript)) abortRecognizer();
      return;
    }
    const now = Date.now();
    if (last.current && last.current.command === command && now - last.current.at < 1500) return;
    last.current = { command, at: now };
    setHeard({ text: transcript, at: now });
    clearTimer(heardTimer);
    heardTimer.current = setTimeout(() => setHeard(null), HEARD_MS);
    handler.current(command);
    // Start a fresh utterance so the next command isn't read together with this one.
    abortRecognizer();
  });

  // Narration pauses the recogniser; its `end` event then reports "paused".
  useEffect(() => {
    pausedRef.current = paused;
    if (!wanted.current) return;
    if (paused) {
      clearTimer(restartTimer);
      abortRecognizer();
    } else {
      scheduleRestart(350);
    }
  }, [paused, scheduleRestart]);

  useEffect(() => {
    if (!enabled || !available) return;
    let active = true;
    ExpoSpeechRecognitionModule.requestPermissionsAsync().then(
      (permission) => {
        if (!active) return;
        if (!permission.granted) {
          setReported('denied');
          return;
        }
        wanted.current = true;
        setReported('starting');
        startRecognizer();
      },
      () => {
        if (active) setReported('unavailable');
      },
    );
    return () => {
      active = false;
      wanted.current = false;
      clearTimer(restartTimer);
      abortRecognizer();
    };
  }, [enabled, available, startRecognizer]);

  useEffect(() => () => clearTimer(heardTimer), []);

  let state: VoiceState = reported;
  if (!available) state = 'unavailable';
  else if (!enabled) state = 'off';
  else if (paused && (reported === 'listening' || reported === 'starting')) state = 'paused';

  return { state, heard };
}
