import { normalizeDigits } from '@/i18n/format';
import { canonicalUnitCode, UNIT_ALIASES_LONGEST_FIRST } from './units';

const UNICODE_FRACTIONS: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };

export interface ParsedIngredient {
  quantity: number | null;
  unit: string;
  name: string;
  note: string | null;
}

function parseAmount(raw: string): number | null {
  const text = raw.trim();
  if (!text) return null;
  // "1 1/2", "1½"
  const mixed = /^(\d+)\s*(?:(\d+)\/(\d+)|([½¼¾⅓⅔⅛]))$/.exec(text);
  if (mixed) {
    const whole = Number(mixed[1]);
    const frac = mixed[2] ? Number(mixed[2]) / Number(mixed[3]) : UNICODE_FRACTIONS[mixed[4]!]!;
    return whole + frac;
  }
  const fraction = /^(\d+)\/(\d+)$/.exec(text);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  if (UNICODE_FRACTIONS[text] !== undefined) return UNICODE_FRACTIONS[text]!;
  const range = /^(\d+(?:[.,]\d+)?)\s*[-–〜~]\s*(\d+(?:[.,]\d+)?)$/.exec(text);
  if (range) return Number(range[2]!.replace(',', '.'));
  const n = Number(text.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

const AMOUNT = String.raw`(?:\d+\s+\d+\/\d+)|(?:\d+\s*[½¼¾⅓⅔⅛])|(?:\d+\/\d+)|(?:\d+(?:[.,]\d+)?\s*[-–〜~]\s*\d+(?:[.,]\d+)?)|(?:\d+(?:[.,]\d+)?)|[½¼¾⅓⅔⅛]`;
const LEADING_AMOUNT = new RegExp(String.raw`^(${AMOUNT})\s*`);

/** Words that join a unit to the ingredient: "2 cups of rice", "2 tazas de arroz", "2 كوب من الأرز". */
const CONNECTOR = /^(?:(?:of|de la|de|del|di|della|dello|degli|da|do|du|des|von|vom|من)\s+|d['’])/i;

/** Japanese lists put the amount after the name: "しょうゆ 大さじ2", "鶏もも肉 300g", "卵 2個". */
const TRAILING_AMOUNT = new RegExp(String.raw`^(.+?)[\s\u3000]+(大さじ|小さじ)?\s*(${AMOUNT})\s*([^\s\d]{0,4})$`);

function unitAtStart(rest: string): { code: string; length: number } | null {
  const folded = rest.toLowerCase();
  for (const [alias, code] of UNIT_ALIASES_LONGEST_FIRST) {
    if (!folded.startsWith(alias)) continue;
    const next = folded.charAt(alias.length);
    // Whole words only — Japanese has no spaces, so its units may run straight into the name.
    if (next === '' || next === ' ' || next === '.' || /[぀-ヿ㐀-鿿]/.test(alias)) {
      return { code, length: alias.length + (next === '.' ? 1 : 0) };
    }
  }
  return null;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function splitNote(rest: string): { name: string; note: string | null } {
  const [name, ...noteParts] = rest.split(/[,\uFF0C\u3001\u060C]/);
  const note = noteParts.join(',').trim();
  return { name: capitalise((name ?? '').trim()), note: note || null };
}

/**
 * Parses one line of a pasted ingredient list in any of our languages: "2 cups basmati rice",
 * "½ tsp salt", "200g paneer, cubed", "2 cucharadas de aceite", "しょうゆ 大さじ2". Unrecognised
 * lines become a name-only ingredient.
 */
export function parseIngredientLine(line: string): ParsedIngredient | null {
  const text = normalizeDigits(line)
    .replace(/^\s*(?:[-\u2022*\u00B7\u30FB]|\d+[.)])\s+/, '')
    .trim();
  if (!text) return null;

  const amountMatch = LEADING_AMOUNT.exec(text);
  if (!amountMatch) {
    const trailing = TRAILING_AMOUNT.exec(text);
    if (trailing) {
      const quantity = parseAmount(trailing[3]!);
      const unitWord = trailing[2] ?? trailing[4] ?? '';
      const code = canonicalUnitCode(unitWord);
      if (quantity !== null && (code !== null || !unitWord)) {
        return { quantity, unit: code === 'count' || code === null ? '' : code, name: trailing[1]!.trim(), note: null };
      }
    }
    return { quantity: null, unit: '', ...splitNote(text) };
  }

  const quantity = parseAmount(amountMatch[1]!);
  let rest = text.slice(amountMatch[0].length);
  let unit = '';
  if (quantity !== null) {
    const found = unitAtStart(rest);
    if (found) {
      unit = found.code;
      rest = rest.slice(found.length).trim().replace(CONNECTOR, '');
    }
  }
  const { name, note } = splitNote(rest);
  if (!name) return null;
  return { quantity, unit, name, note };
}

export function parseIngredientList(text: string): ParsedIngredient[] {
  return text
    .split(/\r?\n/)
    .map(parseIngredientLine)
    .filter((item): item is ParsedIngredient => item !== null);
}

