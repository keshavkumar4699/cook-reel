import type { Ingredient, IngredientCategory, ShoppingItem } from '@/data/types';
import { getLanguage, t } from '@/i18n';
import { canonicalUnitCode, type UnitCode } from './units';

type Dimension = 'mass' | 'volume' | 'other';

const CONVERSIONS: Partial<Record<UnitCode, { unit: UnitCode; factor: number; dimension: Dimension }>> = {
  g: { unit: 'g', factor: 1, dimension: 'mass' },
  kg: { unit: 'g', factor: 1000, dimension: 'mass' },
  ml: { unit: 'ml', factor: 1, dimension: 'volume' },
  l: { unit: 'ml', factor: 1000, dimension: 'volume' },
};

function canonicalUnit(unit: string) {
  const code = canonicalUnitCode(unit);
  if (code === 'count') return { unit: '', factor: 1, dimension: 'other' as Dimension };
  if (code) return CONVERSIONS[code] ?? { unit: code, factor: 1, dimension: 'other' as Dimension };
  // Unknown unit: merge simple plural spellings ("sachets" / "sachet") in English.
  return { unit: singularize(unit.trim().toLowerCase()), factor: 1, dimension: 'other' as Dimension };
}

/** Light-touch English singular: "tomatoes" → "tomato", "cloves" → "clove", "glass" stays. Other languages are left alone. */
function singularize(word: string): string {
  if (getLanguage() !== 'en' || !/^[a-z ]+$/.test(word)) return word;
  if (word.length > 4 && word.endsWith('oes')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

/**
 * Comparable form of an ingredient name in any script: lower-case, no bracketed notes or
 * punctuation (ASCII, CJK and Arabic marks), single spaces. Letters of every language are kept.
 */
export function normalizeName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/\(.*?\)|（.*?）/g, '')
    .replace(/[!-/:-@[-`{-~\u00a1-\u00bf\u2010-\u2027\u3000-\u303f\u30fb\uff01-\uff0f\uff1a-\uff20\u060c\u061b\u061f\u066a-\u066d]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return singularize(cleaned);
}

export interface ShoppingSource {
  recipeId: string;
  ingredient: Pick<Ingredient, 'name' | 'quantity' | 'unit' | 'category' | 'optional'>;
  /** Servings multiplier relative to the recipe's base servings. */
  factor: number;
}

export interface AggregatedItem {
  key: string;
  name: string;
  quantity: number | null;
  unit: string;
  category: IngredientCategory;
  recipeIds: string[];
}

/**
 * Merges ingredients from several recipes into one shopping list: same item + compatible unit are
 * summed (200 g + 0.5 kg → 700 g); "to taste" items appear once.
 */
export function aggregateIngredients(sources: ShoppingSource[]): AggregatedItem[] {
  const items = new Map<string, AggregatedItem>();
  for (const { recipeId, ingredient, factor } of sources) {
    if (ingredient.optional) continue;
    const name = normalizeName(ingredient.name);
    if (!name) continue;
    const { unit, factor: unitFactor } = canonicalUnit(ingredient.unit);
    const key = `${name}|${ingredient.quantity === null ? '' : unit}`;
    const amount = ingredient.quantity === null ? null : ingredient.quantity * factor * unitFactor;

    const existing = items.get(key);
    if (existing) {
      existing.quantity = existing.quantity === null || amount === null ? existing.quantity ?? amount : existing.quantity + amount;
      if (!existing.recipeIds.includes(recipeId)) existing.recipeIds.push(recipeId);
    } else {
      items.set(key, {
        key,
        name: ingredient.name.trim(),
        quantity: amount,
        unit: ingredient.quantity === null ? '' : unit,
        category: ingredient.category,
        recipeIds: [recipeId],
      });
    }
  }
  return [...items.values()];
}

/** Adds aggregated items into an existing list, merging with unchecked items of the same kind. */
export function mergeIntoList(
  list: ShoppingItem[],
  additions: AggregatedItem[],
  makeId: () => string,
  now = new Date().toISOString(),
): ShoppingItem[] {
  const next = list.map((item) => ({ ...item, recipeIds: [...item.recipeIds] }));
  for (const add of additions) {
    const match = next.find(
      (item) => !item.checked && normalizeName(item.name) === normalizeName(add.name) && canonicalUnit(item.unit).unit === add.unit,
    );
    if (match) {
      match.quantity = match.quantity === null || add.quantity === null ? match.quantity ?? add.quantity : match.quantity + add.quantity;
      for (const id of add.recipeIds) if (!match.recipeIds.includes(id)) match.recipeIds.push(id);
    } else {
      next.push({
        id: makeId(),
        name: add.name,
        quantity: add.quantity,
        unit: add.unit,
        category: add.category,
        checked: false,
        recipeIds: add.recipeIds,
        createdAt: now,
      });
    }
  }
  return next;
}

const CATEGORY_EMOJI: Record<IngredientCategory, string> = {
  produce: '🥬',
  protein: '🥚',
  dairy: '🧀',
  grains: '🌾',
  spices: '🌶️',
  pantry: '🫙',
  frozen: '🧊',
  bakery: '🥖',
  other: '🛒',
};

export const CATEGORY_LABELS: Record<IngredientCategory, { label: string; emoji: string }> = Object.fromEntries(
  (Object.keys(CATEGORY_EMOJI) as IngredientCategory[]).map((category) => [category, { label: t(`common.categories.${category}`), emoji: CATEGORY_EMOJI[category] }]),
) as Record<IngredientCategory, { label: string; emoji: string }>;

export const CATEGORY_ORDER: IngredientCategory[] = ['produce', 'protein', 'dairy', 'grains', 'bakery', 'pantry', 'spices', 'frozen', 'other'];
