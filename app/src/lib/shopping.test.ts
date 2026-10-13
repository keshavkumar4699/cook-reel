import type { ShoppingItem } from '@/data/types';
import { aggregateIngredients, mergeIntoList, normalizeName } from './shopping';

const ing = (name: string, quantity: number | null, unit: string, extra: Partial<{ optional: boolean }> = {}) => ({
  name,
  quantity,
  unit,
  category: 'produce' as const,
  optional: extra.optional ?? false,
});

describe('aggregateIngredients', () => {
  it('sums the same item across recipes, converting kg to g and scaling servings', () => {
    const items = aggregateIngredients([
      { recipeId: 'a', ingredient: ing('Onions', 200, 'g'), factor: 1 },
      { recipeId: 'b', ingredient: ing('onion', 0.5, 'kg'), factor: 2 },
      { recipeId: 'b', ingredient: ing('Garlic', 3, 'cloves'), factor: 2 },
      { recipeId: 'c', ingredient: ing('garlic', 2, 'clove'), factor: 1 },
    ]);
    const onion = items.find((i) => normalizeName(i.name) === 'onion')!;
    expect(onion.quantity).toBe(1200);
    expect(onion.unit).toBe('g');
    expect(onion.recipeIds).toEqual(['a', 'b']);
    const garlic = items.find((i) => normalizeName(i.name) === 'garlic')!;
    expect(garlic.quantity).toBe(8);
  });

  it('keeps "to taste" items once and skips optional garnish', () => {
    const items = aggregateIngredients([
      { recipeId: 'a', ingredient: ing('Salt', null, ''), factor: 1 },
      { recipeId: 'b', ingredient: ing('salt', null, ''), factor: 1 },
      { recipeId: 'b', ingredient: ing('Coriander', 1, 'tbsp', { optional: true }), factor: 1 },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: 'Salt', quantity: null });
  });
});

describe('mergeIntoList', () => {
  it('merges with unchecked items and leaves ticked ones alone', () => {
    const existing: ShoppingItem[] = [
      { id: '1', name: 'Tomatoes', quantity: 2, unit: '', category: 'produce', checked: false, recipeIds: ['a'], createdAt: '' },
      { id: '2', name: 'Rice', quantity: 500, unit: 'g', category: 'grains', checked: true, recipeIds: ['a'], createdAt: '' },
    ];
    let n = 0;
    const merged = mergeIntoList(
      existing,
      aggregateIngredients([
        { recipeId: 'b', ingredient: ing('tomato', 3, ''), factor: 1 },
        { recipeId: 'b', ingredient: { ...ing('Rice', 200, 'g'), category: 'produce' }, factor: 1 },
      ]),
      () => `new-${++n}`,
    );
    expect(merged.find((i) => i.id === '1')).toMatchObject({ quantity: 5, recipeIds: ['a', 'b'] });
    expect(merged.find((i) => i.id === '2')).toMatchObject({ quantity: 500, checked: true });
    expect(merged.find((i) => i.id === 'new-1')).toMatchObject({ name: 'Rice', quantity: 200 });
  });
});
