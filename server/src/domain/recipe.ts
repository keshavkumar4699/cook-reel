import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { FALLBACK_TEXT, languageFromCode, type AppLanguage } from './languages.js';
import { canonicalUnit } from './units.js';

/* ------------------------------------------------------------------------------------------------
 * AI-facing schemas. Used as Claude structured-output formats, so every field is required
 * (nullable where a value may be absent) and described for the model.
 * ---------------------------------------------------------------------------------------------- */

export const INGREDIENT_CATEGORIES = [
  'produce',
  'protein',
  'dairy',
  'grains',
  'spices',
  'pantry',
  'frozen',
  'bakery',
  'other',
] as const;
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'] as const;
export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export const MacrosSchema = z.object({
  kcal: z.number().describe('Energy in kilocalories'),
  proteinG: z.number().describe('Protein in grams'),
  carbsG: z.number().describe('Carbohydrates in grams'),
  fatG: z.number().describe('Fat in grams'),
  fiberG: z.number().describe('Dietary fibre in grams'),
});
export type Macros = z.infer<typeof MacrosSchema>;

export const IngredientDraftSchema = z.object({
  name: z.string().describe('Ingredient name as a shopper would look for it, e.g. "Paneer", "Red onion", "Basmati rice"'),
  quantity: z
    .number()
    .nullable()
    .describe('Amount for the whole recipe (all servings). null only for "to taste" items such as salt.'),
  unit: z
    .string()
    .describe('Unit: g, kg, ml, l, tsp, tbsp, cup, piece, clove, slice, pinch, can, bunch. Empty string for whole countable items or "to taste".'),
  note: z.string().nullable().describe('Preparation or size note, e.g. "finely chopped", "medium", "at room temperature"'),
  category: z.enum(INGREDIENT_CATEGORIES).describe('Shopping-list aisle'),
  substitutes: z.array(z.string()).describe('0-3 easy substitutes a beginner could use instead'),
  optional: z.boolean().describe('True if the dish works without it (garnish, finishing touches)'),
  nutrition: MacrosSchema.describe('Nutrition for the full quantity of this ingredient used in the recipe (not per serving)'),
});

export const StepDraftSchema = z.object({
  title: z.string().describe('2-4 word title, e.g. "Toast the spices"'),
  instruction: z.string().describe('1-3 short sentences: one clear action with heat level, timing and amounts'),
  durationSec: z.number().nullable().describe('Active waiting/cooking time for this step in seconds, null if instant'),
  tip: z.string().nullable().describe('Beginner tip that prevents a common mistake, or null'),
  doneCue: z.string().nullable().describe('What it looks/smells/sounds like when this step is done, or null'),
  glossary: z
    .array(z.object({ term: z.string(), meaning: z.string() }))
    .describe('Cooking terms used in this step that a beginner may not know, with a one-line plain explanation'),
  clipStartSec: z.number().nullable().describe('Video recipes only: start of the clip for this step in seconds, else null'),
  clipEndSec: z.number().nullable().describe('Video recipes only: end of the clip for this step in seconds, else null'),
  narration: z
    .string()
    .nullable()
    .describe('Text that will be read aloud for this step (written for the ear: no symbols or abbreviations), or null'),
});

export const RecipeDraftSchema = z.object({
  language: z.string().describe('ISO 639-1 code of the language this recipe is written in, e.g. "es"'),
  title: z.string().describe('Appetising, specific dish name'),
  description: z.string().describe('1-2 sentences on why this recipe fits the cook (taste, time, goals)'),
  emoji: z.string().describe('A single emoji representing the dish'),
  cuisine: z.string().nullable(),
  mealTypes: z.array(z.enum(MEAL_TYPES)),
  servings: z.number().describe('Number of servings the quantities make'),
  prepMinutes: z.number(),
  cookMinutes: z.number(),
  difficulty: z.enum(DIFFICULTIES),
  equipment: z.array(z.string()).describe('Every tool needed, e.g. "Non-stick pan", "Pressure cooker"'),
  estCostPerServing: z.number().nullable().describe('Estimated ingredient cost per serving in the local currency'),
  currency: z.string().nullable().describe('ISO 4217 code of estCostPerServing, e.g. INR, USD'),
  mealPrepFriendly: z.boolean(),
  storage: z.string().nullable().describe('How to store and reheat leftovers, or null'),
  tags: z.array(z.string()).describe('3-6 short lowercase tags, e.g. "high-protein", "one-pot", "15-min"'),
  ingredients: z.array(IngredientDraftSchema),
  steps: z.array(StepDraftSchema),
});
export type RecipeDraft = z.infer<typeof RecipeDraftSchema>;

