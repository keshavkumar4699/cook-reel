import type { Ingredient, Macros, Recipe } from '@/data/types';

export const ZERO_MACROS: Macros = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 };

export function scaleIngredient(ingredient: Ingredient, factor: number): Ingredient {
  return {
    ...ingredient,
    quantity: ingredient.quantity === null ? null : ingredient.quantity * factor,
  };
}

/** Per-serving nutrition never changes with the servings stepper; totals do. */
export function nutritionFor(recipe: Pick<Recipe, 'nutrition' | 'servings'>, servings: number) {
  if (!recipe.nutrition) return null;
  const perServing = recipe.nutrition.perServing;
  const total: Macros = {
    kcal: perServing.kcal * servings,
    proteinG: perServing.proteinG * servings,
    carbsG: perServing.carbsG * servings,
    fatG: perServing.fatG * servings,
    fiberG: perServing.fiberG * servings,
  };
  return { perServing, total };
}

/** Share of calories from each macro, for the stacked bar. */
export function macroSplit(m: Macros) {
  const protein = m.proteinG * 4;
  const carbs = m.carbsG * 4;
  const fat = m.fatG * 9;
  const sum = protein + carbs + fat;
  if (sum <= 0) return { protein: 0, carbs: 0, fat: 0 };
  return { protein: protein / sum, carbs: carbs / sum, fat: fat / sum };
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      proteinG: acc.proteinG + m.proteinG,
      carbsG: acc.carbsG + m.carbsG,
      fatG: acc.fatG + m.fatG,
      fiberG: acc.fiberG + m.fiberG,
    }),
    { ...ZERO_MACROS },
  );
}

/** Rebuilds totals from per-ingredient nutrition (used after editing a recipe by hand). */
export function recomputeNutrition(recipe: Pick<Recipe, 'ingredients' | 'servings' | 'nutrition'>): Recipe['nutrition'] {
  const withNutrition = recipe.ingredients.filter((i) => i.nutrition);
  if (!withNutrition.length) return recipe.nutrition;
  const total = sumMacros(withNutrition.map((i) => i.nutrition!));
  const servings = Math.max(1, recipe.servings);
  return {
    total,
    perServing: {
      kcal: Math.round(total.kcal / servings),
      proteinG: Math.round((total.proteinG / servings) * 10) / 10,
      carbsG: Math.round((total.carbsG / servings) * 10) / 10,
      fatG: Math.round((total.fatG / servings) * 10) / 10,
      fiberG: Math.round((total.fiberG / servings) * 10) / 10,
    },
  };
}
