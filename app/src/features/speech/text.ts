/*
 * Text for the voice. Voices read symbols aloud ("bullet", "right arrow") or stumble on emoji and
 * invisible direction marks, so those go; long text is split so the first sentence can start playing
 * while the rest is still being generated. No \p{} classes: Hermes doesn't support them.
 */
const INVISIBLE = /[\u200B-\u200F\u2066-\u2069\uFEFF]/g;
// Emoji and pictographs (surrogate pairs), symbols and dingbats, variation selectors and joiners.
const EMOJI = /(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF]|[\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u20E3\u200D])/g;
// Separators that should sound like a short pause: "·", "•", arrows, a spaced dash.
const PAUSES = /\s*(?:[\u00B7\u2022\u2192\u27F6\u279C|]|\s[\u2014\u2013]\s)\s*/g;

export function toSpeakable(text: string): string {
  let out = text;
  try {
    out = out.normalize('NFC');
  } catch {
    // normalize() missing: the text is still usable
  }
  return out
    .replace(INVISIBLE, '')
    .replace(EMOJI, '')
    .replace(PAUSES, ', ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:\u3001\u3002\u060C])/g, '$1')
    .replace(/,(\s*,)+/g, ',')
    .replace(/^[\s,]+|[\s,]+$/g, '');
}

const TERMINATORS = '.!?\u2026\u3002\uFF01\uFF1F\u061F';
/** Sentence ends that need no space after them. */
const TIGHT_TERMINATORS = '\u3002\uFF01\uFF1F\u061F';
const CLOSERS = /["'\u201D\u2019)\u300D\u300F\uFF09\]]/;

/** Splits text after sentence ends. "1.5", "e.g. cumin" and "..." are not sentence ends. */
export function sentences(text: string): string[] {
  const out: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (!TERMINATORS.includes(ch)) continue;
    const next = text[i + 1];
    if (next !== undefined && TERMINATORS.includes(next)) continue;
    if (ch === '.' && /\d/.test(text[i - 1] ?? '') && /\d/.test(next ?? '')) continue;
    let end = i + 1;
    while (end < text.length && CLOSERS.test(text[end]!)) end++;
    const after = text[end];
    if (after !== undefined && !/\s/.test(after) && !TIGHT_TERMINATORS.includes(ch)) continue;
    // A lower-case word after a full stop continues the sentence ("e.g. cumin").
    const following = text.slice(end).trimStart()[0];
    if (ch === '.' && following && /[a-z]/.test(following)) continue;
    const sentence = text.slice(start, end).trim();
    if (sentence) out.push(sentence);
    start = end;
    i = end - 1;
  }
  const rest = text.slice(start).trim();
  if (rest) out.push(rest);
  return out;
}

function join(a: string, b: string): string {
  return TIGHT_TERMINATORS.includes(a[a.length - 1] ?? '') ? `${a}${b}` : `${a} ${b}`;
}

/** Cuts a sentence that is longer than `max` at the last comma or space before the limit. */
function hardSplit(sentence: string, max: number): string[] {
  const parts: string[] = [];
  let rest = sentence;
  while (rest.length > max) {
    const window = rest.slice(0, max);
    const cut = Math.max(window.lastIndexOf(', '), window.lastIndexOf('\u3001'), window.lastIndexOf('\u060C '), window.lastIndexOf(' '));
    const at = cut > max * 0.4 ? cut + 1 : max;
    parts.push(rest.slice(0, at).trim());
    rest = rest.slice(at).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

/**
 * Pieces to synthesize. Short text stays whole, so it sounds like one breath. Longer text puts the
 * first sentence alone, so the voice starts quickly, and packs the rest into as few pieces as fit.
 */
export function speechChunks(text: string, options: { max?: number; wholeUpTo?: number } = {}): string[] {
  const max = options.max ?? 600;
  const wholeUpTo = options.wholeUpTo ?? 260;
  if (text.length <= wholeUpTo) return [text];
  const pieces = sentences(text).flatMap((s) => hardSplit(s, max));
  const chunks: string[] = [];
  let first = pieces.shift() ?? '';
  // Don't start with a fragment like "Okay." on its own.
  while (first.length < 40 && pieces.length && join(first, pieces[0]!).length <= max) first = join(first, pieces.shift()!);
  if (first) chunks.push(first);
  let current = '';
  for (const piece of pieces) {
    if (!current) current = piece;
    else if (join(current, piece).length <= max) current = join(current, piece);
    else {
      chunks.push(current);
      current = piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