/* ------------------------------------------------------------------------------------------------
 * Normalised recipe returned to the app.
 * ---------------------------------------------------------------------------------------------- */

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export interface Ingredient {
  id: string;
  name: string;
  quantity: number | null;
  unit: string;
  note: string | null;
  category: IngredientCategory;
  substitutes: string[];
  optional: boolean;
  nutrition: Macros;
}

export interface Step {
  id: string;
  title: string;
  instruction: string;
  durationSec: number | null;
  tip: string | null;
  doneCue: string | null;
  glossary: Array<{ term: string; meaning: string }>;
  clip: { startSec: number; endSec: number } | null;
  narration: string | null;
}

export interface YouTubeSource {
  videoId: string;
  url: string;
  isShort: boolean;
  title: string;
  channel: string | null;
  thumbnailUrl: string;
  durationSec: number | null;
}

export interface Recipe {
  id: string;
  /** The language every text field is written in. */
  language: AppLanguage;
  title: string;
  description: string;
  emoji: string;
  cuisine: string | null;
  mealTypes: Array<(typeof MEAL_TYPES)[number]>;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  difficulty: (typeof DIFFICULTIES)[number];
  equipment: string[];
  estCost: { perServing: number; currency: string } | null;
  mealPrepFriendly: boolean;
  storage: string | null;
  tags: string[];
  ingredients: Ingredient[];
  steps: Step[];
  nutrition: { perServing: Macros; total: Macros };
  source: 'ai' | 'youtube' | 'manual';
  youtube: YouTubeSource | null;
  createdAt: string;
}

export const MIN_CLIP_SECONDS = 3;
const MAX_STEP_SECONDS = 24 * 60 * 60;

const round = (value: number, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
const finiteOr = (value: number | null | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const clean = (value: string | null | undefined) => {
  const trimmed = (value ?? '').replace(/\s+/g, ' ').trim();
  return trimmed.length ? trimmed : null;
};

export const ZERO_MACROS: Macros = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 };

export function roundMacros(m: Macros): Macros {
  return {
    kcal: Math.max(0, Math.round(finiteOr(m.kcal, 0))),
    proteinG: Math.max(0, round(finiteOr(m.proteinG, 0), 1)),
    carbsG: Math.max(0, round(finiteOr(m.carbsG, 0), 1)),
    fatG: Math.max(0, round(finiteOr(m.fatG, 0), 1)),
    fiberG: Math.max(0, round(finiteOr(m.fiberG, 0), 1)),
  };
}

export function sumMacros(items: Macros[]): Macros {
  return items.reduce<Macros>(
    (acc, m) => ({
      kcal: acc.kcal + Math.max(0, finiteOr(m.kcal, 0)),
      proteinG: acc.proteinG + Math.max(0, finiteOr(m.proteinG, 0)),
      carbsG: acc.carbsG + Math.max(0, finiteOr(m.carbsG, 0)),
      fatG: acc.fatG + Math.max(0, finiteOr(m.fatG, 0)),
      fiberG: acc.fiberG + Math.max(0, finiteOr(m.fiberG, 0)),
    }),
    { ...ZERO_MACROS },
  );
}

/**
 * Energy consistency check (Atwater factors: 4/4/9 kcal per gram). Per-ingredient estimates can
 * drift; when the stated calories disagree with the macros by more than 35% we trust the macros.
 */
export function reconcileCalories(m: Macros): Macros {
  const atwater = 4 * m.proteinG + 4 * m.carbsG + 9 * m.fatG;
  if (atwater <= 0) return m;
  const drift = Math.abs(m.kcal - atwater) / atwater;
  return drift > 0.35 ? { ...m, kcal: atwater } : m;
}

export function scaleMacros(m: Macros, factor: number): Macros {
  return {
    kcal: m.kcal * factor,
    proteinG: m.proteinG * factor,
    carbsG: m.carbsG * factor,
    fatG: m.fatG * factor,
    fiberG: m.fiberG * factor,
  };
}

export function normalizeClip(
  start: number | null | undefined,
  end: number | null | undefined,
  durationSec: number | null,
): { startSec: number; endSec: number } | null {
  if (typeof start !== 'number' || typeof end !== 'number' || !Number.isFinite(start) || !Number.isFinite(end)) return null;
  let s = Math.max(0, Math.min(start, end));
  let e = Math.max(0, Math.max(start, end));
  if (durationSec && durationSec > 0) {
    if (s >= durationSec) return null;
    e = Math.min(e, durationSec);
  }
  if (e - s < MIN_CLIP_SECONDS) {
    e = s + MIN_CLIP_SECONDS;
    if (durationSec && e > durationSec) {
      e = durationSec;
      s = Math.max(0, e - MIN_CLIP_SECONDS);
    }
  }
  return { startSec: round(s, 1), endSec: round(e, 1) };
}

function firstEmoji(value: string | null | undefined): string {
  const candidate = (value ?? '').trim();
  if (!candidate) return '🍽️';
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  for (const { segment } of segmenter.segment(candidate)) {
    if (/\p{Extended_Pictographic}/u.test(segment)) return segment;
  }
  return '🍽️';
}

function normalizeTags(tags: string[]): string[] {
  const out: string[] = [];
  for (const tag of tags) {
    const t = tag
      .toLowerCase()
      .replace(/^#/, '')
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}-]/gu, '')
      .slice(0, 24);
    if (t && !out.includes(t)) out.push(t);
    if (out.length >= 8) break;
  }
  return out;
}

