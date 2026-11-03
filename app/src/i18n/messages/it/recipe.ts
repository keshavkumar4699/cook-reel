import { plural } from '../../catalog';

export default {
  notFound: {
    title: 'Ricetta non trovata',
    body: 'Potrebbe essere stata eliminata.',
    action: 'Torna al ricettario',
  },
  youtubeShort: 'Short',
  variationOf: 'Variante di {title}',
  stats: {
    totalTime: 'Tempo totale',
    kcalPerServing: 'kcal / porzione',
    protein: 'Proteine',
  },
  badges: {
    mealPrep: 'Meal prep',
    costPerServing: '{price} / porzione',
  },
  changes: {
    title: 'Cosa è cambiato',
  },
  servings: {
    title: 'Porzioni',
    asWritten: 'Come da ricetta',
    scaled: 'Dosi adattate ×{factor}',
  },
  sections: {
    equipment: 'Occorrente',
    ingredients: 'Ingredienti',
    addToList: 'Metti in lista',
    ingredientsHint: 'Tocca per spuntare quello che hai già.',
    method: 'Procedimento',
    storage: 'Conservazione',
  },
  experiment: {
    title: 'Sperimenta',
    variations: plural({ one: '{count} variante', other: '{count} varianti' }),
    create: 'Crea una variante',
    headline: 'Falla a modo tuo',
    body: 'Vegana, più proteica, in friggitrice ad aria, più economica… Chef la riscrive per te.',
    variation: 'Variante',
  },
  notes: {
    title: 'Le tue note',
    placeholder: 'Meno peperoncino la prossima volta, una spruzzata di lime…',
  },
  rating: {
    title: 'Com’era?',
    rate: plural({ one: 'Valuta {count} su 5', other: 'Valuta {count} su 5' }),
    timesCooked: plural({ one: 'Cucinata {count} volta', other: 'Cucinata {count} volte' }),
  },
  cookLater: {
    save: 'Salva in «Da cucinare»',
    add: 'Da cucinare',
    remove: 'Rimuovi da «Da cucinare»',
    saved: 'Salvata in «Da cucinare»',
    removed: 'Rimossa da «Da cucinare»',
  },
  menu: {
    more: 'Altro',
    edit: 'Modifica ricetta',
    addToCollection: 'Aggiungi a una raccolta',
    addToPlan: 'Aggiungi al piano pasti',
    addToShopping: 'Aggiungi gli ingredienti alla lista della spesa',
    share: 'Condividi ricetta',
    delete: 'Elimina ricetta',
  },
  deleteConfirm: {
    title: 'Eliminare questa ricetta?',
    message: 'Verrà rimossa da questo telefono.',
  },
  toasts: {
    addedToShopping: plural({ one: '{count} articolo aggiunto alla lista della spesa', other: '{count} articoli aggiunti alla lista della spesa' }),
    shoppingUpdated: 'Lista della spesa aggiornata',
    view: 'Vedi',
    deleted: 'Ricetta eliminata',
  },
  cta: {
    experiment: 'Sperimenta',
    startCooking: 'Inizia a cucinare',
    narratedClips: 'Clip narrate',
    videoClips: 'Clip video',
    voiceGuided: 'Guida vocale',
  },

  facts: {
    kcal: '{n} kcal',
    protein: '{n} g proteine',
  },

  nutrition: {
    title: 'Valori nutrizionali',
    kcalUnit: 'kcal',
    serving: 'Porzione',
    allServings: plural({ one: 'Totale', other: 'Tutte e {count}' }),
    barLabel: 'Calorie per macronutriente',
    protein: 'Proteine',
    carbs: 'Carboidrati',
    fat: 'Grassi',
    fibre: 'Fibre',
    disclaimer: 'Stime basate su dati nutrizionali standard. I valori cambiano in base a marche e porzioni.',
  },

  ingredients: {
    line: '{name} {quantity}',
    optional: 'facoltativo',
    toTaste: 'q.b.',
    swapWith: 'In alternativa: {items}',
    substitutesFor: 'Alternative a {name}',
  },

  steps: {
    doneWhen: 'Pronto quando',
    clipRange: '{start}–{end}',
    glossaryTerm: '{term}:',
  },
} as const;
