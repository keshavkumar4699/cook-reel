import { plural } from '../../catalog';

/** recipe screen strings. */
export default {
  // Recipe detail screen (app/recipe/[id])
  notFound: {
    title: 'Rezept nicht gefunden',
    body: 'Vielleicht wurde es gelöscht.',
    action: 'Zurück zum Kochbuch',
  },
  youtubeShort: 'Short',
  variationOf: 'Variante von {title}',
  stats: {
    totalTime: 'Gesamtzeit',
    kcalPerServing: 'kcal / Portion',
    protein: 'Protein',
  },
  badges: {
    mealPrep: 'Meal Prep',
    costPerServing: '{price} / Portion',
  },
  changes: {
    title: 'Was sich geändert hat',
  },
  servings: {
    title: 'Portionen',
    asWritten: 'Wie im Rezept',
    scaled: 'Mengen ×{factor} angepasst',
  },
  sections: {
    equipment: 'Das brauchst du',
    ingredients: 'Zutaten',
    addToList: 'Zur Liste',
    ingredientsHint: 'Hake ab, was du schon da hast.',
    method: 'Zubereitung',
    storage: 'Reste aufbewahren',
  },
  experiment: {
    title: 'Experiment',
    variations: plural({ one: '{count} Variante', other: '{count} Varianten' }),
    create: 'Variante erstellen',
    headline: 'Mach’s zu deinem Rezept',
    body: 'Vegan, mehr Protein, Airfryer, günstiger … Chef schreibt es um.',
    variation: 'Variante',
  },
  notes: {
    title: 'Deine Notizen',
    placeholder: 'Nächstes Mal weniger Chili, dafür ein Spritzer Limette …',
  },
  rating: {
    title: 'Wie war’s?',
    rate: plural({ one: 'Mit {count} von 5 bewerten', other: 'Mit {count} von 5 bewerten' }),
    timesCooked: plural({ one: '{count}-mal gekocht', other: '{count}-mal gekocht' }),
  },
  cookLater: {
    save: 'Zu „Später kochen“ hinzufügen',
    add: 'Später kochen',
    remove: 'Aus „Später kochen“ entfernen',
    saved: 'Zu „Später kochen“ hinzugefügt',
    removed: 'Aus „Später kochen“ entfernt',
  },
  menu: {
    more: 'Mehr',
    edit: 'Rezept bearbeiten',
    addToCollection: 'Zu Sammlung hinzufügen',
    addToPlan: 'Zum Essensplan hinzufügen',
    addToShopping: 'Zutaten auf die Einkaufsliste',
    share: 'Rezept teilen',
    delete: 'Rezept löschen',
  },
  deleteConfirm: {
    title: 'Dieses Rezept löschen?',
    message: 'Es wird von diesem Handy entfernt.',
  },
  toasts: {
    addedToShopping: plural({ one: '{count} Artikel zur Einkaufsliste hinzugefügt', other: '{count} Artikel zur Einkaufsliste hinzugefügt' }),
    shoppingUpdated: 'Einkaufsliste aktualisiert',
    view: 'Ansehen',
    deleted: 'Rezept gelöscht',
  },
  cta: {
    experiment: 'Experiment',
    startCooking: 'Loskochen',
    narratedClips: 'Vertonte Clips',
    videoClips: 'Videoclips',
    voiceGuided: 'Sprachgeführt',
  },

  // Recipe cards, rows and previews
  facts: {
    kcal: '{n} kcal',
    protein: '{n} g Protein',
  },

  // Nutrition card
  nutrition: {
    title: 'Nährwerte',
    kcalUnit: 'kcal',
    serving: 'Portion',
    allServings: plural({ one: 'Gesamt', other: 'Alle {count}' }),
    barLabel: 'Kalorien nach Makronährstoffen',
    protein: 'Protein',
    carbs: 'Kohlenh.',
    fat: 'Fett',
    fibre: 'Ballastst.',
    disclaimer: 'Geschätzt anhand von Standard-Nährwertdaten. Die Werte schwanken je nach Marke und Portionsgröße.',
  },

  // Ingredient checklist
  ingredients: {
    line: '{quantity} {name}',
    optional: 'optional',
    toTaste: 'nach Geschmack',
    swapWith: 'Alternativ: {items}',
    substitutesFor: 'Alternativen zu {name}',
  },

  // Step list
  steps: {
    doneWhen: 'So erkennst du’s:',
    clipRange: '{start}–{end}',
    glossaryTerm: '{term}:',
  },
} as const;
