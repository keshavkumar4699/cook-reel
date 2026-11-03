import { plural } from '../../catalog';

export default {
  subtitle: plural({ one: '{count} ricetta salvata su questo telefono', other: '{count} ricette salvate su questo telefono' }),
  newRecipe: 'Nuova ricetta',
  search: {
    placeholder: 'Cerca ricette, ingredienti, tag',
    clear: 'Cancella la ricerca',
  },
  filters: {
    all: 'Tutte',
    cookLater: 'Da cucinare',
    mine: 'Le mie',
    variations: 'Varianti',
    quick: '≤ {duration}',
    protein: 'Proteiche',
    light: 'Sotto {kcal} kcal',
    mealPrep: 'Meal prep',
  },
  collections: {
    new: 'Nuova raccolta',
    delete: 'Elimina raccolta',
  },
  newCollection: {
    title: 'Nuova raccolta',
    subtitle: 'Raggruppa le ricette come vuoi: «Weekend», «Bambini», «Feste»…',
    namePlaceholder: 'Nome della raccolta',
    create: 'Crea raccolta',
    hint: 'Aggiungi ricette dal menu ••• di qualsiasi ricetta.',
  },
  noResults: {
    title: 'Nessun risultato',
    body: 'Prova un’altra ricerca o un altro filtro.',
  },
  emptyLibrary: {
    title: 'Il tuo ricettario inizia qui',
    body: 'Salva ricette da YouTube, creale con Chef o scrivi le tue.',
    action: 'Aggiungi una ricetta',
  },
  collectionSheet: {
    title: 'Raccolte',
    subtitle: 'Tocca per aggiungere o rimuovere',
    empty: 'Ancora nessuna raccolta: crea la prima.',
    newPlaceholder: 'Nuova raccolta',
  },
} as const;
