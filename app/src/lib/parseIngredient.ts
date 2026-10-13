const UNICODE_FRACTIONS: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };

const UNIT_MAP: Record<string, string> = {
  cup: 'cup',
  cups: 'cup',
  tbsp: 'tbsp',
  tbs: 'tbsp',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
  tsp: 'tsp',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  g: 'g',
  gm: 'g',
  gms: 'g',
  gram: 'g',
  grams: 'g',
  kg: 'kg',
  ml: 'ml',
  l: 'l',
  litre: 'l',
  litres: 'l',
  liter: 'l',
  liters: 'l',
  oz: 'oz',
  lb: 'lb',
  lbs: 'lb',
  pinch: 'pinch',
  clove: 'clove',
  cloves: 'cloves',
  piece: 'piece',
  pieces: 'pieces',
  slice: 'slice',
  slices: 'slices',
  can: 'can',
  cans: 'cans',
  bunch: 'bunch',
  handful: 'handful',
  sprig: 'sprig',
  sprigs: 'sprigs',
};

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
  const range = /^(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)$/.exec(text);
  if (range) return Number(range[2]!.replace(',', '.'));
  const n = Number(text.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/**
 * Parses one line of a pasted ingredient list: "2 cups basmati rice", "½ tsp salt",
 * "200g paneer, cubed", "- 3 eggs". Unrecognised lines become a name-only ingredient.
 */
export function parseIngredientLine(line: string): ParsedIngredient | null {
  const text = line.replace(/^\s*(?:[-•*·]|\d+[.)])\s+/, '').trim();
  if (!text) return null;

  const amountPattern = /^((?:\d+\s+\d+\/\d+)|(?:\d+\s*[½¼¾⅓⅔⅛])|(?:\d+\/\d+)|(?:\d+(?:[.,]\d+)?\s*[-–]\s*\d+(?:[.,]\d+)?)|(?:\d+(?:[.,]\d+)?)|[½¼¾⅓⅔⅛])\s*/;
  const amountMatch = amountPattern.exec(text);
  let rest = text;
  let quantity: number | null = null;
  if (amountMatch) {
    quantity = parseAmount(amountMatch[1]!);
    rest = text.slice(amountMatch[0].length);
  }

  let unit = '';
  const unitMatch = /^([a-zA-Z]+)\.?(?=\s|$)\s*(?:of\s+)?/.exec(rest);
  if (quantity !== null && unitMatch && UNIT_MAP[unitMatch[1]!.toLowerCase()]) {
    unit = UNIT_MAP[unitMatch[1]!.toLowerCase()]!;
    rest = rest.slice(unitMatch[0].length);
  } else if (quantity !== null) {
    // "200g paneer"
    const glued = /^(g|kg|ml|l)\b\s*/i.exec(rest);
    if (glued) {
      unit = UNIT_MAP[glued[1]!.toLowerCase()]!;
      rest = rest.slice(glued[0].length);
    }
  }

  const [name, ...noteParts] = rest.split(',');
  const cleanName = (name ?? '').trim();
  if (!cleanName) return null;
  const note = noteParts.join(',').trim();
  return { quantity, unit, name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1), note: note || null };
}

export function parseIngredientList(text: string): ParsedIngredient[] {
  return text
    .split(/\r?\n/)
    .map(parseIngredientLine)
    .filter((i): i is ParsedIngredient => !!i);
}
