import type { Ingredient, IngredientCategory, Macros, Recipe, Step } from './types';

/**
 * Recipes that ship with the app so cooking mode works on day one, before any AI or YouTube import.
 * Nutrition is per ingredient for the full quantity (USDA / IFCT values), like AI recipes.
 */

type M = [kcal: number, protein: number, carbs: number, fat: number, fiber: number];

const macros = ([kcal, proteinG, carbsG, fatG, fiberG]: M): Macros => ({ kcal, proteinG, carbsG, fatG, fiberG });

function ing(
  id: string,
  name: string,
  quantity: number | null,
  unit: string,
  category: IngredientCategory,
  nutrition: M,
  extra: Partial<Pick<Ingredient, 'note' | 'substitutes' | 'optional'>> = {},
): Ingredient {
  return {
    id,
    name,
    quantity,
    unit,
    category,
    nutrition: macros(nutrition),
    note: extra.note ?? null,
    substitutes: extra.substitutes ?? [],
    optional: extra.optional ?? false,
  };
}

/** What cooking mode says for each starter step: warm, spoken English, numbers as words. */
const NARRATION: Record<string, string> = {
  'eb-s1': 'First, chop the onion, tomato and chilli nice and fine. Then crack the eggs into a bowl with a pinch of salt and give them a good whisk.',
  'eb-s2': 'Warm the oil in your pan over medium heat, then add the onion and chilli. Stir now and then until they’re soft and just turning golden, about three minutes.',
  'eb-s3': 'Now tip in the tomato with the turmeric, chilli powder and a little salt. Keep stirring until the tomato breaks down and looks thick and jammy.',
  'eb-s4': 'Turn the heat right down and pour in the eggs. Give them a few seconds, then stir slowly, scraping the bottom, until they’re just set but still glossy.',
  'eb-s5': 'Sprinkle over the garam masala and coriander, give it one last stir, and serve it hot with your toast. Enjoy!',
  'dt-s1': 'Put the dal in a bowl of water and rub it gently between your fingers. Drain and repeat three times, until the water runs almost clear.',
  'dt-s2': 'Add the dal to the pressure cooker with six hundred millilitres of water, the turmeric and half the salt. Lock the lid, cook for three whistles, then let the pressure drop on its own.',
  'dt-s3': 'Open the cooker and whisk the dal until it’s creamy. Add a little hot water at a time, until it pours like a thick soup.',
  'dt-s4': 'Now for the tadka. Heat the ghee and add the cumin. Once it sizzles, add the garlic, ginger and chilli, then cook the onion until golden, and the tomato with the chilli powder until soft.',
  'dt-s5': 'Pour that sizzling tadka into the dal, add the rest of the salt and let it simmer for two or three minutes. Finish with coriander and a squeeze of lemon.',
  'cb-s1': 'Toss the chicken with the soy sauce, half the pepper and a pinch of salt. While it sits, slice the onion and capsicum and chop the garlic.',
  'cb-s2': 'Get your pan really hot with the oil, then lay the chicken in a single layer. Leave it alone for two minutes so it browns, then stir until it’s golden and cooked through.',
  'cb-s3': 'Turn the heat down to medium. Add the garlic for half a minute, then the onion and capsicum, and stir-fry until they’re tender but still have a little crunch.',
  'cb-s4': 'Add the rice, break up any clumps, and toss everything until it’s piping hot. Season with the rest of the pepper and a little salt.',
  'cb-s5': 'Squeeze over the lemon, scatter the spring onions, and it’s ready. Pack half away for tomorrow’s lunch.',
  'pn-s1': 'Fill a big pot with water, add a pinch of salt and bring it to a rolling boil.',
  'pn-s2': 'Add the noodles and cook them as the packet says, dropping in the edamame for the last two minutes. Save half a cup of the cooking water before you drain.',
  'pn-s3': 'While the noodles cook, whisk the peanut butter, soy sauce, lime juice, sugar, garlic and chilli flakes with a few spoonfuls of hot water until smooth.',
  'pn-s4': 'Toss the hot noodles and edamame in the sauce, adding a splash of the saved water at a time, until it’s glossy and creamy.',
  'pn-s5': 'Pile everything into bowls and top with cucumber, spring onions and chopped peanuts. Eat it straight away, while it’s warm.',
  'oo-s1': 'In a jar, stir together the oats, chia seeds, milk, yogurt and cinnamon until there are no dry oats left.',
  'oo-s2': 'Pop the lid on and leave the jar in the fridge for at least six hours, or overnight.',
  'oo-s3': 'Give it a stir, loosen it with a splash of milk if it’s too thick, then top with banana, peanut butter and a drizzle of honey.',
};

