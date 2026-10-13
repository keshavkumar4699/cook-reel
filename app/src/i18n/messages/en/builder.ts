import { plural } from '../../catalog';

/** Chef, the AI recipe builder chat, and its "Cook from my fridge" mode. */
export default {
  /** Facts under the screen title, joined as "Free questions · 1 credit per recipe". */
  subtitle: {
    /** Asking Chef questions costs nothing; only a finished recipe uses credits. */
    freeQuestions: 'Free questions',
    creditsPerRecipe: plural({ one: '{count} credit per recipe', other: '{count} credits per recipe' }),
  },
  /** Empty chat: describe what you want. */
  describe: {
    /** Contains a line break (\n) for a balanced two-line title; move or drop it as your language needs. */
    heading: 'What are you in the\nmood for?',
    intro: 'Describe a dish, a craving or a situation. I’ll ask a couple of questions, then write a recipe for your kitchen.',
  },
  /** Starter ideas; tapping one sends it to Chef as the cook's first message. */
  ideas: {
    quickProtein: 'Something high-protein for dinner in 20 minutes',
    cosyDal: 'A cosy dal for a rainy evening',
    mealPrep: 'Cheap, filling lunches I can meal prep for the week',
    dateNight: 'Something impressive but easy for a date night',
  },
  /** Fridge mode: pick what you have and Chef suggests a recipe. */
  fridge: {
    /** Screen title in fridge mode. */
    screenTitle: 'Cook from my fridge',
    heading: 'What’s in your kitchen?',
    intro: 'Tap what you have. Salt, oil and basic spices are assumed.',
    empty: 'Nothing yet — add items below',
    addPlaceholder: 'Add something else…',
    /** Disabled button until enough ingredients are picked; {count} is the minimum. */
    pickAtLeast: plural({ one: 'Pick at least {count} thing', other: 'Pick at least {count} things' }),
    findRecipe: plural({ one: 'Find a recipe with {count} item', other: 'Find a recipe with {count} items' }),
    /** Sent to Chef as the cook's message; {list} is the picked ingredients. */
    prompt: 'Here’s what I have: {list}. What can I make?',
    /** Short headings above the ingredient groups. */
    groups: {
      protein: 'Protein',
      veg: 'Veg',
      carbs: 'Carbs',
      dairy: 'Dairy & more',
    },
    /** Ingredient chips; the picked ones are sent to Chef. */
    items: {
      eggs: 'Eggs',
      paneer: 'Paneer',
      chicken: 'Chicken',
      tofu: 'Tofu',
      chickpeas: 'Chickpeas',
      dal: 'Dal',
      tuna: 'Tuna',
      soyaChunks: 'Soya chunks',
      onion: 'Onion',
      tomato: 'Tomato',
      potato: 'Potato',
      spinach: 'Spinach',
      capsicum: 'Capsicum',
      carrot: 'Carrot',
      peas: 'Peas',
      mushroom: 'Mushroom',
      rice: 'Rice',
      bread: 'Bread',
      pasta: 'Pasta',
      oats: 'Oats',
      noodles: 'Noodles',
      roti: 'Roti / tortilla',
      poha: 'Poha',
      milk: 'Milk',
      curd: 'Curd / yogurt',
      cheese: 'Cheese',
      butter: 'Butter',
      peanutButter: 'Peanut butter',
      coconutMilk: 'Coconut milk',
    },
  },
  /** Status lines shown one after another while Chef works (a recipe can take ~30 seconds). */
  thinking: {
    start: 'Chef is thinking…',
    balancing: 'Balancing flavours and macros…',
    checking: 'Checking it fits your kitchen…',
    writing: 'Writing it up step by step…',
    almostReady: 'Almost ready…',
  },
  /** Buttons under a recipe Chef wrote. */
  recipe: {
    save: 'Save to library',
    saved: 'Saved to your library',
    /** Button and toast action that opens the saved recipe. */
    open: 'Open',
    cookNow: 'Cook now',
  },
  /** Message box at the bottom. */
  composer: {
    /** Hint before the chat starts: an example of what to type. */
    startPlaceholder: 'e.g. paneer, spicy, 20 minutes',
    replyPlaceholder: 'Reply to Chef…',
    /** Screen-reader label of the message box. */
    label: 'Message Chef',
    /** Screen-reader label of the send button. */
    send: 'Send',
  },
} as const;
