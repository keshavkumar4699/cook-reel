import { plural } from '../../catalog';

/** First-run setup and the cooking profile (both use the same fields). */
export default {
  steps: {
    /** Keep the line break if it helps: the title is large. */
    personas: { title: 'What brings you\nto CookReel?', subtitle: 'Pick all that fit — we’ll shape your home screen around them.' },
    diet: { title: 'How do you eat?', subtitle: 'Chef will never suggest anything you can’t have.' },
    kitchen: { title: 'Your kitchen', subtitle: 'Recipes will only use what you actually own.' },
    goals: { title: 'You and your goals', subtitle: 'For portions, macros and grocery budgets.' },
  },
  /** Greeting above the first question; {name} is the cook's first name. */
  hello: 'Hi {name} 👋',
  /** Accessibility label of the "Skip" button in the top bar. */
  skipSetup: 'Skip setup',
  /** Last step's button. */
  start: 'Start cooking',

  /** Why the cook is here. Titles and bodies sit on full-width cards. */
  personas: {
    saver: { title: 'Save YouTube recipes', body: 'Keep what I find and cook it later' },
    quick: { title: 'Quick meals on the go', body: 'Busy with work, study or the gym' },
    fridge: { title: 'Cook with what I have', body: 'Use up the fridge, waste less' },
    creator: { title: 'Create and experiment', body: 'Invent new dishes and twists' },
    fitness: { title: 'Eat for my goals', body: 'Protein, calories and macros' },
    learner: { title: 'Learn to cook', body: 'Step by step, from the basics' },
  },
  /** Group headings (small caps style). */
  groups: {
    diet: 'Diet',
    allergies: 'Allergies',
    spice: 'Spice level',
    equipment: 'I have…',
    time: 'Time I usually have to cook',
    skill: 'Cooking skill',
    household: 'I usually cook for',
    goal: 'Goal',
    protein: 'Daily protein target',
    budget: 'Grocery budget',
  },
  /** Short chips. */
  diets: {
    vegetarian: 'Vegetarian',
    /** Vegetarian who also eats eggs. */
    eggetarian: 'Eggetarian',
    /** Eats meat and fish. Short. */
    'non-vegetarian': 'Non-veg',
    vegan: 'Vegan',
    pescatarian: 'Pescatarian',
  },
  allergies: {
    peanuts: 'Peanuts',
    treeNuts: 'Tree nuts',
    dairy: 'Dairy',
    gluten: 'Gluten',
    eggs: 'Eggs',
    soy: 'Soy',
    shellfish: 'Shellfish',
    sesame: 'Sesame',
  },
  spice: {
    mild: 'Mild',
    medium: 'Medium',
    hot: 'Hot',
  },
  /** Kitchen appliances, as short chips. */
  equipment: {
    gasStove: 'Gas stove',
    induction: 'Induction hob',
    microwave: 'Microwave',
    oven: 'Oven',
    airFryer: 'Air fryer',
    pressureCooker: 'Pressure cooker',
    riceCooker: 'Rice cooker',
    kettle: 'Electric kettle',
    blender: 'Blender',
    toaster: 'Toaster',
  },
  /** Cooking-time chips; {n} is minutes. */
  time: {
    minutes: '{n} min',
    /** The longest option: this many minutes or more. */
    orMore: '{n}+ min',
  },
  skills: {
    new: { title: 'New to cooking', body: 'Explain everything, please' },
    /** Name everyday dishes a beginner in your language would know. */
    basic: { title: 'I know the basics', body: 'Dal, eggs, pasta — that level' },
    confident: { title: 'Confident cook', body: 'Skip the hand-holding' },
  },
  household: {
    justMe: 'Just me',
    people: plural({ one: '{count} person', other: '{count} people' }),
  },
  goals: {
    build_muscle: 'Build muscle',
    lose_fat: 'Lose fat',
    maintain: 'Maintain',
    eat_healthy: 'Eat healthier',
    none: 'No goal',
  },
  /** Protein chip, e.g. "120 g". */
  proteinGrams: '{n} g',
  budgets: {
    tight: 'Tight',
    moderate: 'Moderate',
    flexible: 'Flexible',
  },

  // Cooking profile screen (Me → Cooking profile)
  profile: {
    title: 'Cooking profile',
    intro: 'Chef uses this for every recipe: what you eat, what you own and what you’re aiming for.',
    sections: {
      personas: 'What brings you here',
      diet: 'How you eat',
      kitchen: 'Your kitchen',
      goals: 'You and your goals',
    },
    save: 'Save profile',
    saved: 'Cooking profile saved',
  },
} as const;
