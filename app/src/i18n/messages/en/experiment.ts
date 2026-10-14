/** Experiment screen strings: Chef rewrites a recipe with a "twist" (vegan, cheaper, air fryer…). */
export default {
  /** Screen title. Experiment is the feature where Chef rewrites a recipe your way. */
  title: 'Experiment',
  subtitle: 'Chef rewrites the recipe your way',
  notFound: {
    title: 'Recipe not found',
    body: 'Pick a recipe from your library to experiment with.',
  },
  /** Caption above the recipe being rewritten. */
  startingFrom: 'Starting from',
  pickTitle: 'Pick a twist',
  pickHint: 'Choose up to three, or describe your own.',
  /** Preset twists. Each is also sent to Chef as the instruction, so phrase them as requests. Keep them short: two share a row. */
  twists: {
    vegan: 'Make it vegan',
    protein: 'More protein',
    lighter: 'Fewer calories',
    spicier: 'Spicier',
    budget: 'Budget version',
    quick: 'Ready in 15 min',
    onePot: 'One pot only',
    airFryer: 'Air fryer version',
    mealPrep: 'Meal prep for 4 days',
    kids: 'Kid-friendly',
  },
  customPlaceholder: 'Or describe it, e.g. no onion or garlic',
  create: 'Create variation',
  /** Rotating status lines while Chef works. */
  working: {
    ingredients: 'Rethinking the ingredients…',
    timings: 'Adjusting heat and timings…',
    macros: 'Re-balancing the macros…',
    plating: 'Plating it up…',
  },
  changes: 'What changed',
  /** Heading over the before/after nutrition comparison. */
  perServingCompare: 'Per serving · before and after',
  macros: {
    /** Narrow column labels (one of four). */
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    /** The value didn't change. Very short. */
    same: 'same',
    /** A change in grams, e.g. "+12 g" / "−4 g"; {n} already has its sign. */
    grams: '{n} g',
  },
  save: 'Save as new version',
  again: 'Try another twist',
  saved: 'Variation saved',
} as const;
