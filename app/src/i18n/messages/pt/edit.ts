import { plural } from '../../catalog';

/** Textos da tela de edição. */
export default {
  titleEdit: 'Editar receita',
  titleNew: 'Nova receita',
  fields: {
    name: 'Nome da receita',
    namePlaceholder: 'Feijão da mamãe',
    description: 'Descrição',
    descriptionPlaceholder: 'O que ela tem de especial?',
    servings: 'Porções',
    prep: 'Preparo (min)',
    cook: 'Cozimento (min)',
    difficulty: 'Dificuldade',
    tags: 'Tags',
    tagsPlaceholder: 'rápida, proteica, caseira',
  },
  ingredients: {
    title: 'Ingredientes',
    quantity: 'Qtd.',
    unit: 'Unid.',
    name: 'Ingrediente',
    remove: 'Remover ingrediente',
    add: 'Adicionar ingrediente',
  },
  steps: {
    title: 'Passos',
    placeholder: 'O que fazer neste passo',
    timer: 'Timer (min)',
    keepsClip: 'Mantém o clipe do vídeo',
    remove: 'Remover passo',
    add: 'Adicionar passo',
  },
  defaultStepTitle: 'Passo {n}',
  nutrition: {
    title: 'Nutrição por porção',
    hint: 'Opcional — preencha o que souber.',
    kcal: 'kcal',
    protein: 'Proteína (g)',
    carbs: 'Carbo (g)',
    fat: 'Gordura (g)',
  },
  errors: {
    noTitle: 'Dê um nome à sua receita.',
    noIngredients: 'Adicione pelo menos um ingrediente.',
    noSteps: 'Adicione pelo menos um passo.',
  },
  saveChanges: 'Salvar alterações',
  saveRecipe: 'Salvar receita',
  toasts: {
    updated: 'Receita atualizada',
    saved: 'Receita salva nas suas receitas',
  },
  paste: {
    open: 'Colar lista',
    title: 'Colar ingredientes',
    subtitle: 'Um por linha — “2 xícaras de arroz”, “½ colher de chá de sal”, “200 g de paneer em cubos”',
    placeholder: '2 xícaras de arroz basmati\n1 colher de sopa de ghee\n½ colher de chá de cúrcuma',
    add: 'Adicionar todos',
    added: plural({ one: '{count} ingrediente adicionado', other: '{count} ingredientes adicionados' }),
  },
} as const;
