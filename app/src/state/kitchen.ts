import { create } from 'zustand';
import type { MealSlot, PlanEntry, Recipe, ShoppingItem } from '@/data/types';
import { docstore } from '@/native/docstore';
import { newId } from '@/lib/id';
import { aggregateIngredients, mergeIntoList, type ShoppingSource } from '@/lib/shopping';

/** Meal plan + shopping list: the "kitchen" side of the app. */
interface KitchenState {
  ready: boolean;
  plan: Record<string, PlanEntry>;
  shopping: Record<string, ShoppingItem>;
  hydrate(): Promise<void>;
  addToPlan(entry: Omit<PlanEntry, 'id'>): void;
  removeFromPlan(id: string): void;
  addRecipesToShopping(items: Array<{ recipe: Recipe; servings: number }>): number;
  addManualItem(name: string): void;
  toggleItem(id: string): void;
  removeItem(id: string): void;
  clearChecked(): void;
}

export const useKitchen = create<KitchenState>()((set, get) => ({
  ready: false,
  plan: {},
  shopping: {},

  async hydrate() {
    const [plan, shopping] = await Promise.all([docstore.all<PlanEntry>('plan'), docstore.all<ShoppingItem>('shopping')]);
    set({
      ready: true,
      plan: Object.fromEntries(plan.map((p) => [p.id, p])),
      shopping: Object.fromEntries(shopping.map((s) => [s.id, s])),
    });
  },

  addToPlan(entry) {
    const created: PlanEntry = { ...entry, id: newId() };
    set((s) => ({ plan: { ...s.plan, [created.id]: created } }));
    void docstore.put('plan', created).catch(() => undefined);
  },

  removeFromPlan(id) {
    set((s) => {
      const { [id]: _removed, ...rest } = s.plan;
      return { plan: rest };
    });
    void docstore.remove('plan', id).catch(() => undefined);
  },

  addRecipesToShopping(items) {
    const sources: ShoppingSource[] = items.flatMap(({ recipe, servings }) =>
      recipe.ingredients.map((ingredient) => ({ recipeId: recipe.id, ingredient, factor: servings / Math.max(1, recipe.servings) })),
    );
    const before = Object.values(get().shopping);
    const merged = mergeIntoList(before, aggregateIngredients(sources), newId);
    set({ shopping: Object.fromEntries(merged.map((i) => [i.id, i])) });
    void docstore.putMany('shopping', merged).catch(() => undefined);
    return merged.length - before.length;
  },

  addManualItem(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const item: ShoppingItem = {
      id: newId(),
      name: trimmed,
      quantity: null,
      unit: '',
      category: 'other',
      checked: false,
      recipeIds: [],
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ shopping: { ...s.shopping, [item.id]: item } }));
    void docstore.put('shopping', item).catch(() => undefined);
  },

  toggleItem(id) {
    const item = get().shopping[id];
    if (!item) return;
    const next = { ...item, checked: !item.checked };
    set((s) => ({ shopping: { ...s.shopping, [id]: next } }));
    void docstore.put('shopping', next).catch(() => undefined);
  },

  removeItem(id) {
    set((s) => {
      const { [id]: _removed, ...rest } = s.shopping;
      return { shopping: rest };
    });
    void docstore.remove('shopping', id).catch(() => undefined);
  },

  clearChecked() {
    const checked = Object.values(get().shopping).filter((i) => i.checked).map((i) => i.id);
    set((s) => ({ shopping: Object.fromEntries(Object.entries(s.shopping).filter(([id]) => !checked.includes(id))) }));
    void docstore.removeMany('shopping', checked).catch(() => undefined);
  },
}));

export const MEAL_SLOTS: Array<{ slot: MealSlot; label: string; emoji: string }> = [
  { slot: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { slot: 'lunch', label: 'Lunch', emoji: '☀️' },
  { slot: 'dinner', label: 'Dinner', emoji: '🌙' },
  { slot: 'snack', label: 'Snack', emoji: '🍎' },
];
