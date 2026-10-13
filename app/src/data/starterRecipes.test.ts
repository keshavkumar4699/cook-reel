import { STARTER_RECIPES } from './starterRecipes';

describe('starter recipes', () => {
  it.each(STARTER_RECIPES.map((r) => [r.title, r] as const))('%s has consistent nutrition and structure', (_title, recipe) => {
    const n = recipe.nutrition!.total;
    const atwater = 4 * n.proteinG + 4 * n.carbsG + 9 * n.fatG;
    expect(Math.abs(n.kcal - atwater) / atwater).toBeLessThan(0.1);
    expect(recipe.nutrition!.perServing.kcal).toBe(Math.round(n.kcal / recipe.servings));
    expect(recipe.steps.length).toBeGreaterThanOrEqual(3);
    expect(new Set(recipe.ingredients.map((i) => i.id)).size).toBe(recipe.ingredients.length);
    expect(recipe.totalMinutes).toBe(recipe.prepMinutes + recipe.cookMinutes);
  });

  it('uses unique ids', () => {
    expect(new Set(STARTER_RECIPES.map((r) => r.id)).size).toBe(STARTER_RECIPES.length);
  });
});
