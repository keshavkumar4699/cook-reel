import { plural } from '../../catalog';

/** Plan tab (meal plan and shopping list) and the add-to-plan sheet. */
export default {
  header: {
    /** Subtitle on the meal-plan tab. */
    planSubtitle: 'Your week of meals',
    /** Subtitle on the shopping tab while items are left to buy. */
    toBuy: plural({ one: '{count} item to buy', other: '{count} items to buy' }),
    /** Subtitle on the shopping tab once everything is ticked. */
    allSet: 'All set for now',
    /** Segmented control between the two tabs; keep it short. */
    mealPlanTab: 'Meal plan',
    /** Segmented control between the two tabs; keep it short. */
    shoppingTab: 'Shopping',
    /** The shopping tab with the number of items left to buy. */
    shoppingTabCount: 'Shopping · {count}',
  },
  week: {
    /** Accessibility label of the ‹ button. */
    previous: 'Previous week',
    /** Accessibility label of the › button. */
    next: 'Next week',
  },
  /** The day's totals; each follows an eaten amount shown in a larger font. */
  summary: {
    /** "1250 / 2000 kcal"; {target} is the daily calorie goal. */
    kcalGoal: '/ {target} kcal',
    /** "56 g / 80 g protein"; {target} is the daily protein goal, e.g. "80 g". */
    proteinGoal: '/ {target} protein',
  },
  /** Dashed button under each meal of the day. */
  addToSlot: {
    breakfast: 'Add breakfast',
    lunch: 'Add lunch',
    dinner: 'Add dinner',
    snack: 'Add snack',
  },
  /** Accessibility label of the × button on a planned recipe. */
  removeFromPlan: 'Remove from plan',
  shopWeek: {
    button: 'Shop for this week',
    /** Toast when the week has no meals yet. */
    empty: 'Plan a few meals first, then shop for them in one tap.',
    /** Toast after adding the week's ingredients to the shopping list. */
    added: plural({ one: '{count} new item added for this week', other: '{count} new items added for this week' }),
  },
  /** Sheet for choosing a recipe for a meal. */
  picker: {
    title: 'Pick a recipe',
    searchPlaceholder: 'Search your library',
    /** Under a recipe saved to cook later. */
    cookLater: 'Cook later',
  },
  shopping: {
    addPlaceholder: 'Add an item…',
    /** Ticked items out of all items: "2 of 10 items". */
    progress: plural({ one: '{done} of {count} item', other: '{done} of {count} items' }),
    /** Button that removes the ticked items. */
    clearTicked: 'Clear ticked',
    /** Accessibility label of the × button on an item; {name} is the item. */
    removeItem: 'Remove {name}',
    emptyTitle: 'Your list is empty',
    emptyBody: 'Add ingredients from any recipe, or plan your week and shop for it in one tap.',
  },
  /** Sheet for planning a recipe from the recipe screen. */
  addSheet: {
    title: 'Add to meal plan',
    servings: 'Servings',
    add: 'Add to plan',
    /** Toast; {slot} is a meal such as "Dinner". */
    plannedToday: 'Planned for today · {slot}',
    /** Toast; {day} is a short weekday such as "Tue", {slot} a meal such as "Dinner". */
    plannedOn: 'Planned for {day} · {slot}',
  },
} as const;
