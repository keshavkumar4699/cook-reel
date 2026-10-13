import { plural } from '../../catalog';

/** recipe screen strings. */
export default {
  // Recipe detail screen (app/recipe/[id])
  notFound: {
    title: 'Recipe not found',
    body: 'It may have been deleted.',
    /** Button that returns to the library. */
    action: 'Back to library',
  },
  /** A YouTube Short (short vertical video). Shown after the recipe's source and as a badge on its cover. */
  youtubeShort: 'Short',
  /** {title} is the original recipe's title, shown as a link. */
  variationOf: 'Variation of {title}',
  stats: {
    /** Caption in a narrow stat tile (one of three in a row). */
    totalTime: 'Total time',
    /** Caption under the calories-per-serving number in a narrow stat tile. */
    kcalPerServing: 'kcal / serving',
    /** Caption under the grams of protein per serving in a narrow stat tile. */
    protein: 'Protein',
  },
  badges: {
    /** Badge: the dish keeps well for meal prep. */
    mealPrep: 'Meal prep',
    /** Badge: estimated cost per serving; {price} is already formatted, e.g. "₹45". */
    costPerServing: '{price} / serving',
  },
  changes: {
    /** Heading over the list of what a variation changed compared with its original. */
    title: 'What changed',
  },
  servings: {
    title: 'Servings',
    /** Under "Servings": quantities are shown for the recipe's own number of servings. */
    asWritten: 'As written',
    /** Under "Servings": {factor} is the scale factor, e.g. "1.5". */
    scaled: 'Quantities scaled ×{factor}',
  },
  sections: {
    /** Heading over the equipment the recipe needs. */
    equipment: 'You’ll need',
    ingredients: 'Ingredients',
    /** Small button next to the Ingredients heading: adds them to the shopping list. */
    addToList: 'Add to list',
    ingredientsHint: 'Tap to tick off what you already have.',
    /** Heading over the recipe's steps. */
    method: 'Method',
    storage: 'Storing leftovers',
  },
  experiment: {
    /** Section heading. Experiment is the feature where Chef rewrites a recipe (vegan, cheaper…). */
    title: 'Experiment',
    variations: plural({ one: '{count} variation', other: '{count} variations' }),
    /** Accessibility label of the card that opens Experiment. */
    create: 'Create a variation',
    headline: 'Make it your own',
    body: 'Vegan, more protein, air fryer, cheaper… Chef rewrites it.',
    /** Fallback subtitle of a variation in the list. */
    variation: 'Variation',
  },
  notes: {
    title: 'Your notes',
    placeholder: 'Less chilli next time, add a squeeze of lime…',
  },
  rating: {
    title: 'How was it?',
    /** Accessibility label of each rating star; {count} is 1 to 5. */
    rate: plural({ one: 'Rate {count} out of 5', other: 'Rate {count} out of 5' }),
    timesCooked: plural({ one: 'Cooked {count} time', other: 'Cooked {count} times' }),
  },
  cookLater: {
    /** Accessibility label of the bookmark button on the recipe screen. */
    save: 'Save to cook later',
    /** Accessibility label of the bookmark button on a recipe card. Short. */
    add: 'Cook later',
    /** Accessibility label of the bookmark button when the recipe is already saved. */
    remove: 'Remove from cook later',
    /** Toast. "Cook later" is the name of the saved-recipes list. */
    saved: 'Saved to Cook later',
    /** Toast. "Cook later" is the name of the saved-recipes list. */
    removed: 'Removed from Cook later',
  },
  menu: {
    /** Accessibility label of the "…" button that opens the recipe menu. */
    more: 'More',
    edit: 'Edit recipe',
    addToCollection: 'Add to collection',
    addToPlan: 'Add to meal plan',
    addToShopping: 'Add ingredients to shopping list',
    share: 'Share recipe',
    delete: 'Delete recipe',
  },
  deleteConfirm: {
    title: 'Delete this recipe?',
    message: 'It will be removed from this phone.',
  },
  toasts: {
    addedToShopping: plural({ one: '{count} item added to your shopping list', other: '{count} items added to your shopping list' }),
    shoppingUpdated: 'Shopping list updated',
    /** Toast button that opens the shopping list. One short word. */
    view: 'View',
    deleted: 'Recipe deleted',
  },
  cta: {
    /** Accessibility label of the flask button next to "Start cooking"; opens Experiment. */
    experiment: 'Experiment',
    startCooking: 'Start cooking',
    /** Small note on the "Start cooking" button: steps play as narrated clips of a YouTube Short. */
    narratedClips: 'Narrated clips',
    /** Small note on the "Start cooking" button: steps play as clips of the YouTube video. */
    videoClips: 'Video clips',
    /** Small note on the "Start cooking" button: the steps are read aloud. */
    voiceGuided: 'Voice guided',
  },

  // Recipe cards, rows and previews
  facts: {
    /** Calories per serving, e.g. "480 kcal". */
    kcal: '{n} kcal',
    /** Protein per serving, e.g. "32 g protein". Shown as a small pill. */
    protein: '{n} g protein',
  },

  // Nutrition card
  nutrition: {
    /** Small heading above the calories number. */
    title: 'Nutrition',
    /** Unit shown after the big calories number. */
    kcalUnit: 'kcal',
    /** Toggle option: values for one serving. Keep short: two options share a narrow control. */
    serving: 'Serving',
    /** Toggle option: values for the whole dish of {count} servings. Keep short. */
    allServings: plural({ one: 'All {count}', other: 'All {count}' }),
    /** Accessibility label of the bar split into protein, carbs and fat. */
    barLabel: 'Calories by macronutrient',
    /** Macronutrient label in a narrow column (one of four). */
    protein: 'Protein',
    /** Macronutrient label (carbohydrates) in a narrow column (one of four). */
    carbs: 'Carbs',
    /** Macronutrient label in a narrow column (one of four). */
    fat: 'Fat',
    /** Dietary fibre, in a narrow column (one of four). */
    fibre: 'Fibre',
    disclaimer: 'Estimated from standard food data. Values vary with brands and portion sizes.',
  },

  // Ingredient checklist
  ingredients: {
    /** One ingredient line: {quantity} is the amount ("2 cups"), {name} the ingredient. Reorder if your language puts the amount after the name. */
    line: '{quantity} {name}',
    /** Small tag after the name of an optional ingredient. */
    optional: 'optional',
    /** Shown under an ingredient that has no amount. */
    toTaste: 'to taste',
    /** {items} lists the alternatives. */
    swapWith: 'Swap with: {items}',
    /** Accessibility label of the swap button next to an ingredient. */
    substitutesFor: 'Substitutes for {name}',
  },

  // Step list
  steps: {
    /** Bold label before the cue that tells the cook a step is finished. The cue follows after a space, exactly as written, e.g. "Done when" + "Onions are soft and golden". */
    doneWhen: 'Done when',
    /** Time range of a step's video clip, e.g. "0:15–0:42". */
    clipRange: '{start}–{end}',
    /** A cooking term before its explanation, e.g. "Tadka:". Shown in bold. */
    glossaryTerm: '{term}:',
  },
} as const;
