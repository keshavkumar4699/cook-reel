import type { ApiRecipe, CookProfile, Recipe } from '@/data/types';
import { stripBidi, t } from '@/i18n';
import { joinFacts } from '@/i18n/format';
import type { ExperimentRecipeInput } from '@/lib/api';
import { formatMinutes, formatQuantity } from '@/lib/format';
import { newId } from '@/lib/id';

/** Turns an API recipe into a library entry with its own local ID. */
export function fromApiRecipe(recipe: ApiRecipe, extra: Partial<Recipe> = {}): Recipe {
  const now = new Date().toISOString();
  return {
    ...recipe,
    id: newId(),
    updatedAt: now,
    createdAt: now,
    parentId: null,
    changes: [],
    collections: [],
    cookLater: false,
    rating: null,
    notes: '',
    timesCooked: 0,
    lastCookedAt: null,
    ...extra,
  };
}

export function emptyRecipe(): Recipe {
  const now = new Date().toISOString();
  return {
    id: newId(),
    title: '',
    description: '',
    emoji: '🍽️',
    cuisine: null,
    mealTypes: [],
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 15,
    totalMinutes: 25,
    difficulty: 'easy',
    equipment: [],
    estCost: null,
    mealPrepFriendly: false,
    storage: null,
    tags: [],
    ingredients: [],
    steps: [],
    nutrition: null,
    source: 'manual',
    youtube: null,
    createdAt: now,
    updatedAt: now,
    parentId: null,
    changes: [],
    collections: [],
    cookLater: false,
    rating: null,
    notes: '',
    timesCooked: 0,
    lastCookedAt: null,
  };
}

export function toExperimentInput(recipe: Recipe): ExperimentRecipeInput {
  return {
    title: recipe.title,
    description: recipe.description,
    cuisine: recipe.cuisine,
    servings: recipe.servings,
    prepMinutes: recipe.prepMinutes,
    cookMinutes: recipe.cookMinutes,
    difficulty: recipe.difficulty,
    equipment: recipe.equipment.slice(0, 20),
    tags: recipe.tags.slice(0, 20),
    ingredients: recipe.ingredients.slice(0, 80).map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit, note: i.note })),
    steps: recipe.steps.slice(0, 50).map((s) => ({ title: s.title, instruction: s.instruction })),
    ...(recipe.nutrition ? { nutrition: { perServing: recipe.nutrition.perServing } } : {}),
  };
}

export const isHighProtein = (r: Recipe) => (r.nutrition?.perServing.proteinG ?? 0) >= 25;
export const isQuick = (r: Recipe) => r.totalMinutes > 0 && r.totalMinutes <= 20;
export const isLight = (r: Recipe) => !!r.nutrition && r.nutrition.perServing.kcal <= 500;

/** Stable index for picking a cover gradient. */
export function hashIndex(seed: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % modulo;
}

export function sourceLabel(recipe: Recipe): string {
  if (recipe.starter) return t('common.sources.kitchen');
  if (recipe.source === 'youtube') return recipe.youtube?.channel ? recipe.youtube.channel : t('common.sources.youtube');
  if (recipe.source === 'ai') return recipe.parentId ? t('common.sources.variation') : t('common.sources.chef');
  return t('common.sources.own');
}

/**
 * Short preference hints derived on-device from what the cook rates highly — sent with AI requests
 * so suggestions get more personal without uploading the library.
 */
export function tasteHints(recipes: Recipe[]): string[] {
  const loved = recipes.filter((r) => (r.rating ?? 0) >= 4 || r.timesCooked >= 2);
  if (!loved.length) return [];
  const count = (values: string[]) => {
    const map = new Map<string, number>();
    for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
  };
  const cuisines = count(loved.map((r) => r.cuisine).filter((c): c is string => !!c)).slice(0, 3);
  const tags = count(loved.flatMap((r) => r.tags)).slice(0, 4);
  const hints: string[] = [];
  if (cuisines.length) hints.push(`enjoys ${cuisines.join(', ')} food`);
  if (tags.length) hints.push(`often picks ${tags.join(', ')} recipes`);
  hints.push(`recent favourites: ${loved.slice(0, 3).map((r) => r.title).join(', ')}`);
  return hints;
}

export function profileForAI(profile: CookProfile, recipes: Recipe[]): CookProfile {
  const hints = tasteHints(recipes);
  return hints.length ? { ...profile, tasteHints: hints } : profile;
}

/** Plain-text version for the share sheet. */
export function recipeToText(recipe: Recipe): string {
  const facts = joinFacts([
    t('common.share.serves', { count: recipe.servings }),
    formatMinutes(recipe.totalMinutes),
    recipe.nutrition ? t('common.share.kcalPerServing', { kcal: recipe.nutrition.perServing.kcal }) : null,
  ]);
  const lines = [
    `${recipe.emoji} ${recipe.title}`,
    recipe.description,
    '',
    facts,
    '',
    t('common.share.ingredients'),
    ...recipe.ingredients.map((i) => `• ${[formatQuantity(i.quantity, i.unit), i.name].filter(Boolean).join(' ')}${i.note ? ` (${i.note})` : ''}`),
    '',
    t('common.share.steps'),
    ...recipe.steps.map((s, n) => `${n + 1}. ${s.instruction}`),
  ];
  if (recipe.youtube) lines.push('', t('common.share.video', { url: recipe.youtube.url }));
  lines.push('', t('common.share.sharedFrom'));
  return stripBidi(lines.filter((l, i, all) => !(l === '' && all[i - 1] === '')).join('\n'));
}
