import { plural } from '../../catalog';

/** Library screen and recipe collections. */
export default {
  /** Under the screen title. */
  subtitle: plural({ one: '{count} recipe saved on this phone', other: '{count} recipes saved on this phone' }),
  /** Accessibility label of the + button. */
  newRecipe: 'New recipe',
  search: {
    placeholder: 'Search recipes, ingredients, tags',
    /** Accessibility label of the × button in the search field. */
    clear: 'Clear search',
  },
  /** Filter chips; keep them short. */
  filters: {
    /** Shows every recipe. */
    all: 'All',
    /** Recipes bookmarked to cook later. */
    cookLater: 'Cook later',
    /** Recipes the cook wrote themselves. */
    mine: 'Mine',
    /** Twists the cook made of another recipe. */
    variations: 'Variations',
    /** Quick recipes; {duration} is a formatted time such as "20 min". */
    quick: '≤ {duration}',
    protein: 'High protein',
    /** Light recipes; {kcal} is a number of kilocalories per serving. */
    light: 'Under {kcal} kcal',
    mealPrep: 'Meal prep',
  },
  collections: {
    /** Chip that opens the new-collection sheet. */
    new: 'New collection',
    /** Button shown while a collection is selected. */
    delete: 'Delete collection',
  },
  /** Sheet for creating a collection. */
  newCollection: {
    title: 'New collection',
    /** The quoted words are example collection names. */
    subtitle: 'Group recipes your way — “Weekend”, “Kids”, “Festive”…',
    namePlaceholder: 'Collection name',
    create: 'Create collection',
    /** "•••" is the recipe screen's menu button. */
    hint: 'Add recipes to it from any recipe’s ••• menu.',
  },
  /** Shown when no recipe matches the search, filter or collection. */
  noResults: {
    title: 'Nothing matches',
    body: 'Try another search or filter.',
  },
  /** Shown while the library is empty. */
  emptyLibrary: {
    title: 'Your cookbook starts here',
    body: 'Save recipes from YouTube, create them with Chef, or write your own.',
    /** Button that opens the recipe editor. */
    action: 'Add a recipe',
  },
  /** Sheet for putting one recipe into collections. */
  collectionSheet: {
    title: 'Collections',
    subtitle: 'Tap to add or remove',
    empty: 'No collections yet — create your first one.',
    /** Placeholder of the field for a new collection's name. */
    newPlaceholder: 'New collection',
  },
} as const;
