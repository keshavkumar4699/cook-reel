export type VoiceCommand =
  | 'next'
  | 'previous'
  | 'pause'
  | 'play'
  | 'repeat'
  | 'read'
  | 'ingredients'
  | 'timer'
  | 'stopTimer'
  | 'exit'
  | 'help';

/** "Hey chef, next" — a wake word lets longer phrases through. */
const WAKE = /^(?:(?:hey|ok|okay|hi)\s+)?(?:chef|cookreel|cook reel)\b[\s,!.]*/;

/**
 * Ordered most-specific first ("stop the timer" must not become "stop"). Hindi/Hinglish words that
 * speech recognisers commonly transcribe in Latin script are included for Indian cooks.
 */
const RULES: [VoiceCommand, RegExp][] = [
  ['stopTimer', /\b(stop|cancel|end|reset)\s+(the\s+)?timer\b/],
  ['timer', /\b((start|set)\s+(a\s+|the\s+)?timer|timer)\b/],
  ['ingredients', /\b(ingredients?|what do i need|saamaan|samaan)\b/],
  ['help', /\b(help|commands|what can i say)\b/],
  ['exit', /\b(exit|close|quit|i'?m done|finish(ed)?|band karo)\b/],
  ['repeat', /\b(repeat|again|replay|one more time|phir se|fir se|dobara)\b/],
  ['previous', /\b(previous|prev|back|go back|last step|before|peeche|pichhe|pichla|piche)\b/],
  ['next', /\b(next|skip|forward|go on|move on|aage|agla|agle)\b/],
  ['pause', /\b(stop|pause|hold on|wait|ruko|ruk jao|rukh|ruk)\b/],
  ['play', /\b(play|resume|continue|start|chalao|chalu|shuru)\b/],
  ['read', /\b(read|explain|what do i do|say it|tell me|bolo|batao|samjhao)\b/],
];

/** Longest phrase accepted without the wake word; filters out the video's own audio and chatter. */
const MAX_PLAIN_WORDS = 4;

export function normalizeTranscript(transcript: string): string {
  return transcript
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9\u00c0-\u024f\u0900-\u097f'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseCommand(transcript: string): VoiceCommand | null {
  let text = normalizeTranscript(transcript);
  if (!text) return null;
  const woke = WAKE.test(text);
  if (woke) text = text.replace(WAKE, '').trim();
  if (!text) return null;
  const words = text.split(' ').length;
  if (!woke && words > MAX_PLAIN_WORDS) return null;
  for (const [command, pattern] of RULES) {
    if (pattern.test(text)) return command;
  }
  return null;
}

export const VOICE_HELP: { say: string; does: string }[] = [
  { say: '“Next” · “Back”', does: 'Move between steps' },
  { say: '“Stop” · “Play”', does: 'Pause or resume the clip' },
  { say: '“Repeat”', does: 'Replay this step from the start' },
  { say: '“Read”', does: 'Read the step out loud' },
  { say: '“Start timer”', does: 'Start this step’s timer' },
  { say: '“Ingredients”', does: 'Hear what you need' },
  { say: '“Hey Chef, …”', does: 'Use for longer phrases' },
];

/**
 * Picks a command out of a recogniser transcript. Short utterances ("next") are matched directly;
 * in longer, noisy transcripts (video audio, chatter) only a phrase after the wake word counts —
 * "…and then we add salt chef next" → next.
 */
export function commandFromTranscript(transcript: string): VoiceCommand | null {
  const direct = parseCommand(transcript);
  if (direct) return direct;
  const text = normalizeTranscript(transcript);
  const wake = Math.max(text.lastIndexOf('chef'), text.lastIndexOf('cookreel'));
  return wake >= 0 ? parseCommand(text.slice(wake)) : null;
}

export const wordCount = (transcript: string) => normalizeTranscript(transcript).split(' ').filter(Boolean).length;
