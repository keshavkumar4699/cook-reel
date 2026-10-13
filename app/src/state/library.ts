import { create } from 'zustand';
import { STARTER_RECIPES } from '@/data/starterRecipes';
import type { Collection, Recipe } from '@/data/types';
import { docstore } from '@/native/docstore';
import { kv } from '@/native/kv';
import { newId } from '@/lib/id';

const SEEDED_KEY = 'cookreel.seeded.v1';

interface LibraryState {
  ready: boolean;
  recipes: Record<string, Recipe>;
  collections: Record<string, Collection>;
  hydrate(): Promise<void>;
  save(recipe: Recipe): Recipe;
  update(id: string, patch: Partial<Recipe> | ((recipe: Recipe) => Partial<Recipe>)): void;
  remove(id: string): void;
  toggleCookLater(id: string): boolean;
  markCooked(id: string): void;
  addCollection(name: string, emoji: string): Collection;
  removeCollection(id: string): void;
  toggleInCollection(recipeId: string, collectionId: string): void;
}

const persistRecipe = (recipe: Recipe) => void docstore.put('recipes', recipe).catch(() => undefined);

export const useLibrary = create<LibraryState>()((set, get) => ({
  ready: false,
  recipes: {},
  collections: {},

  async hydrate() {
    const [recipes, collections, seeded] = await Promise.all([
      docstore.all<Recipe>('recipes'),
      docstore.all<Collection>('collections'),
      kv.getItem(SEEDED_KEY),
    ]);
    let list = recipes;
    if (!seeded) {
      // First launch: a few starter recipes so cooking mode works before any AI or import.
      const now = Date.now();
      const starters = STARTER_RECIPES.map((r, i) => ({ ...r, createdAt: new Date(now - i * 60_000).toISOString() }));
      await docstore.putMany('recipes', starters);
      await kv.setItem(SEEDED_KEY, '1');
      list = [...recipes, ...starters];
    }
    set({
      ready: true,
      recipes: Object.fromEntries(list.map((r) => [r.id, r])),
      collections: Object.fromEntries(collections.map((c) => [c.id, c])),
    });
  },

  save(recipe) {
    const saved = { ...recipe, updatedAt: new Date().toISOString() };
    set((s) => ({ recipes: { ...s.recipes, [saved.id]: saved } }));
    persistRecipe(saved);
    return saved;
  },

  update(id, patch) {
    const current = get().recipes[id];
    if (!current) return;
    const changes = typeof patch === 'function' ? patch(current) : patch;
    const next = { ...current, ...changes, updatedAt: new Date().toISOString() };
    set((s) => ({ recipes: { ...s.recipes, [id]: next } }));
    persistRecipe(next);
  },

  remove(id) {
    set((s) => {
      const { [id]: _removed, ...rest } = s.recipes;
      return { recipes: rest };
    });
    void docstore.remove('recipes', id).catch(() => undefined);
  },

  toggleCookLater(id) {
    const next = !get().recipes[id]?.cookLater;
    get().update(id, { cookLater: next });
    return next;
  },

  markCooked(id) {
    get().update(id, (r) => ({ timesCooked: r.timesCooked + 1, lastCookedAt: new Date().toISOString(), cookLater: false }));
  },

  addCollection(name, emoji) {
    const collection: Collection = { id: newId(), name: name.trim(), emoji, createdAt: new Date().toISOString() };
    set((s) => ({ collections: { ...s.collections, [collection.id]: collection } }));
    void docstore.put('collections', collection).catch(() => undefined);
    return collection;
  },

  removeCollection(id) {
    set((s) => {
      const { [id]: _removed, ...rest } = s.collections;
      return { collections: rest };
    });
    void docstore.remove('collections', id).catch(() => undefined);
    for (const recipe of Object.values(get().recipes)) {
      if (recipe.collections.includes(id)) get().update(recipe.id, { collections: recipe.collections.filter((c) => c !== id) });
    }
  },

  toggleInCollection(recipeId, collectionId) {
    get().update(recipeId, (r) => ({
      collections: r.collections.includes(collectionId)
        ? r.collections.filter((c) => c !== collectionId)
        : [...r.collections, collectionId],
    }));
  },
}));

export const useRecipe = (id: string | undefined) => useLibrary((s) => (id ? s.recipes[id] : undefined));
