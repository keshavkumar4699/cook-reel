import { plural } from '../../catalog';

/** edit screen strings. */
export default {
  /** Screen title when editing a recipe that already exists. */
  titleEdit: 'Edit recipe',
  /** Screen title when writing a new recipe. */
  titleNew: 'New recipe',
  fields: {
    name: 'Recipe name',
    /** Example recipe name. */
    namePlaceholder: 'Mum’s rajma chawal',
    description: 'Description',
    descriptionPlaceholder: 'What makes it special?',
    servings: 'Servings',
    /** Field label: preparation time in minutes. Short: the field is narrow. */
    prep: 'Prep (min)',
    /** Field label: cooking time in minutes. Short: the field is narrow. */
    cook: 'Cook (min)',
    difficulty: 'Difficulty',
    tags: 'Tags',
    /** Example tags. Keep them separated by "," (a plain comma): the field splits tags on it. */
    tagsPlaceholder: 'quick, high-protein, comfort',
  },
  ingredients: {
    title: 'Ingredients',
    /** Placeholder of the amount field. Very short: the field is narrow. */
    quantity: 'Qty',
    /** Placeholder of the unit field. Very short: the field is narrow. */
    unit: 'Unit',
    /** Placeholder of the ingredient-name field. */
    name: 'Ingredient',
    /** Accessibility label of the × button on an ingredient row. */
    remove: 'Remove ingredient',
    add: 'Add ingredient',
  },
  steps: {
    title: 'Steps',
    placeholder: 'What to do in this step',
    /** Placeholder of a step's timer field, in minutes. Short: the field is narrow. */
    timer: 'Timer (min)',
    /** Note on a step that came from a video: it still plays its clip. */
    keepsClip: 'Keeps its video clip',
    /** Accessibility label of the bin button on a step. */
    remove: 'Remove step',
    add: 'Add step',
  },
  /** Title saved into the recipe for a new step; {n} is the step number. */
  defaultStepTitle: 'Step {n}',
  nutrition: {
    title: 'Nutrition per serving',
    hint: 'Optional — fill in what you know.',
    /** Field label: calories per serving. */
    kcal: 'kcal',
    /** Field label: grams of protein per serving. */
    protein: 'Protein g',
    /** Field label: grams of carbohydrates per serving. */
    carbs: 'Carbs g',
    /** Field label: grams of fat per serving. */
    fat: 'Fat g',
  },
  errors: {
    noTitle: 'Give your recipe a name.',
    noIngredients: 'Add at least one ingredient.',
    noSteps: 'Add at least one step.',
  },
  /** Button at the bottom when editing a recipe. */
  saveChanges: 'Save changes',
  /** Button at the bottom when writing a new recipe. */
  saveRecipe: 'Save recipe',
  toasts: {
    updated: 'Recipe updated',
    saved: 'Recipe saved to your library',
  },
  // Paste-a-list sheet
  paste: {
    /** Small button next to the Ingredients heading: opens a sheet to paste a whole ingredient list. */
    open: 'Paste a list',
    title: 'Paste ingredients',
    /** Use ingredient examples written the way cooks write them in your language. */
    subtitle: 'One per line — “2 cups rice”, “½ tsp salt”, “200g paneer, cubed”',
    /** Example list in the empty text box, one ingredient per line. */
    placeholder: '2 cups basmati rice\n1 tbsp ghee\n½ tsp turmeric',
    /** Button: adds the pasted ingredients to the recipe. */
    add: 'Add these',
    added: plural({ one: '{count} ingredient added', other: '{count} ingredients added' }),
  },
} as const;
