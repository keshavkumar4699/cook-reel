import { plural } from '../../catalog';

/** Aba Cardápio (cardápio da semana e lista de compras) e a folha "adicionar ao cardápio". */
export default {
  header: {
    planSubtitle: 'Suas refeições da semana',
    toBuy: plural({ one: '{count} item para comprar', other: '{count} itens para comprar' }),
    allSet: 'Tudo certo por enquanto',
    mealPlanTab: 'Cardápio',
    shoppingTab: 'Compras',
    shoppingTabCount: 'Compras · {count}',
  },
  week: {
    previous: 'Semana anterior',
    next: 'Próxima semana',
  },
  summary: {
    kcalGoal: '/ {target} kcal',
    proteinGoal: '/ {target} de proteína',
  },
  addToSlot: {
    breakfast: 'Adicionar café da manhã',
    lunch: 'Adicionar almoço',
    dinner: 'Adicionar jantar',
    snack: 'Adicionar lanche',
  },
  removeFromPlan: 'Remover do cardápio',
  shopWeek: {
    button: 'Fazer as compras da semana',
    empty: 'Planeje algumas refeições primeiro e depois compre tudo com um toque.',
    added: plural({ one: '{count} item novo adicionado para esta semana', other: '{count} itens novos adicionados para esta semana' }),
  },
  picker: {
    title: 'Escolha uma receita',
    searchPlaceholder: 'Buscar nas suas receitas',
    cookLater: 'Cozinhar depois',
  },
  shopping: {
    addPlaceholder: 'Adicionar um item…',
    progress: plural({ one: '{done} de {count} item', other: '{done} de {count} itens' }),
    clearTicked: 'Limpar marcados',
    removeItem: 'Remover {name}',
    emptyTitle: 'Sua lista está vazia',
    emptyBody: 'Adicione ingredientes de qualquer receita ou planeje a semana e compre tudo com um toque.',
  },
  addSheet: {
    title: 'Adicionar ao cardápio',
    servings: 'Porções',
    add: 'Adicionar',
    plannedToday: 'Planejado para hoje · {slot}',
    plannedOn: 'Planejado para {day} · {slot}',
  },
} as const;