export interface NormalizeOptions {
  source: Recipe['source'];
  /** The language the cook asked for: used when the model doesn't say, and for text the server fills in. */
  language?: AppLanguage;
  youtube?: YouTubeSource | null;
  /** Video length, used to clamp clip ranges. */
  durationSec?: number | null;
  now?: Date;
}

export function normalizeRecipe(draft: RecipeDraft, options: NormalizeOptions): Recipe {
  const servings = Math.min(50, Math.max(1, Math.round(finiteOr(draft.servings, 1))));
  const prepMinutes = Math.max(0, Math.round(finiteOr(draft.prepMinutes, 0)));
  const cookMinutes = Math.max(0, Math.round(finiteOr(draft.cookMinutes, 0)));
  const durationSec = options.durationSec ?? options.youtube?.durationSec ?? null;
  const isVideo = options.source === 'youtube';
  const language = languageFromCode(draft.language) ?? options.language ?? 'en';
  const fallback = FALLBACK_TEXT[language];

  const ingredients: Ingredient[] = draft.ingredients
    .map((ing) => ({
      id: randomUUID(),
      name: clean(ing.name) ?? '',
      quantity:
        typeof ing.quantity === 'number' && Number.isFinite(ing.quantity) && ing.quantity > 0 ? round(ing.quantity, 2) : null,
      unit: canonicalUnit(ing.unit),
      note: clean(ing.note),
      category: ing.category,
      substitutes: ing.substitutes.map((s) => clean(s)).filter((s): s is string => !!s).slice(0, 3),
      optional: !!ing.optional,
      nutrition: roundMacros(reconcileCalories(ing.nutrition)),
    }))
    .filter((ing) => ing.name.length > 0);

  const steps: Step[] = draft.steps
    .map((step) => {
      const duration = finiteOr(step.durationSec, 0);
      return {
        id: randomUUID(),
        title: clean(step.title) ?? fallback.step,
        instruction: clean(step.instruction) ?? '',
        durationSec: duration > 0 ? Math.min(MAX_STEP_SECONDS, Math.round(duration)) : null,
        tip: clean(step.tip),
        doneCue: clean(step.doneCue),
        glossary: step.glossary
          .map((g) => ({ term: clean(g.term) ?? '', meaning: clean(g.meaning) ?? '' }))
          .filter((g) => g.term && g.meaning)
          .slice(0, 4),
        clip: isVideo ? normalizeClip(step.clipStartSec, step.clipEndSec, durationSec) : null,
        narration: clean(step.narration),
      };
    })
    .filter((step) => step.instruction.length > 0);

  const total = roundMacros(reconcileCalories(sumMacros(ingredients.map((i) => i.nutrition))));
  const perServing = roundMacros(scaleMacros(total, 1 / servings));

  const cost = finiteOr(draft.estCostPerServing, 0);
  const currency = (draft.currency ?? '').trim().toUpperCase();

  return {
    id: randomUUID(),
    language,
    title: clean(draft.title) ?? fallback.untitled,
    description: clean(draft.description) ?? '',
    emoji: firstEmoji(draft.emoji),
    cuisine: clean(draft.cuisine),
    mealTypes: [...new Set(draft.mealTypes)],
    servings,
    prepMinutes,
    cookMinutes,
    totalMinutes: prepMinutes + cookMinutes,
    difficulty: draft.difficulty,
    equipment: [...new Set(draft.equipment.map((e) => clean(e)).filter((e): e is string => !!e))].slice(0, 12),
    estCost: cost > 0 && /^[A-Z]{3}$/.test(currency) ? { perServing: round(cost, 2), currency } : null,
    mealPrepFriendly: !!draft.mealPrepFriendly,
    storage: clean(draft.storage),
    tags: normalizeTags(draft.tags),
    ingredients,
    steps,
    nutrition: { perServing, total },
    source: options.source,
    youtube: options.youtube ?? null,
    createdAt: (options.now ?? new Date()).toISOString(),
  };
}

