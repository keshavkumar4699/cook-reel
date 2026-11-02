import { plural } from '../../catalog';

/** Library screen and recipe collections. */
export default {
  subtitle: plural({ one: '{count} Rezept auf diesem Handy gespeichert', other: '{count} Rezepte auf diesem Handy gespeichert' }),
  newRecipe: 'Neues Rezept',
  search: {
    placeholder: 'Rezepte, Zutaten, Tags suchen',
    clear: 'Suche löschen',
  },
  filters: {
    all: 'Alle',
    cookLater: 'Später kochen',
    mine: 'Meine',
    variations: 'Varianten',
    quick: '≤ {duration}',
    protein: 'Proteinreich',
    light: 'Unter {kcal} kcal',
    mealPrep: 'Meal Prep',
  },
  collections: {
    new: 'Neue Sammlung',
    delete: 'Sammlung löschen',
  },
  newCollection: {
    title: 'Neue Sammlung',
    subtitle: 'Sortiere Rezepte, wie du magst – „Wochenende“, „Kinder“, „Festtage“ …',
    namePlaceholder: 'Name der Sammlung',
    create: 'Sammlung erstellen',
    hint: 'Rezepte fügst du über das •••-Menü eines Rezepts hinzu.',
  },
  noResults: {
    title: 'Keine Treffer',
    body: 'Probier eine andere Suche oder einen anderen Filter.',
  },
  emptyLibrary: {
    title: 'Hier beginnt dein Kochbuch',
    body: 'Speichere Rezepte von YouTube, erstelle sie mit Chef oder schreib deine eigenen.',
    action: 'Rezept hinzufügen',
  },
  collectionSheet: {
    title: 'Sammlungen',
    subtitle: 'Tippen zum Hinzufügen oder Entfernen',
    empty: 'Noch keine Sammlungen – erstelle deine erste.',
    newPlaceholder: 'Neue Sammlung',
  },
} as const;
