import type { AppLanguage } from '@/i18n';
import { STARTER_RECIPES } from './starterRecipes';
import type { StarterTranslations } from './starterRecipes.i18n/types';
import type { Recipe } from './types';

/* eslint-disable @typescript-eslint/no-require-imports -- one language's text loads, when needed */
const loaders: Partial<Record<AppLanguage, () => StarterTranslations>> = {
  es: () => require('./starterRecipes.i18n/es').default as StarterTranslations,
  fr: () => require('./starterRecipes.i18n/fr').default as StarterTranslations,
  de: () => require('./starterRecipes.i18n/de').default as StarterTranslations,
  pt: () => require('./starterRecipes.i18n/pt').default as StarterTranslations,
  it: () => require('./starterRecipes.i18n/it').default as StarterTranslations,
  ar: () => require('./starterRecipes.i18n/ar').default as StarterTranslations,
  ja: () => require('./starterRecipes.i18n/ja').default as StarterTranslations,
};
/* eslint-enable @typescript-eslint/no-require-imports */

const BASE = new Map(STARTER_RECIPES.map((recipe) => [recipe.id, recipe]));

/**
 * True while a starter recipe still has the text it shipped with, so it can follow the app
 * language. Editing it in the recipe editor makes it the cook's own (starterText: false). Recipes
 * saved before the marker existed count if their text is exactly the shipped English text.
 */
export function isPristineStarter(recipe: Recipe): boolean {
  if (recipe.starterText !== undefined) return recipe.starterText;
  const base = BASE.get(recipe.id);
  if (!recipe.starter || !base) return false;
  return (
    recipe.title === base.title &&
    recipe.description === base.description &&
    recipe.ingredients.length === base.ingredients.length &&
    recipe.ingredients.every((ingredient, i) => ingredient.name === base.ingredients[i]?.name && ingredient.note === base.ingredients[i]?.note) &&
    recipe.steps.length === base.steps.length &&
    recipe.steps.every((step, i) => step.title === base.steps[i]?.title && step.instruction === base.steps[i]?.instruction)
  );
}

/**
 * A pristine starter recipe's words in `language` (the shipped English when there's no
 * translation). Everything the cook did with it — rating, notes, collections, cook count — stays.
 */
export function localizeStarter(recipe: Recipe, language: AppLanguage): Recipe {
  const base = BASE.get(recipe.id);
  if (!base) return recipe;
  let text: StarterTranslations[string] | undefined;
  try {
    text = loaders[language]?.()[recipe.id];
  } catch {
    text = undefined;
  }
  const english = {
    ...recipe,
    starterText: true,
    language: 'en',
    title: base.title,
    description: base.description,
    cuisine: base.cuisine,
    equipment: base.equipment,
    storage: base.storage,
    tags: base.tags,
    ingredients: base.ingredients.map((ingredient) => ({ ...ingredient })),
    steps: base.steps.map((step) => ({ ...step })),
  };
  if (!text) return english;
  return {
    ...english,
    language,
    title: text.title,
    description: text.description,
    cuisine: text.cuisine,
    equipment: text.equipment,
    storage: text.storage,
    tags: text.tags,
    ingredients: english.ingredients.map((ingredient) => {
      const t = text.ingredients[ingredient.id];
      return t ? { ...ingredient, name: t.name, note: t.note ?? ingredient.note, substitutes: t.substitutes ?? ingredient.substitutes } : ingredient;
    }),
    steps: english.steps.map((step) => {
      const t = text.steps[step.id];
      if (!t) return step;
      return {
        ...step,
        title: t.title,
        instruction: t.instruction,
        tip: t.tip ?? step.tip,
        doneCue: t.doneCue ?? step.doneCue,
        glossary: t.glossary ?? step.glossary,
        narration: t.narration,
      };
    }),
  };
}