/* ------------------------------------------------------------------------------------------------
 * Translations. A YouTube recipe is analysed once; other languages get a translation of its text,
 * with quantities, units, timings, clips and nutrition copied from the original in code.
 * ---------------------------------------------------------------------------------------------- */

const SAME_ORDER = 'Exactly one entry per entry of the original, in the same order';

export const RecipeTranslationSchema = z.object({
  language: z.string().describe('ISO 639-1 code of the language you translated into'),
  title: z.string(),
  description: z.string(),
  cuisine: z.string().nullable(),
  equipment: z.array(z.string()),
  storage: z.string().nullable(),
  tags: z.array(z.string()),
  ingredients: z
    .array(z.object({ name: z.string(), note: z.string().nullable(), substitutes: z.array(z.string()) }))
    .describe(SAME_ORDER),
  steps: z
    .array(
      z.object({
        title: z.string(),
        instruction: z.string(),
        tip: z.string().nullable(),
        doneCue: z.string().nullable(),
        glossary: z.array(z.object({ term: z.string(), meaning: z.string() })),
        narration: z.string().nullable(),
      }),
    )
    .describe(SAME_ORDER),
});
export type RecipeTranslation = z.infer<typeof RecipeTranslationSchema>;

/** The text a translation replaces, in the same shape it comes back in. */
export function translatableText(recipe: Recipe): Omit<RecipeTranslation, 'language'> {
  return {
    title: recipe.title,
    description: recipe.description,
    cuisine: recipe.cuisine,
    equipment: recipe.equipment,
    storage: recipe.storage,
    tags: recipe.tags,
    ingredients: recipe.ingredients.map((i) => ({ name: i.name, note: i.note, substitutes: i.substitutes })),
    steps: recipe.steps.map((s) => ({
      title: s.title,
      instruction: s.instruction,
      tip: s.tip,
      doneCue: s.doneCue,
      glossary: s.glossary,
      narration: s.narration,
    })),
  };
}

/** The recipe with its text from `translation`; everything else stays the original's. */
export function applyTranslation(recipe: Recipe, translation: RecipeTranslation, language: AppLanguage): Recipe {
  if (translation.ingredients.length !== recipe.ingredients.length || translation.steps.length !== recipe.steps.length) {
    throw new Error('translation does not line up with the recipe');
  }
  const keep = (original: string | null, translated: string | null) => (original === null ? null : (clean(translated) ?? original));
  const texts = (list: string[], max: number) => list.map((v) => clean(v)).filter((v): v is string => !!v).slice(0, max);
  const equipment = texts(translation.equipment, 12);
  const tags = normalizeTags(translation.tags);
  return {
    ...recipe,
    language,
    title: clean(translation.title) ?? recipe.title,
    description: clean(translation.description) ?? recipe.description,
    cuisine: keep(recipe.cuisine, translation.cuisine),
    equipment: equipment.length ? equipment : recipe.equipment,
    storage: keep(recipe.storage, translation.storage),
    tags: tags.length ? tags : recipe.tags,
    ingredients: recipe.ingredients.map((ingredient, i) => {
      const t = translation.ingredients[i]!;
      return { ...ingredient, name: clean(t.name) ?? ingredient.name, note: keep(ingredient.note, t.note), substitutes: texts(t.substitutes, 3) };
    }),
    steps: recipe.steps.map((step, i) => {
      const t = translation.steps[i]!;
      const glossary = t.glossary
        .map((g) => ({ term: clean(g.term) ?? '', meaning: clean(g.meaning) ?? '' }))
        .filter((g) => g.term && g.meaning)
        .slice(0, 4);
      return {
        ...step,
        title: clean(t.title) ?? step.title,
        instruction: clean(t.instruction) ?? step.instruction,
        tip: keep(step.tip, t.tip),
        doneCue: keep(step.doneCue, t.doneCue),
        glossary: step.glossary.length ? glossary : [],
        narration: keep(step.narration, t.narration),
      };
    }),
  };
}

