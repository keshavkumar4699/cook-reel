import { plural } from '../../catalog';

/** edit screen strings. */
export default {
  titleEdit: 'Rezept bearbeiten',
  titleNew: 'Neues Rezept',
  fields: {
    name: 'Rezeptname',
    namePlaceholder: 'Mamas Linseneintopf',
    description: 'Beschreibung',
    descriptionPlaceholder: 'Was macht es besonders?',
    servings: 'Portionen',
    prep: 'Vorb. (Min.)',
    cook: 'Kochen (Min.)',
    difficulty: 'Schwierigkeit',
    tags: 'Tags',
    tagsPlaceholder: 'schnell, proteinreich, wohlfühlessen',
  },
  ingredients: {
    title: 'Zutaten',
    quantity: 'Menge',
    unit: 'Einheit',
    name: 'Zutat',
    remove: 'Zutat entfernen',
    add: 'Zutat hinzufügen',
  },
  steps: {
    title: 'Schritte',
    placeholder: 'Was ist in diesem Schritt zu tun?',
    timer: 'Timer (Min.)',
    keepsClip: 'Behält seinen Videoclip',
    remove: 'Schritt entfernen',
    add: 'Schritt hinzufügen',
  },
  defaultStepTitle: 'Schritt {n}',
  nutrition: {
    title: 'Nährwerte pro Portion',
    hint: 'Optional – trag ein, was du weißt.',
    kcal: 'kcal',
    protein: 'Protein (g)',
    carbs: 'Kohlenh. (g)',
    fat: 'Fett (g)',
  },
  errors: {
    noTitle: 'Gib deinem Rezept einen Namen.',
    noIngredients: 'Füge mindestens eine Zutat hinzu.',
    noSteps: 'Füge mindestens einen Schritt hinzu.',
  },
  saveChanges: 'Änderungen speichern',
  saveRecipe: 'Rezept speichern',
  toasts: {
    updated: 'Rezept aktualisiert',
    saved: 'Rezept in deinem Kochbuch gespeichert',
  },
  // Paste-a-list sheet
  paste: {
    open: 'Liste einfügen',
    title: 'Zutaten einfügen',
    subtitle: 'Eine pro Zeile – „250 g Reis“, „½ TL Salz“, „200 g Paneer, gewürfelt“',
    placeholder: '250 g Basmatireis\n1 EL Ghee\n½ TL Kurkuma',
    add: 'Übernehmen',
    added: plural({ one: '{count} Zutat hinzugefügt', other: '{count} Zutaten hinzugefügt' }),
  },
} as const;
