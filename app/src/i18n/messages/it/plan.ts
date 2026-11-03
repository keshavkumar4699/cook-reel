import { plural } from '../../catalog';

export default {
  header: {
    planSubtitle: 'I pasti della tua settimana',
    toBuy: plural({ one: '{count} articolo da comprare', other: '{count} articoli da comprare' }),
    allSet: 'Per ora hai tutto',
    mealPlanTab: 'Pasti',
    shoppingTab: 'Spesa',
    shoppingTabCount: 'Spesa · {count}',
  },
  week: {
    previous: 'Settimana precedente',
    next: 'Settimana successiva',
  },
  summary: {
    kcalGoal: '/ {target} kcal',
    proteinGoal: '/ {target} di proteine',
  },
  addToSlot: {
    breakfast: 'Aggiungi colazione',
    lunch: 'Aggiungi pranzo',
    dinner: 'Aggiungi cena',
    snack: 'Aggiungi spuntino',
  },
  removeFromPlan: 'Rimuovi dal piano',
  shopWeek: {
    button: 'Fai la spesa per la settimana',
    empty: 'Pianifica prima qualche pasto, poi fai la spesa per tutti con un tocco.',
    added: plural({ one: '{count} nuovo articolo aggiunto per questa settimana', other: '{count} nuovi articoli aggiunti per questa settimana' }),
  },
  picker: {
    title: 'Scegli una ricetta',
    searchPlaceholder: 'Cerca nel ricettario',
    cookLater: 'Da cucinare',
  },
  shopping: {
    addPlaceholder: 'Aggiungi un articolo…',
    progress: plural({ one: '{done} di {count} articolo', other: '{done} di {count} articoli' }),
    clearTicked: 'Togli gli spuntati',
    removeItem: 'Rimuovi {name}',
    emptyTitle: 'La tua lista è vuota',
    emptyBody: 'Aggiungi ingredienti da qualsiasi ricetta, oppure pianifica la settimana e fai la spesa con un tocco.',
  },
  addSheet: {
    title: 'Aggiungi al piano pasti',
    servings: 'Porzioni',
    add: 'Aggiungi al piano',
    plannedToday: 'In programma oggi · {slot}',
    plannedOn: 'In programma {day} · {slot}',
  },
} as const;
