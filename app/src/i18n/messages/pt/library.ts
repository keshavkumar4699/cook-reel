import { plural } from '../../catalog';

/** Tela de receitas e coleções. */
export default {
  subtitle: plural({ one: '{count} receita salva neste celular', other: '{count} receitas salvas neste celular' }),
  newRecipe: 'Nova receita',
  search: {
    placeholder: 'Buscar receitas, ingredientes, tags',
    clear: 'Limpar busca',
  },
  filters: {
    all: 'Todas',
    cookLater: 'Cozinhar depois',
    mine: 'Minhas',
    variations: 'Variações',
    quick: '≤ {duration}',
    protein: 'Proteicas',
    light: 'Até {kcal} kcal',
    mealPrep: 'Marmita',
  },
  collections: {
    new: 'Nova coleção',
    delete: 'Excluir coleção',
  },
  newCollection: {
    title: 'Nova coleção',
    subtitle: 'Organize as receitas do seu jeito — “Fim de semana”, “Crianças”, “Festas”…',
    namePlaceholder: 'Nome da coleção',
    create: 'Criar coleção',
    hint: 'Adicione receitas pelo menu ••• de qualquer receita.',
  },
  noResults: {
    title: 'Nada encontrado',
    body: 'Tente outra busca ou outro filtro.',
  },
  emptyLibrary: {
    title: 'Seu livro de receitas começa aqui',
    body: 'Salve receitas do YouTube, crie com o Chef ou escreva as suas.',
    action: 'Adicionar receita',
  },
  collectionSheet: {
    title: 'Coleções',
    subtitle: 'Toque para adicionar ou remover',
    empty: 'Nenhuma coleção ainda — crie a primeira.',
    newPlaceholder: 'Nova coleção',
  },
} as const;
