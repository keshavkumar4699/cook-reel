/** Mirrors the API's normalised recipe (server/src/domain/recipe.ts) plus on-device fields. */

export interface Macros {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export const INGREDIENT_CATEGORIES = ['produce', 'protein', 'dairy', 'grains', 'spices', 'pantry', 'frozen', 'bakery', 'other'] as const;
export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type RecipeSource = 'ai' | 'youtube' | 'manual';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number | null;
  unit: string;
  note: string | null;
  category: IngredientCategory;
  substitutes: string[];
  optional: boolean;
  nutrition?: Macros;
}

export interface GlossaryEntry {
  term: string;
  meaning: string;
}

export interface Step {
  id: string;
  title: string;
  instruction: string;
  durationSec: number | null;
  tip: string | null;
  doneCue: string | null;
  glossary: GlossaryEntry[];
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

/** What the API returns. */
export interface ApiRecipe {
  id: string;
  title: string;
  description: string;
  emoji: string;
  cuisine: string | null;
  mealTypes: MealType[];
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  difficulty: Difficulty;
  equipment: string[];
  estCost: { perServing: number; currency: string } | null;
  mealPrepFriendly: boolean;
  storage: string | null;
  tags: string[];
  ingredients: Ingredient[];
  steps: Step[];
  nutrition: { perServing: Macros; total: Macros } | null;
  source: RecipeSource;
  youtube: YouTubeSource | null;
  createdAt: string;
}

/** A recipe in the cook's library. */
export interface Recipe extends ApiRecipe {
  updatedAt: string;
  /** Set on variations created with "Experiment". */
  parentId: string | null;
  /** What changed relative to the parent ("Swapped paneer for tofu…"). */
  changes: string[];
  collections: string[];
  cookLater: boolean;
  rating: number | null;
  notes: string;
  timesCooked: number;
  lastCookedAt: string | null;
  /** Recipes that ship with the app. */
  starter?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
}

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface PlanEntry {
  id: string;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  slot: MealSlot;
  recipeId: string;
  servings: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string;
  category: IngredientCategory;
  checked: boolean;
  /** Recipes this item was added for (empty for manual items). */
  recipeIds: string[];
  createdAt: string;
}

export type Persona = 'saver' | 'creator' | 'quick' | 'fridge' | 'fitness' | 'learner';

export interface CookProfile {
  householdSize?: number;
  diet?: 'vegetarian' | 'eggetarian' | 'non-vegetarian' | 'vegan' | 'pescatarian';
  allergies?: string[];
  dislikes?: string[];
  equipment?: string[];
  goal?: 'build_muscle' | 'lose_fat' | 'maintain' | 'eat_healthy' | 'none';
  dailyCalories?: number;
  dailyProteinG?: number;
  skill?: 'new' | 'basic' | 'confident';
  maxMinutes?: number;
  budget?: 'tight' | 'moderate' | 'flexible';
  cuisines?: string[];
  region?: string;
  currency?: string;
  units?: 'metric' | 'us';
  spiceLevel?: 'mild' | 'medium' | 'hot';
  tasteHints?: string[];
}
