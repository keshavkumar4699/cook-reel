/**
 * The text of one starter recipe in another language, keyed by the ids used in starterRecipes.ts.
 * Only words are translated: quantities, units, timings and nutrition always come from the
 * original recipe.
 */
export interface StarterText {
  title: string;
  description: string;
  cuisine: string | null;
  equipment: string[];
  storage: string | null;
  tags: string[];
  /** Every ingredient id of the recipe. `note` and `substitutes` only where the original has them. */
  ingredients: Record<string, { name: string; note?: string; substitutes?: string[] }>;
  /** Every step id of the recipe. Fields other than title/instruction/narration only where the original has them. */
  steps: Record<
    string,
    {
      title: string;
      instruction: string;
      tip?: string;
      doneCue?: string;
      glossary?: { term: string; meaning: string }[];
      /** Spoken in cooking mode: warm, natural, numbers and units written as words. */
      narration: string;
    }
  >;
}

/** Starter recipe id → its text in one language. */
export type StarterTranslations = Record<string, StarterText>;
