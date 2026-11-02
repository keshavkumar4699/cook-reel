import { plural } from '../../catalog';

/** Textos da tela de receita. */
export default {
  notFound: {
    title: 'Receita não encontrada',
    body: 'Ela pode ter sido excluída.',
    action: 'Voltar às receitas',
  },
  youtubeShort: 'Short',
  variationOf: 'Variação de {title}',
  stats: {
    totalTime: 'Tempo total',
    kcalPerServing: 'kcal / porção',
    protein: 'Proteína',
  },
  badges: {
    mealPrep: 'Marmita',
    costPerServing: '{price} / porção',
  },
  changes: {
    title: 'O que mudou',
  },
  servings: {
    title: 'Porções',
    asWritten: 'Como na receita',
    scaled: 'Quantidades ajustadas ×{factor}',
  },
  sections: {
    equipment: 'Você vai precisar de',
    ingredients: 'Ingredientes',
    addToList: 'Pôr na lista',
    ingredientsHint: 'Toque para marcar o que você já tem.',
    method: 'Modo de preparo',
    storage: 'Como guardar as sobras',
  },
  experiment: {
    title: 'Experimentar',
    variations: plural({ one: '{count} variação', other: '{count} variações' }),
    create: 'Criar uma variação',
    headline: 'Deixe com a sua cara',
    body: 'Vegana, mais proteica, na air fryer, mais barata… o Chef reescreve.',
    variation: 'Variação',
  },
  notes: {
    title: 'Suas anotações',
    placeholder: 'Menos pimenta da próxima vez, um pouco de limão…',
  },
  rating: {
    title: 'Como ficou?',
    rate: plural({ one: 'Dar {count} de 5', other: 'Dar {count} de 5' }),
    timesCooked: plural({ one: 'Feita {count} vez', other: 'Feita {count} vezes' }),
  },
  cookLater: {
    save: 'Salvar para cozinhar depois',
    add: 'Cozinhar depois',
    remove: 'Remover de Cozinhar depois',
    saved: 'Salva em Cozinhar depois',
    removed: 'Removida de Cozinhar depois',
  },
  menu: {
    more: 'Mais',
    edit: 'Editar receita',
    addToCollection: 'Adicionar a uma coleção',
    addToPlan: 'Adicionar ao cardápio',
    addToShopping: 'Adicionar ingredientes à lista de compras',
    share: 'Compartilhar receita',
    delete: 'Excluir receita',
  },
  deleteConfirm: {
    title: 'Excluir esta receita?',
    message: 'Ela será removida deste celular.',
  },
  toasts: {
    addedToShopping: plural({ one: '{count} item adicionado à sua lista de compras', other: '{count} itens adicionados à sua lista de compras' }),
    shoppingUpdated: 'Lista de compras atualizada',
    view: 'Ver',
    deleted: 'Receita excluída',
  },
  cta: {
    experiment: 'Experimentar',
    startCooking: 'Começar a cozinhar',
    narratedClips: 'Clipes narrados',
    videoClips: 'Clipes do vídeo',
    voiceGuided: 'Guiada por voz',
  },

  facts: {
    kcal: '{n} kcal',
    protein: '{n} g de proteína',
  },

  nutrition: {
    title: 'Nutrição',
    kcalUnit: 'kcal',
    serving: 'Porção',
    allServings: plural({ one: '{count} porção', other: '{count} porções' }),
    barLabel: 'Calorias por macronutriente',
    protein: 'Proteína',
    carbs: 'Carbo',
    fat: 'Gordura',
    fibre: 'Fibras',
    disclaimer: 'Estimativa com base em tabelas nutricionais padrão. Os valores variam conforme a marca e o tamanho da porção.',
  },

  ingredients: {
    line: '{quantity} {name}',
    optional: 'opcional',
    toTaste: 'a gosto',
    swapWith: 'Troque por: {items}',
    substitutesFor: 'Substitutos para {name}',
  },

  steps: {
    doneWhen: 'Pronto quando',
    clipRange: '{start}–{end}',
    glossaryTerm: '{term}:',
  },
} as const;
