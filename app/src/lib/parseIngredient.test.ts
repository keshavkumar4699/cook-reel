import { parseIngredientLine, parseIngredientList } from './parseIngredient';

describe('parseIngredientLine', () => {
  it.each([
    ['2 cups basmati rice', { quantity: 2, unit: 'cup', name: 'Basmati rice', note: null }],
    ['½ tsp salt', { quantity: 0.5, unit: 'tsp', name: 'Salt', note: null }],
    ['1 1/2 tablespoons ghee', { quantity: 1.5, unit: 'tbsp', name: 'Ghee', note: null }],
    ['200g paneer, cubed', { quantity: 200, unit: 'g', name: 'Paneer', note: 'cubed' }],
    ['- 3 eggs', { quantity: 3, unit: '', name: 'Eggs', note: null }],
    ['• 2-3 green chillies, slit', { quantity: 3, unit: '', name: 'Green chillies', note: 'slit' }],
    ['1. 400 ml coconut milk', { quantity: 400, unit: 'ml', name: 'Coconut milk', note: null }],
    ['Salt to taste', { quantity: null, unit: '', name: 'Salt to taste', note: null }],
    ['2 cloves of garlic', { quantity: 2, unit: 'cloves', name: 'Garlic', note: null }],
  ])('parses "%s"', (line, expected) => {
    expect(parseIngredientLine(line)).toEqual(expected);
  });

  it('skips blank lines', () => {
    expect(parseIngredientList('2 eggs\n\n  \n1 onion')).toHaveLength(2);
  });
});
