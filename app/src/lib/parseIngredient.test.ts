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
    ['2 cloves of garlic', { quantity: 2, unit: 'clove', name: 'Garlic', note: null }],
    ['2 cucharadas de aceite de oliva', { quantity: 2, unit: 'tbsp', name: 'Aceite de oliva', note: null }],
    ["2 c. à s. d'huile d'olive", { quantity: 2, unit: 'tbsp', name: "Huile d'olive", note: null }],
    ['2 EL Olivenöl', { quantity: 2, unit: 'tbsp', name: 'Olivenöl', note: null }],
    ['3 colheres de sopa de azeite', { quantity: 3, unit: 'tbsp', name: 'Azeite', note: null }],
    ['2 spicchi di aglio, tritati', { quantity: 2, unit: 'clove', name: 'Aglio', note: 'tritati' }],
    ['2 ملعقة كبيرة من زيت الزيتون', { quantity: 2, unit: 'tbsp', name: 'زيت الزيتون', note: null }],
    ['2 ملح', { quantity: 2, unit: '', name: 'ملح', note: null }],
    ['しょうゆ 大さじ2', { quantity: 2, unit: 'tbsp', name: 'しょうゆ', note: null }],
    ['鶏もも肉 ３００g', { quantity: 300, unit: 'g', name: '鶏もも肉', note: null }],
    ['卵 2個', { quantity: 2, unit: 'piece', name: '卵', note: null }],
    ['٢ كوب أرز', { quantity: 2, unit: 'cup', name: 'أرز', note: null }],
  ])('parses "%s"', (line, expected) => {
    expect(parseIngredientLine(line)).toEqual(expected);
  });

  it('skips blank lines', () => {
    expect(parseIngredientList('2 eggs\n\n  \n1 onion')).toHaveLength(2);
  });
});