/** Compact text used for the retrieval knowledge base (embedded and shown to the model as a reference). */
export function knowledgeSummary(recipe: Recipe): string {
  const keyIngredients = recipe.ingredients
    .filter((i) => !i.optional)
    .slice(0, 10)
    .map((i) => [i.name, i.quantity !== null ? `${i.quantity}${i.unit ? ` ${i.unit}` : ''}` : null].filter(Boolean).join(' '))
    .join(', ');
  const method = recipe.steps
    .slice(0, 8)
    .map((s) => s.title.toLowerCase())
    .join(' → ');
  const n = recipe.nutrition.perServing;
  return [
    `${recipe.title}${recipe.cuisine ? ` (${recipe.cuisine})` : ''} — serves ${recipe.servings}, ${recipe.totalMinutes} min, ${recipe.difficulty}.`,
    `Key ingredients: ${keyIngredients}.`,
    `Method: ${method}.`,
    `Per serving: ${n.kcal} kcal, ${n.proteinG} g protein.`,
    recipe.tags.length ? `Tags: ${recipe.tags.join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/* ------------------------------------------------------------------------------------------------
 * Client-supplied data.
 * ---------------------------------------------------------------------------------------------- */

const shortText = (max: number) => z.string().trim().max(max);

export const CookProfileSchema = z
  .object({
    householdSize: z.number().int().min(1).max(20).optional(),
    diet: z.enum(['vegetarian', 'eggetarian', 'non-vegetarian', 'vegan', 'pescatarian']).optional(),
    allergies: z.array(shortText(40)).max(20).optional(),
    dislikes: z.array(shortText(40)).max(20).optional(),
    equipment: z.array(shortText(40)).max(30).optional(),
    goal: z.enum(['build_muscle', 'lose_fat', 'maintain', 'eat_healthy', 'none']).optional(),
    dailyCalories: z.number().int().min(800).max(6000).optional(),
    dailyProteinG: z.number().int().min(10).max(400).optional(),
    skill: z.enum(['new', 'basic', 'confident']).optional(),
    maxMinutes: z.number().int().min(5).max(240).optional(),
    budget: z.enum(['tight', 'moderate', 'flexible']).optional(),
    cuisines: z.array(shortText(40)).max(20).optional(),
    region: shortText(60).optional(),
    currency: z.string().regex(/^[A-Z]{3}$/).optional(),
    units: z.enum(['metric', 'us']).optional(),
    spiceLevel: z.enum(['mild', 'medium', 'hot']).optional(),
    /** Derived on-device from the cook's highly rated recipes, e.g. "loves spicy one-pot curries". */
    tasteHints: z.array(shortText(80)).max(10).optional(),
  })
  .partial();
export type CookProfile = z.infer<typeof CookProfileSchema>;

const GOAL_LABELS: Record<NonNullable<CookProfile['goal']>, string> = {
  build_muscle: 'build muscle (protein-forward meals)',
  lose_fat: 'lose fat (lower calorie, high satiety, high protein)',
  maintain: 'maintain weight with balanced meals',
  eat_healthy: 'eat healthier everyday food',
  none: 'no specific fitness goal',
};
const SKILL_LABELS: Record<NonNullable<CookProfile['skill']>, string> = {
  new: 'has never really cooked — explain everything',
  basic: 'knows the basics',
  confident: 'confident home cook',
};

/** Renders the cook profile as plain lines for the prompt. Empty profile → empty string. */
export function describeProfile(profile: CookProfile | undefined): string {
  if (!profile) return '';
  const lines: string[] = [];
  if (profile.householdSize) lines.push(`Usually cooks for: ${profile.householdSize} ${profile.householdSize === 1 ? 'person' : 'people'}`);
  if (profile.diet) lines.push(`Diet: ${profile.diet}`);
  if (profile.allergies?.length) lines.push(`Allergies (never include): ${profile.allergies.join(', ')}`);
  if (profile.dislikes?.length) lines.push(`Dislikes: ${profile.dislikes.join(', ')}`);
  if (profile.equipment?.length) lines.push(`Kitchen equipment available: ${profile.equipment.join(', ')}`);
  if (profile.goal) lines.push(`Goal: ${GOAL_LABELS[profile.goal]}`);
  if (profile.dailyCalories) lines.push(`Daily calorie target: ~${profile.dailyCalories} kcal`);
  if (profile.dailyProteinG) lines.push(`Daily protein target: ~${profile.dailyProteinG} g`);
  if (profile.skill) lines.push(`Cooking skill: ${SKILL_LABELS[profile.skill]}`);
  if (profile.maxMinutes) lines.push(`Usually has about ${profile.maxMinutes} minutes to cook`);
  if (profile.budget) lines.push(`Budget: ${profile.budget}`);
  if (profile.spiceLevel) lines.push(`Spice preference: ${profile.spiceLevel}`);
  if (profile.cuisines?.length) lines.push(`Favourite cuisines: ${profile.cuisines.join(', ')}`);
  if (profile.region) lines.push(`Lives in: ${profile.region} (use locally available ingredients and names)`);
  if (profile.currency) lines.push(`Currency for cost estimates: ${profile.currency}`);
  if (profile.units) lines.push(`Preferred units: ${profile.units === 'us' ? 'US cups/oz plus grams' : 'metric (g, ml) plus spoons'}`);
  if (profile.tasteHints?.length) lines.push(`Taste history: ${profile.tasteHints.join('; ')}`);
  return lines.join('\n');
}

/** A recipe as stored on the device, sent back for experiments. Unknown fields are dropped. */
export const RecipeInputSchema = z.object({
  title: shortText(200),
  description: shortText(2000).optional().default(''),
  cuisine: shortText(80).nullish(),
  servings: z.number().min(1).max(50),
  prepMinutes: z.number().min(0).max(10_000).optional(),
  cookMinutes: z.number().min(0).max(10_000).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  equipment: z.array(shortText(60)).max(20).optional(),
  tags: z.array(shortText(40)).max(20).optional(),
  ingredients: z
    .array(
      z.object({
        name: shortText(120),
        quantity: z.number().nullable().optional(),
        unit: shortText(30).optional().default(''),
        note: shortText(200).nullish(),
      }),
    )
    .min(1)
    .max(80),
  steps: z
    .array(
      z.object({
        title: shortText(120).optional().default(''),
        instruction: shortText(2000),
      }),
    )
    .min(1)
    .max(50),
  nutrition: z.object({ perServing: MacrosSchema }).optional(),
});
export type RecipeInput = z.infer<typeof RecipeInputSchema>;

/** Plain-text rendering of a recipe for prompts. */
export function recipeToPromptText(recipe: RecipeInput): string {
  const ingredients = recipe.ingredients
    .map((i) => `- ${[i.quantity ?? '', i.unit ?? '', i.name].filter((p) => p !== '').join(' ')}${i.note ? ` (${i.note})` : ''}`)
    .join('\n');
  const steps = recipe.steps.map((s, idx) => `${idx + 1}. ${s.title ? `${s.title}: ` : ''}${s.instruction}`).join('\n');
  const n = recipe.nutrition?.perServing;
  return [
    `Title: ${recipe.title}`,
    recipe.description ? `Description: ${recipe.description}` : '',
    recipe.cuisine ? `Cuisine: ${recipe.cuisine}` : '',
    `Servings: ${recipe.servings}`,
    recipe.prepMinutes !== undefined ? `Prep: ${recipe.prepMinutes} min, cook: ${recipe.cookMinutes ?? 0} min` : '',
    recipe.equipment?.length ? `Equipment: ${recipe.equipment.join(', ')}` : '',
    n ? `Per serving: ${n.kcal} kcal, ${n.proteinG} g protein, ${n.carbsG} g carbs, ${n.fatG} g fat` : '',
    `Ingredients:\n${ingredients}`,
    `Steps:\n${steps}`,
  ]
    .filter(Boolean)
    .join('\n');
}