function step(
  id: string,
  title: string,
  instruction: string,
  extra: Partial<Pick<Step, 'durationSec' | 'tip' | 'doneCue' | 'glossary' | 'narration'>> = {},
): Step {
  return {
    id,
    title,
    instruction,
    durationSec: extra.durationSec ?? null,
    tip: extra.tip ?? null,
    doneCue: extra.doneCue ?? null,
    glossary: extra.glossary ?? [],
    clip: null,
    narration: extra.narration ?? NARRATION[id] ?? null,
  };
}

function totals(ingredients: Ingredient[], servings: number): Recipe['nutrition'] {
  const t = ingredients.reduce(
    (acc, i) => ({
      kcal: acc.kcal + (i.nutrition?.kcal ?? 0),
      proteinG: acc.proteinG + (i.nutrition?.proteinG ?? 0),
      carbsG: acc.carbsG + (i.nutrition?.carbsG ?? 0),
      fatG: acc.fatG + (i.nutrition?.fatG ?? 0),
      fiberG: acc.fiberG + (i.nutrition?.fiberG ?? 0),
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
  );
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const total = { kcal: Math.round(t.kcal), proteinG: r1(t.proteinG), carbsG: r1(t.carbsG), fatG: r1(t.fatG), fiberG: r1(t.fiberG) };
  return {
    total,
    perServing: {
      kcal: Math.round(t.kcal / servings),
      proteinG: r1(t.proteinG / servings),
      carbsG: r1(t.carbsG / servings),
      fatG: r1(t.fatG / servings),
      fiberG: r1(t.fiberG / servings),
    },
  };
}

function recipe(base: Omit<Recipe, 'nutrition' | 'totalMinutes' | 'createdAt' | 'updatedAt' | 'parentId' | 'changes' | 'collections' | 'cookLater' | 'rating' | 'notes' | 'timesCooked' | 'lastCookedAt' | 'source' | 'youtube' | 'starter'>): Recipe {
  const now = new Date().toISOString();
  return {
    ...base,
    totalMinutes: base.prepMinutes + base.cookMinutes,
    nutrition: totals(base.ingredients, base.servings),
    source: 'manual',
    youtube: null,
    createdAt: now,
    updatedAt: now,
    parentId: null,
    changes: [],
    collections: [],
    cookLater: false,
    rating: null,
    notes: '',
    timesCooked: 0,
    lastCookedAt: null,
    starter: true,
  };
}

const GLOSSARY = {
  jammy: { term: 'Jammy', meaning: 'Soft, thick and saucy, with no watery juice left.' },
  whistle: { term: 'Whistle', meaning: 'The loud hiss a pressure cooker makes as it releases steam — recipes count them.' },
  tadka: { term: 'Tadka', meaning: 'Spices sizzled in hot fat and poured over a dish for flavour (also called tempering).' },
  simmer: { term: 'Simmer', meaning: 'Cook just below boiling, with small, lazy bubbles.' },
  sear: { term: 'Sear', meaning: 'Cook over high heat without moving the food so the outside browns.' },
  stirFry: { term: 'Stir-fry', meaning: 'Cook quickly over high heat while stirring all the time.' },
};

export const STARTER_RECIPES: Recipe[] = [
  recipe({
    id: 'starter-egg-bhurji',
    title: '10-Minute Masala Egg Bhurji',
    description: 'Spicy Indian scrambled eggs with toast — 28 g of protein on a plate, ready before your coffee cools.',
    emoji: '🍳',
    cuisine: 'Indian',
    mealTypes: ['breakfast', 'dinner'],
    servings: 1,
    prepMinutes: 4,
    cookMinutes: 7,
    difficulty: 'easy',
    equipment: ['Non-stick pan', 'Spatula', 'Bowl'],
    estCost: null,
    mealPrepFriendly: false,
    storage: null,
    tags: ['high-protein', '15-min', 'eggetarian', 'one-pan'],
    ingredients: [
      ing('eb-1', 'Eggs', 3, '', 'protein', [215, 18.9, 1.1, 14.3, 0], { note: 'large', substitutes: ['200 g crumbled paneer'] }),
      ing('eb-2', 'Onion', 1, '', 'produce', [28, 0.8, 6.5, 0.1, 1.2], { note: 'small, finely chopped' }),
      ing('eb-3', 'Tomato', 1, '', 'produce', [14, 0.7, 3.1, 0.2, 1], { note: 'small, finely chopped' }),
      ing('eb-4', 'Green chilli', 1, '', 'produce', [2, 0.1, 0.5, 0, 0.1], { note: 'chopped', optional: true }),
      ing('eb-5', 'Oil or butter', 2, 'tsp', 'pantry', [80, 0, 0, 9.1, 0]),
      ing('eb-6', 'Turmeric powder', 0.25, 'tsp', 'spices', [2, 0.1, 0.4, 0, 0.1]),
      ing('eb-7', 'Red chilli powder', 0.5, 'tsp', 'spices', [4, 0.2, 0.7, 0.2, 0.5], { substitutes: ['Paprika'] }),
      ing('eb-8', 'Garam masala', 0.25, 'tsp', 'spices', [2, 0, 0.3, 0.1, 0.2]),
      ing('eb-9', 'Salt', null, '', 'spices', [0, 0, 0, 0, 0], { note: 'to taste' }),
      ing('eb-10', 'Coriander leaves', 1, 'tbsp', 'produce', [1, 0.1, 0.1, 0, 0.2], { note: 'chopped', optional: true }),
      ing('eb-11', 'Whole-wheat bread', 2, 'slices', 'bakery', [140, 7, 24, 2, 3.8], { note: 'toasted, to serve', substitutes: ['2 rotis', '1 pav'] }),
    ],
    steps: [
      step('eb-s1', 'Prep everything', 'Finely chop the onion, tomato and chilli. Crack the eggs into a bowl, add a pinch of salt and beat with a fork for 20 seconds.', {
        tip: 'Chop everything before the pan goes on — bhurji cooks fast and waits for no one.',
      }),
      step('eb-s2', 'Soften the onion', 'Heat the oil in a non-stick pan on medium heat. Add the onion and chilli and stir until soft and light golden.', {
        durationSec: 180,
        doneCue: 'The onion edges turn golden and smell sweet.',
      }),
      step('eb-s3', 'Cook the tomato', 'Add the tomato, turmeric, chilli powder and a pinch of salt. Stir until the tomato collapses and turns jammy.', {
        durationSec: 120,
        glossary: [GLOSSARY.jammy],
      }),
      step('eb-s4', 'Scramble gently', 'Turn the heat to low. Pour in the eggs, wait 10 seconds, then stir slowly, scraping the bottom, until just set but still glossy.', {
        durationSec: 90,
        tip: 'Take it off the heat a little early — the eggs keep cooking in the hot pan.',
        doneCue: 'Soft, moist curds with no runny egg left.',
      }),
      step('eb-s5', 'Finish and serve', 'Sprinkle the garam masala and coriander, stir once and serve hot with buttered toast.'),
    ],
  }),

  recipe({
    id: 'starter-dal-tadka',
    title: 'Pressure Cooker Dal Tadka',
    description: 'The weeknight staple every new cook should own: creamy lentils with a sizzling garlic-cumin tadka. Makes lunch for three days.',
    emoji: '🍲',
    cuisine: 'Indian',
    mealTypes: ['lunch', 'dinner'],
    servings: 3,
    prepMinutes: 5,
    cookMinutes: 25,
    difficulty: 'easy',
    equipment: ['Pressure cooker', 'Small pan', 'Whisk or ladle'],
    estCost: null,
    mealPrepFriendly: true,
    storage: 'Keeps 3 days in the fridge or 2 months in the freezer. Reheat with a splash of water, stirring until bubbling.',
    tags: ['vegetarian', 'meal-prep', 'budget', 'comfort'],
    ingredients: [
      ing('dt-1', 'Toor dal (split pigeon peas)', 150, 'g', 'grains', [505, 32.6, 85, 2.3, 13.5], { substitutes: ['Masoor dal (red lentils)'] }),
      ing('dt-2', 'Water', 600, 'ml', 'other', [0, 0, 0, 0, 0]),
      ing('dt-3', 'Turmeric powder', 0.5, 'tsp', 'spices', [4, 0, 0.7, 0, 0.2]),
      ing('dt-4', 'Salt', 1, 'tsp', 'spices', [0, 0, 0, 0, 0], { note: 'or to taste' }),
      ing('dt-5', 'Ghee or oil', 1.5, 'tbsp', 'dairy', [180, 0, 0, 20, 0], { substitutes: ['Any neutral oil (vegan)'] }),
      ing('dt-6', 'Cumin seeds', 1, 'tsp', 'spices', [8, 0.4, 0.9, 0.4, 0.2]),
      ing('dt-7', 'Garlic', 4, 'cloves', 'produce', [18, 0.8, 4, 0.1, 0.3], { note: 'finely chopped' }),
      ing('dt-8', 'Ginger', 1, 'tsp', 'produce', [4, 0.1, 0.9, 0, 0.1], { note: 'grated' }),
      ing('dt-9', 'Onion', 1, '', 'produce', [44, 1.2, 10.3, 0.1, 1.9], { note: 'medium, finely chopped' }),
      ing('dt-10', 'Tomato', 1, '', 'produce', [22, 1.1, 4.7, 0.2, 1.4], { note: 'medium, chopped' }),
      ing('dt-11', 'Green chilli', 1, '', 'produce', [2, 0.1, 0.5, 0, 0.1], { note: 'slit', optional: true }),
      ing('dt-12', 'Kashmiri chilli powder', 1, 'tsp', 'spices', [8, 0.3, 1.4, 0.4, 0.9], { substitutes: ['Paprika'] }),
      ing('dt-13', 'Coriander leaves', 2, 'tbsp', 'produce', [2, 0.1, 0.3, 0, 0.2], { note: 'chopped', optional: true }),
      ing('dt-14', 'Lemon juice', 1, 'tsp', 'produce', [1, 0, 0.3, 0, 0], { optional: true }),
    ],
    steps: [
      step('dt-s1', 'Rinse the dal', 'Rinse the dal in a bowl of water three times, rubbing it between your fingers, until the water runs almost clear.', {
        tip: 'Rinsing removes dust and extra starch, so the dal won’t foam over in the cooker.',
      }),
      step('dt-s2', 'Pressure-cook', 'Put the dal, 600 ml water, turmeric and half the salt in the pressure cooker. Close the lid and cook on medium-high for 3 whistles, then turn off the heat and let the pressure drop on its own.', {
        durationSec: 900,
        glossary: [GLOSSARY.whistle],
        doneCue: 'The dal is completely soft and mashes when pressed with a spoon.',
        tip: 'Never force the lid open — wait until the float valve drops.',
      }),
      step('dt-s3', 'Whisk it smooth', 'Open the cooker and whisk the dal until creamy. Add hot water, a little at a time, until it pours like a thick soup.'),
      step('dt-s4', 'Make the tadka', 'Heat the ghee in a small pan on medium. Add the cumin; when it sizzles, add garlic, ginger and chilli for 30 seconds. Add the onion until golden, then the tomato and chilli powder until soft.', {
        durationSec: 300,
        glossary: [GLOSSARY.tadka],
        tip: 'If the cumin turns black it has burnt and will taste bitter — wipe the pan and start again.',
      }),
      step('dt-s5', 'Simmer and finish', 'Pour the tadka into the dal, add the rest of the salt and simmer for 2 to 3 minutes. Finish with coriander and a squeeze of lemon.', {
        durationSec: 180,
        glossary: [GLOSSARY.simmer],
        doneCue: 'Glossy, flecked with red oil, and it coats the back of a spoon.',
      }),
    ],
  }),

  recipe({
    id: 'starter-chicken-bowl',
    title: 'Garlic Pepper Chicken Rice Bowl',
    description: 'A gym-bag classic: juicy pepper chicken and crunchy veg tossed with rice. 40 g of protein a bowl, and it packs well for tomorrow.',
    emoji: '🍗',
    cuisine: 'Indo-Chinese',
    mealTypes: ['lunch', 'dinner'],
    servings: 2,
    prepMinutes: 8,
    cookMinutes: 12,
    difficulty: 'easy',
    equipment: ['Large pan or wok', 'Spatula', 'Chopping board'],
    estCost: null,
    mealPrepFriendly: true,
    storage: 'Keeps 2 days in the fridge. Reheat until steaming hot all the way through.',
    tags: ['high-protein', 'meal-prep', '20-min', 'one-pan'],
    ingredients: [
      ing('cb-1', 'Chicken breast', 300, 'g', 'protein', [360, 67.5, 0, 7.8, 0], { note: 'bite-size pieces', substitutes: ['Paneer cubes', 'Firm tofu'] }),
      ing('cb-2', 'Cooked rice', 300, 'g', 'grains', [390, 8.1, 84, 0.9, 1.2], { note: 'leftover rice is perfect', substitutes: ['Cooked quinoa'] }),
      ing('cb-3', 'Oil', 1, 'tbsp', 'pantry', [124, 0, 0, 14, 0]),
      ing('cb-4', 'Garlic', 5, 'cloves', 'produce', [22, 1, 5, 0, 0.3], { note: 'finely chopped' }),
      ing('cb-5', 'Black pepper', 1, 'tsp', 'spices', [6, 0, 1.5, 0, 0.6], { note: 'freshly crushed' }),
      ing('cb-6', 'Soy sauce', 1, 'tbsp', 'pantry', [9, 1.3, 0.8, 0, 0]),
      ing('cb-7', 'Capsicum (bell pepper)', 1, '', 'produce', [24, 1, 5.6, 0.2, 2], { note: 'sliced into strips' }),
      ing('cb-8', 'Onion', 1, '', 'produce', [44, 1.2, 10.3, 0.1, 1.9], { note: 'medium, sliced' }),
      ing('cb-9', 'Spring onions', 2, '', 'produce', [10, 0.5, 2.2, 0.1, 0.8], { note: 'sliced', optional: true }),
      ing('cb-10', 'Lemon juice', 1, 'tbsp', 'produce', [4, 0, 1.3, 0, 0]),
      ing('cb-11', 'Salt', null, '', 'spices', [0, 0, 0, 0, 0], { note: 'to taste' }),
    ],
    steps: [
      step('cb-s1', 'Season the chicken', 'Toss the chicken with the soy sauce, half the black pepper and a pinch of salt. Slice the onion and capsicum, and chop the garlic.', {
        tip: 'Pat the chicken dry with a paper towel first so it browns instead of steaming.',
      }),
      step('cb-s2', 'Sear the chicken', 'Heat the oil in a large pan on high. Add the chicken in one layer, leave it untouched for 2 minutes, then stir and cook until golden and cooked through.', {
        durationSec: 360,
        glossary: [GLOSSARY.sear],
        tip: 'Don’t crowd the pan — cook in two batches if needed.',
        doneCue: 'No pink inside the thickest piece and the juices run clear.',
      }),
      step('cb-s3', 'Garlic and veg', 'Turn the heat to medium. Add the garlic for 30 seconds, then the onion and capsicum, and stir-fry until just tender but still crunchy.', {
        durationSec: 180,
        glossary: [GLOSSARY.stirFry],
      }),
      step('cb-s4', 'Toss with rice', 'Add the rice, break up any clumps and toss until everything is piping hot. Season with the rest of the pepper and salt to taste.', {
        durationSec: 180,
      }),
      step('cb-s5', 'Finish', 'Squeeze over the lemon, scatter the spring onions and serve. Pack half for tomorrow’s lunch.'),
    ],
  }),

  recipe({
    id: 'starter-peanut-noodles',
    title: '15-Minute Creamy Peanut Noodles',
    description: 'Silky peanut-lime sauce, springy noodles and edamame for a plant-protein boost. Uses one pot and a bowl.',
    emoji: '🍜',
    cuisine: 'Asian',
    mealTypes: ['lunch', 'dinner'],
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 10,
    difficulty: 'easy',
    equipment: ['Large pot', 'Colander', 'Bowl', 'Whisk or fork'],
    estCost: null,
    mealPrepFriendly: false,
    storage: 'Best fresh. Leftovers keep 1 day in the fridge — loosen with warm water and eat cold or warm.',
    tags: ['vegan', '15-min', 'one-pot', 'high-protein'],
    ingredients: [
      ing('pn-1', 'Dried wheat noodles', 150, 'g', 'grains', [540, 18, 108, 2.3, 4.5], { substitutes: ['Spaghetti', 'Hakka noodles'] }),
      ing('pn-2', 'Frozen edamame', 100, 'g', 'frozen', [121, 11.9, 8.9, 5.2, 5.2], { substitutes: ['Frozen peas'] }),
      ing('pn-3', 'Peanut butter', 3, 'tbsp', 'pantry', [282, 12, 9.6, 24, 2.9], { note: 'smooth or crunchy' }),
      ing('pn-4', 'Soy sauce', 2, 'tbsp', 'pantry', [17, 2.6, 1.6, 0, 0.3]),
      ing('pn-5', 'Lime or lemon juice', 1, 'tbsp', 'produce', [4, 0, 1.3, 0, 0.1]),
      ing('pn-6', 'Sugar or maple syrup', 1, 'tsp', 'pantry', [16, 0, 4.2, 0, 0]),
      ing('pn-7', 'Garlic', 2, 'cloves', 'produce', [9, 0.4, 2, 0, 0.1], { note: 'grated' }),
      ing('pn-8', 'Chilli flakes', 0.5, 'tsp', 'spices', [3, 0.1, 0.5, 0.1, 0.3], { optional: true }),
      ing('pn-9', 'Cucumber', 0.5, '', 'produce', [15, 0.7, 3.6, 0.1, 0.5], { note: 'thinly sliced' }),
      ing('pn-10', 'Spring onions', 2, '', 'produce', [10, 0.5, 2.2, 0.1, 0.8], { note: 'sliced' }),
      ing('pn-11', 'Roasted peanuts', 2, 'tbsp', 'pantry', [105, 4.7, 3, 8.9, 1.5], { note: 'chopped', optional: true }),
    ],
    steps: [
      step('pn-s1', 'Boil the water', 'Bring a large pot of water to the boil with a pinch of salt.', {
        durationSec: 300,
        tip: 'Put a lid on the pot — the water boils much faster.',
      }),
      step('pn-s2', 'Cook noodles and edamame', 'Add the noodles and cook as the packet says, adding the edamame for the last 2 minutes. Save half a cup of the cooking water, then drain.', {
        durationSec: 270,
        doneCue: 'The noodles are tender but still a little springy.',
      }),
      step('pn-s3', 'Whisk the sauce', 'While the noodles cook, whisk the peanut butter, soy sauce, lime juice, sugar, garlic and chilli flakes with 3 to 4 tablespoons of hot water until smooth.', {
        tip: 'The sauce looks split at first — keep whisking and it turns silky.',
      }),
      step('pn-s4', 'Toss', 'Toss the hot noodles and edamame with the sauce, adding splashes of the saved water until glossy and creamy.'),
      step('pn-s5', 'Top and serve', 'Pile into bowls and top with cucumber, spring onions and chopped peanuts. Eat straight away.'),
    ],
  }),

  recipe({
    id: 'starter-overnight-oats',
    title: 'Overnight Protein Oats',
    description: 'Two minutes tonight, breakfast sorted tomorrow. Creamy, banana-sweet and 30 g of protein with no cooking at all.',
    emoji: '🥣',
    cuisine: null,
    mealTypes: ['breakfast'],
    servings: 1,
    prepMinutes: 3,
    cookMinutes: 0,
    difficulty: 'easy',
    equipment: ['Jar or lunch box', 'Spoon'],
    estCost: null,
    mealPrepFriendly: true,
    storage: 'Keeps 3 days in the fridge. Add the banana just before eating.',
    tags: ['no-cook', 'meal-prep', 'high-protein', 'vegetarian'],
    ingredients: [
      ing('oo-1', 'Rolled oats', 50, 'g', 'grains', [195, 8.5, 33.2, 3.5, 5.3]),
      ing('oo-2', 'Milk', 150, 'ml', 'dairy', [75, 5, 7.2, 3, 0], { substitutes: ['Soy milk', 'Oat milk'] }),
      ing('oo-3', 'Greek yogurt', 100, 'g', 'dairy', [73, 10, 3.9, 1.9, 0], { note: 'plain', substitutes: ['Hung curd'] }),
      ing('oo-4', 'Chia seeds', 1, 'tbsp', 'pantry', [49, 1.7, 4.2, 3.1, 3.4], { optional: true }),
      ing('oo-5', 'Peanut butter', 1, 'tbsp', 'pantry', [94, 4, 3.2, 8, 1]),
      ing('oo-6', 'Banana', 1, '', 'produce', [89, 1.1, 22.8, 0.3, 2.6], { note: 'small, sliced' }),
      ing('oo-7', 'Honey', 1, 'tsp', 'pantry', [21, 0, 5.8, 0, 0], { optional: true }),
      ing('oo-8', 'Cinnamon', 1, 'pinch', 'spices', [0, 0, 0, 0, 0], { optional: true }),
    ],
    steps: [
      step('oo-s1', 'Mix the base', 'In a jar, stir the oats, chia seeds, milk, yogurt and cinnamon until no dry oats are left.', {
        tip: 'Make three jars at once on Sunday for grab-and-go breakfasts until Wednesday.',
      }),
      step('oo-s2', 'Chill overnight', 'Close the lid and refrigerate for at least 6 hours, or overnight.', {
        doneCue: 'The oats are soft and the mixture is thick and spoonable.',
      }),
      step('oo-s3', 'Top and eat', 'Stir, loosen with a splash of milk if it’s too thick, then top with sliced banana, peanut butter and a drizzle of honey.'),
    ],
  }),
];
